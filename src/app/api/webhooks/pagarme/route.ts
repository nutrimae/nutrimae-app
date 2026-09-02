import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser, savePhoneNumber } from "@/lib/webhooks/find-or-create-user";
import { claimWebhookEvent, finalizeWebhookEvent } from "@/lib/webhooks/log-event";
import { isKnownProductKey } from "@/lib/products";
import { emitFinancialTrackingEvent } from "@/lib/tracking/financial";
import { bestEffortReportOrderToUtmify } from "@/lib/utmify/orders";
// eslint-disable-next-line @typescript-eslint/no-require-imports -- meta-conversion.js é CommonJS solto na raiz do repo (ver MÁQUINA_LOW_TICKET_BR.md).
const { sendPurchaseEvent } = require("../../../../../meta-conversion.js");

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
    status?: unknown;
    charges?: Array<{ id?: unknown; status?: unknown }>;
    subscription?: { id?: unknown };
    subscription_id?: unknown;
    next_billing_at?: unknown;
    metadata?: { order_id?: unknown };
    order?: { id?: unknown; metadata?: { order_id?: unknown } };
  };
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function markOrderStatus(
  admin: AdminClient,
  params: { localOrderId?: string; pagarmeOrderId?: string; pagarmeChargeId?: string; status: string; rawEvent: unknown },
) {
  let orderRow: { id: string; customer_id: string; offer_id: string; user_id: string | null; amount_cents: number; metadata: Record<string, unknown> | null; status: string; fbc: string | null; fbp: string | null; client_ip: string | null; client_user_agent: string | null } | null = null;

  if (params.localOrderId) {
    const { data } = await admin.from("orders").select("id, customer_id, offer_id, user_id, amount_cents, metadata, status, fbc, fbp, client_ip, client_user_agent").eq("id", params.localOrderId).maybeSingle();
    orderRow = data;
  }

  if (!orderRow && params.pagarmeOrderId) {
    const { data } = await admin
      .from("orders")
      .select("id, customer_id, offer_id, user_id, amount_cents, metadata, status, fbc, fbp, client_ip, client_user_agent")
      .eq("pagarme_order_id", params.pagarmeOrderId)
      .maybeSingle();
    orderRow = data;
  }

  if (!orderRow && params.pagarmeChargeId) {
    const { data } = await admin
      .from("payments")
      .select("orders(id, customer_id, offer_id, user_id, amount_cents, metadata, status, fbc, fbp, client_ip, client_user_agent)")
      .eq("pagarme_charge_id", params.pagarmeChargeId)
      .maybeSingle();
    // Supabase retorna o relacionamento como objeto quando a FK é 1:1 pela query acima.
    orderRow = (data?.orders as unknown as typeof orderRow) ?? null;
  }

  if (!orderRow) {
    console.error("[pagarme-webhook] pedido não encontrado localmente", params);
    return null;
  }

  // Estado terminal nunca volta para pago/recusado por evento atrasado.
  if (orderRow.status === "refunded" && params.status !== "refunded") return null;
  // Uma falha atrasada não desfaz pagamento já confirmado.
  if (orderRow.status === "paid" && params.status === "refused") return null;

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
  orderRow: { id: string; customer_id: string; offer_id: string; user_id: string | null; amount_cents: number; metadata: Record<string, unknown> | null; status: string; fbc: string | null; fbp: string | null; client_ip: string | null; client_user_agent: string | null },
) {
  const { data: offer } = await admin.from("offers").select("slug, product_key, name, price_cents").eq("id", orderRow.offer_id).maybeSingle();
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

  // Bônus da oferta: quem compra o Anual já leva o SOS Desmame Noturno de
  // graça, embutido no valor do Anual (não é bump pago, por isso não soma
  // em expansionCreditCentavos abaixo).
  if (offer.slug === "nutrimae-anual") {
    await admin.from("user_products").upsert(
      {
        user_id: userId,
        product_id: "sos_desmame_noturno",
        product_name: "SOS Desmame Noturno (bônus do Anual)",
        status: "active",
        canceled_at: null,
      },
      { onConflict: "user_id,product_id" },
    );
  }

  // Um pedido pode ter mais de um item (o Anual + order bumps no mesmo
  // checkout) — cada item libera o produto correspondente, não só a oferta
  // principal do pedido. Sem isso, quem compra um bump nunca recebe acesso
  // a ele.
  const { data: items } = await admin
    .from("order_items")
    .select("total_amount_cents, offers(product_key, name)")
    .eq("order_id", orderRow.id);

  let expansionCreditCentavos = 0;

  for (const item of items ?? []) {
    const itemOffer = item.offers as unknown as { product_key?: string; name?: string } | null;
    if (!itemOffer?.product_key) continue;
    if (!isKnownProductKey(itemOffer.product_key)) {
      console.error("[pagarme-webhook] product_key desconhecido em order_items", itemOffer.product_key);
      continue;
    }

    // A assinatura principal já foi liberada acima via `offer` — refazer o
    // upsert aqui é inofensivo (mesmo valor), mas não conta como expansão.
    await admin.from("user_products").upsert(
      {
        user_id: userId,
        product_id: itemOffer.product_key,
        product_name: itemOffer.name ?? itemOffer.product_key,
        status: "active",
        canceled_at: null,
      },
      { onConflict: "user_id,product_id" },
    );

    // Tudo que não é a assinatura principal (nutrimae_assinatura) conta como
    // expansão pra fins de crédito — bump, OTO1/OTO2, compra solta no app,
    // inclusive quando a expansão É a oferta principal do pedido (ex.:
    // Livro Ilustrado comprado sozinho, sem passar pelo Anual).
    if (itemOffer.product_key !== "nutrimae_assinatura") {
      expansionCreditCentavos += item.total_amount_cents;
    }
  }

  if (expansionCreditCentavos > 0) {
    await admin.rpc("grant_expansion_credit", {
      p_order_id: orderRow.id,
      p_user_id: userId,
      p_amount_centavos: expansionCreditCentavos,
    });
  }

  const isInternal = Boolean(orderRow.metadata?.tracking_internal);
  if (!isInternal) {
    await reportPurchaseToMeta({
      orderId: orderRow.id,
      email: customer.email,
      phone: customer.phone_number,
      amountCents: orderRow.amount_cents,
      clientIp: orderRow.client_ip,
      userAgent: orderRow.client_user_agent,
      fbc: orderRow.fbc,
      fbp: orderRow.fbp,
    });
  }
  await emitFinancialTrackingEvent(admin, {
    eventName: "purchase_confirmed",
    aggregateId: orderRow.id,
    orderId: orderRow.id,
    payload: { amount_cents: orderRow.amount_cents, currency: "BRL", product_keys: [...new Set((items ?? []).map((item) => (item.offers as unknown as { product_key?: string } | null)?.product_key).filter(Boolean))] },
  });
}

