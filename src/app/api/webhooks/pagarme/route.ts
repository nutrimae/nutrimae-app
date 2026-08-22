import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser, savePhoneNumber } from "@/lib/webhooks/find-or-create-user";
import { claimWebhookEvent, finalizeWebhookEvent } from "@/lib/webhooks/log-event";
import { isKnownProductKey } from "@/lib/products";

/**
 * Webhook do Pagar.me — única fonte de verdade pra liberar/suspender
 * acesso. A resposta do checkout (aprovação síncrona de cartão, por
 * exemplo) NUNCA libera acesso sozinha; só este webhook grava em
 * "user_products".
 *
 * Autenticação: confirmada direto no painel do Pagar.me (Configurações →
 * Webhooks → "Habilitar autenticação") — é HTTP Basic Auth com um
 * usuário/senha que a gente mesmo escolhe ao cadastrar o webhook (não é
 * assinatura HMAC, como uma doc mais antiga sugeria). PAGARME_WEBHOOK_USER
 * e PAGARME_WEBHOOK_PASSWORD precisam ser os MESMOS valores cadastrados
 * no painel. Sem eles configurados, a rota rejeita tudo (fail-closed).
 *
 * Idempotência: ver src/lib/webhooks/log-event.ts claimWebhookEvent() — o
 * evento é reivindicado por (provider, provider_event_id) ANTES de
 * processar; entrega duplicada do mesmo evento não reprocessa nem duplica
 * acesso.
 */

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function verifyBasicAuth(authorizationHeader: string | null): boolean {
  const expectedUser = process.env.PAGARME_WEBHOOK_USER;
  const expectedPassword = process.env.PAGARME_WEBHOOK_PASSWORD;
  if (!expectedUser || !expectedPassword || !authorizationHeader?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(authorizationHeader.slice("Basic ".length), "base64").toString("utf8");
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return timingSafeStringEqual(user, expectedUser) && timingSafeStringEqual(password, expectedPassword);
}

interface PagarmeWebhookPayload {
  id?: unknown;
  type?: unknown;
  created_at?: unknown;
  data?: {
    id?: unknown;
    order_id?: unknown;
    order?: { id?: unknown };
    status?: unknown;
    charges?: Array<{ id?: unknown; status?: unknown }>;
  };
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function markOrderStatus(
  admin: AdminClient,
  params: { pagarmeOrderId?: string; pagarmeChargeId?: string; status: string; rawEvent: unknown },
) {
  let orderRow: { id: string; customer_id: string; offer_id: string; user_id: string | null } | null = null;

  if (params.pagarmeOrderId) {
    const { data } = await admin
      .from("orders")
      .select("id, customer_id, offer_id, user_id")
      .eq("pagarme_order_id", params.pagarmeOrderId)
      .maybeSingle();
    orderRow = data;
  }

  if (!orderRow && params.pagarmeChargeId) {
    const { data } = await admin
      .from("payments")
      .select("orders(id, customer_id, offer_id, user_id)")
      .eq("pagarme_charge_id", params.pagarmeChargeId)
      .maybeSingle();
    // Supabase retorna o relacionamento como objeto quando a FK é 1:1 pela query acima.
    orderRow = (data?.orders as unknown as typeof orderRow) ?? null;
  }

  if (!orderRow) {
    console.error("[pagarme-webhook] pedido não encontrado localmente", params);
    return null;
  }

  await admin.from("orders").update({ status: params.status, updated_at: new Date().toISOString() }).eq("id", orderRow.id);

  if (params.pagarmeChargeId) {
    await admin
      .from("payments")
      .update({ status: params.status, raw_last_event: params.rawEvent, updated_at: new Date().toISOString() })
      .eq("order_id", orderRow.id);
  }

  return orderRow;
}

async function grantAccessForOrder(
  admin: AdminClient,
  orderRow: { id: string; customer_id: string; offer_id: string; user_id: string | null },
) {
  const { data: offer } = await admin.from("offers").select("product_key, name").eq("id", orderRow.offer_id).maybeSingle();
  const { data: customer } = await admin.from("customers").select("email, phone_number").eq("id", orderRow.customer_id).maybeSingle();

  if (!offer || !customer) {
    console.error("[pagarme-webhook] oferta/cliente ausente ao liberar acesso", orderRow);
    return;
  }

  if (!isKnownProductKey(offer.product_key)) {
    console.error("[pagarme-webhook] product_key desconhecido na oferta", offer.product_key);
    return;
  }

  const { userId } = await findOrCreateUser(admin, customer.email);

  await admin.from("customers").update({ user_id: userId }).eq("id", orderRow.customer_id);
  await admin.from("orders").update({ user_id: userId }).eq("id", orderRow.id);

  if (customer.phone_number) {
    await savePhoneNumber(admin, userId, customer.phone_number);
  }

  await admin.from("user_products").upsert(
    {
      user_id: userId,
      product_id: offer.product_key,
      product_name: offer.name,
      status: "active",
      canceled_at: null,
    },
    { onConflict: "user_id,product_id" },
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyBasicAuth(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  let payload: PagarmeWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventId = typeof payload.id === "string" ? payload.id : null;
  const eventType = typeof payload.type === "string" ? payload.type : null;

  if (!eventId || !eventType) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const claim = await claimWebhookEvent(admin, {
    provider: "pagarme",
    providerEventId: eventId,
    eventType,
    payload,
  });

  if (!claim.claimed) {
    // Já processado antes — responde OK sem reprocessar (idempotência).
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    const data = payload.data ?? {};
    const pagarmeOrderId =
      typeof data.id === "string" && eventType.startsWith("order.")
        ? data.id
        : typeof data.order_id === "string"
          ? data.order_id
          : typeof data.order?.id === "string"
            ? data.order.id
            : undefined;
    const pagarmeChargeId =
      typeof data.id === "string" && eventType.startsWith("charge.") ? data.id : undefined;

    switch (eventType) {
      case "order.paid":
      case "charge.paid": {
        const orderRow = await markOrderStatus(admin, {
          pagarmeOrderId,
          pagarmeChargeId,
          status: "paid",
          rawEvent: payload,
        });
        if (orderRow) await grantAccessForOrder(admin, orderRow);
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "order.payment_failed":
      case "charge.payment_failed": {
        // Cobre tanto cartão recusado quanto Pix não pago dentro do prazo —
        // o evento confirmado na doc não distingue os dois; nunca escreve
        // em user_products aqui (acesso nunca foi concedido, nada a revogar).
        await markOrderStatus(admin, { pagarmeOrderId, pagarmeChargeId, status: "refused", rawEvent: payload });
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "charge.refunded":
      case "charge.chargedback": {
        await markOrderStatus(admin, { pagarmeOrderId, pagarmeChargeId, status: "refunded", rawEvent: payload });
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "subscription.created":
      case "subscription.canceled":
        // Fase de assinatura ainda não exposta no checkout público — sem
        // "offers" active=true apontando pra recorrência, este evento não
        // deveria chegar em produção ainda. Loga e ignora com segurança.
        await finalizeWebhookEvent(admin, claim.logId, { status: "ignored" });
        break;

      default:
        await finalizeWebhookEvent(admin, claim.logId, { status: "ignored" });
    }
  } catch (err) {
    console.error("[pagarme-webhook] falha ao processar evento", eventType, err);
    await finalizeWebhookEvent(admin, claim.logId, {
      status: "error",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    // Responde 200 mesmo assim: o evento já foi reivindicado (idempotência),
    // e um 5xx faria o Pagar.me reenviar o MESMO evento (que já falhamos em
    // processar por outro motivo, não por não tê-lo recebido) — o log de
    // erro é o lugar certo pra investigar, não um retry automático infinito.
  }

  return NextResponse.json({ ok: true });
}