/**
 * Dispara o evento de compra pra API de Conversões do Meta (ver
 * meta-conversion.js na raiz do repo). Só roda se as variáveis de ambiente
 * estiverem configuradas — enquanto não estiverem, isto é um no-op
 * silencioso. Nunca deixa uma falha do Meta derrubar o webhook: a liberação
 * de acesso (já feita acima) é o que importa de verdade; rastreamento de
 * anúncio é best-effort.
 */
async function reportPurchaseToMeta(params: {
  orderId: string;
  email: string;
  phone: string | null;
  amountCents: number;
  clientIp: string | null;
  userAgent: string | null;
  fbc: string | null;
  fbp: string | null;
}) {
  if (!process.env.META_ACCESS_TOKEN || !process.env.META_PIXEL_ID) return;
  try {
    await sendPurchaseEvent({
      email: params.email,
      phone: params.phone ?? undefined,
      orderId: params.orderId,
      amountCents: params.amountCents,
      clientIp: params.clientIp ?? undefined,
      userAgent: params.userAgent ?? undefined,
      fbc: params.fbc ?? undefined,
      fbp: params.fbp ?? undefined,
    });
  } catch (err) {
    console.error("[pagarme-webhook] falha ao reportar compra pro Meta (acesso já foi liberado normalmente)", err);
  }
}

/**
 * Simétrico a grantAccessForOrder — revoga TUDO que aquele pedido liberou
 * (oferta principal + cada order_item) e desfaz o crédito de expansão que
 * ele tinha gerado. Necessário pra reembolso/chargeback não deixar acesso
 * ativo nem crédito de graça na conta.
 *
 * Limitação conhecida: se a mesma pessoa tiver comprado o mesmo produto em
 * OUTRO pedido válido (recompra depois de um reembolso, por exemplo), esta
 * função revoga o acesso mesmo assim — não distingue "qual pedido concedeu
 * o acesso que está ativo agora". Cenário raro; se acontecer, precisa de
 * conferência manual antes de reativar.
 */
async function revokeAccessForOrder(
  admin: AdminClient,
  orderRow: { id: string; customer_id: string; offer_id: string; user_id: string | null; amount_cents?: number; metadata?: Record<string, unknown> | null },
) {
  if (!orderRow.user_id) {
    // Reembolso de um pedido que nunca chegou a liberar acesso (ex.: pago e
    // estornado antes do webhook de "paid" rodar) — nada a revogar.
    return;
  }

  const { data: offer } = await admin.from("offers").select("product_key").eq("id", orderRow.offer_id).maybeSingle();
  const { data: items } = await admin.from("order_items").select("offers(product_key)").eq("order_id", orderRow.id);

  const productKeys = new Set<string>();
  if (offer?.product_key && isKnownProductKey(offer.product_key)) productKeys.add(offer.product_key);
  for (const item of items ?? []) {
    const itemOffer = item.offers as unknown as { product_key?: string } | null;
    if (itemOffer?.product_key && isKnownProductKey(itemOffer.product_key)) productKeys.add(itemOffer.product_key);
  }

  for (const productKey of productKeys) {
    await admin
      .from("user_products")
      .update({ status: "refunded", canceled_at: new Date().toISOString() })
      .eq("user_id", orderRow.user_id)
      .eq("product_id", productKey);
  }

  await admin.rpc("revoke_expansion_credit", { p_order_id: orderRow.id, p_user_id: orderRow.user_id });
}

/**
 * Fase de assinatura — ainda não exposta no checkout público (nenhuma
 * offer recorrente está com active=true), mas o processamento já é real:
 * quando a oferta for ativada, é este código que confirma pagamento de
 * fatura e libera/revoga acesso, nunca o /api/checkout/subscription.
 *
 * Eventos `invoice.paid`/`invoice.payment_failed` existem de verdade na
 * API v5 (confirmado na doc oficial) mas ainda NÃO estão marcados no
 * webhook cadastrado no painel do Pagar.me (só order.*, charge.*,
 * subscription.created/activated/canceled foram marcados até agora) —
 * antes de ativar qualquer offer recorrente, marcar esses dois eventos lá.
 *
 * ⚠️ Formato exato do payload de "invoice.*" (nome do campo que liga a
 * fatura à assinatura: assumido `data.subscription.id` ou
 * `data.subscription_id`) não foi confirmado contra uma entrega real —
 * confirmar assim que a primeira fatura de teste chegar, antes de ativar
 * a oferta recorrente em produção.
 */
async function findSubscriptionRow(admin: AdminClient, pagarmeSubscriptionId: string) {
  const { data } = await admin
    .from("subscriptions")
    .select("id, customer_id, offer_id")
    .eq("pagarme_subscription_id", pagarmeSubscriptionId)
    .maybeSingle();
  return data;
}

async function grantAccessForSubscription(
  admin: AdminClient,
  subscriptionRow: { id: string; customer_id: string; offer_id: string },
) {
  const { data: offer } = await admin.from("offers").select("product_key, name").eq("id", subscriptionRow.offer_id).maybeSingle();
  const { data: customer } = await admin
    .from("customers")
    .select("email, phone_number")
    .eq("id", subscriptionRow.customer_id)
    .maybeSingle();

  if (!offer || !customer) {
    console.error("[pagarme-webhook] oferta/cliente ausente ao liberar acesso de assinatura", subscriptionRow);
    return;
  }

  if (!isKnownProductKey(offer.product_key)) {
    console.error("[pagarme-webhook] product_key desconhecido na oferta", offer.product_key);
    return;
  }

  const { userId } = await findOrCreateUser(admin, customer.email);

  await admin.from("customers").update({ user_id: userId }).eq("id", subscriptionRow.customer_id);

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

async function revokeAccessForSubscription(
  admin: AdminClient,
  subscriptionRow: { id: string; customer_id: string; offer_id: string },
) {
  const { data: offer } = await admin.from("offers").select("product_key").eq("id", subscriptionRow.offer_id).maybeSingle();
  const { data: customer } = await admin.from("customers").select("user_id").eq("id", subscriptionRow.customer_id).maybeSingle();

  if (!offer || !customer?.user_id || !isKnownProductKey(offer.product_key)) return;

  await admin
    .from("user_products")
    .update({ status: "cancelled", canceled_at: new Date().toISOString() })
    .eq("user_id", customer.user_id)
    .eq("product_id", offer.product_key);
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
    const localOrderId =
      typeof data.metadata?.order_id === "string"
        ? data.metadata.order_id
        : typeof data.order?.metadata?.order_id === "string"
          ? data.order.metadata.order_id
          : undefined;
    const occurredAt = typeof payload.created_at === "string" ? payload.created_at : new Date().toISOString();

    switch (eventType) {
      case "order.paid":
      case "charge.paid": {
        const orderRow = await markOrderStatus(admin, {
          pagarmeOrderId,
          pagarmeChargeId,
          localOrderId,
          status: "paid",
          rawEvent: payload,
        });
        if (orderRow) {
          await grantAccessForOrder(admin, orderRow);
          await bestEffortReportOrderToUtmify(admin, orderRow.id, "paid", occurredAt);
        }
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "order.payment_failed":
      case "charge.payment_failed": {
        // Cobre tanto cartão recusado quanto Pix não pago dentro do prazo —
        // o evento confirmado na doc não distingue os dois; nunca escreve
        // em user_products aqui (acesso nunca foi concedido, nada a revogar).
        const orderRow = await markOrderStatus(admin, { localOrderId, pagarmeOrderId, pagarmeChargeId, status: "refused", rawEvent: payload });
        if (orderRow) await bestEffortReportOrderToUtmify(admin, orderRow.id, "refused", occurredAt);
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "charge.refunded":
      case "charge.chargedback": {
        const orderRow = await markOrderStatus(admin, { localOrderId, pagarmeOrderId, pagarmeChargeId, status: "refunded", rawEvent: payload });
        if (orderRow) {
          await revokeAccessForOrder(admin, orderRow);
          await bestEffortReportOrderToUtmify(
            admin,
            orderRow.id,
            eventType === "charge.chargedback" ? "chargedback" : "refunded",
            occurredAt,
          );
          await emitFinancialTrackingEvent(admin, {
            eventName: eventType === "charge.chargedback" ? "chargeback_confirmed" : "refund_confirmed",
            aggregateId: orderRow.id,
            orderId: orderRow.id,
            payload: { amount_cents: orderRow.amount_cents, currency: "BRL" },
          });
        }
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "subscription.created":
      case "subscription.activated": {
        const pagarmeSubscriptionId = typeof data.id === "string" ? data.id : undefined;
        if (pagarmeSubscriptionId) {
          await admin
            .from("subscriptions")
            .update({ status: "active", updated_at: new Date().toISOString() })
            .eq("pagarme_subscription_id", pagarmeSubscriptionId);
        }
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "subscription.canceled": {
        const pagarmeSubscriptionId = typeof data.id === "string" ? data.id : undefined;
        const subscriptionRow = pagarmeSubscriptionId ? await findSubscriptionRow(admin, pagarmeSubscriptionId) : null;
        if (subscriptionRow) {
          await admin
            .from("subscriptions")
            .update({ status: "canceled", canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("id", subscriptionRow.id);
          await revokeAccessForSubscription(admin, subscriptionRow);
          await emitFinancialTrackingEvent(admin, {
            eventName: "subscription_canceled",
            aggregateId: subscriptionRow.id,
            subscriptionId: subscriptionRow.id,
            payload: { provider_subscription_id: pagarmeSubscriptionId },
          });
        }
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "invoice.paid": {
        // Confirma o pagamento de um ciclo (1º ou recorrente) — é aqui,
        // nunca no checkout, que o acesso da assinatura é liberado de verdade.
        const pagarmeSubscriptionId =
          typeof data.subscription?.id === "string"
            ? data.subscription.id
            : typeof data.subscription_id === "string"
              ? data.subscription_id
              : undefined;
        const subscriptionRow = pagarmeSubscriptionId ? await findSubscriptionRow(admin, pagarmeSubscriptionId) : null;
        if (subscriptionRow) {
          await admin
            .from("subscriptions")
            .update({
              status: "active",
              next_billing_at: typeof data.next_billing_at === "string" ? data.next_billing_at : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("id", subscriptionRow.id);
          await grantAccessForSubscription(admin, subscriptionRow);
          await emitFinancialTrackingEvent(admin, {
            eventName: "subscription_activated",
            aggregateId: subscriptionRow.id,
            subscriptionId: subscriptionRow.id,
            payload: { provider_subscription_id: pagarmeSubscriptionId },
          });
        } else {
          console.error("[pagarme-webhook] assinatura não encontrada localmente para invoice.paid", { pagarmeSubscriptionId });
        }
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

      case "invoice.payment_failed": {
        // Cobrança do ciclo falhou — marca "past_due", mas não revoga acesso
        // aqui (revogação só acontece em subscription.canceled). Evita
        // cortar acesso por uma falha pontual de cartão antes de qualquer
        // política de retentativa/cancelamento ser definida.
        const pagarmeSubscriptionId =
          typeof data.subscription?.id === "string"
            ? data.subscription.id
            : typeof data.subscription_id === "string"
              ? data.subscription_id
              : undefined;
        if (pagarmeSubscriptionId) {
          await admin
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("pagarme_subscription_id", pagarmeSubscriptionId);
        }
        await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
        break;
      }

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
