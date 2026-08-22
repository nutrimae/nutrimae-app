import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isKnownProductKey, PRODUCTS, type ProductKey } from "@/lib/products";
import type { EntitlementStatus } from "@/lib/entitlements";
import { sanitizePhoneNumber } from "@/lib/utils";
import { findOrCreateUser, savePhoneNumber } from "@/lib/webhooks/find-or-create-user";
import { logWebhookEvent } from "@/lib/webhooks/log-event";

/**
 * Webhook de eventos de compra (formato Cartpanda).
 *
 * Contrato esperado (ajustar os nomes de campo se o payload real da Cartpanda
 * for diferente — este formato foi definido por nós na ausência da doc exata):
 * {
 *   "email": "mae@exemplo.com",
 *   "phone": "11999999999",
 *   "product_id": "nutrimae_assinatura",
 *   "status": "ativo" | "cancelado" | "atrasado",
 *   "event_id": "opcional, usado só para log"
 * }
 *
 * "phone" é opcional — quando vier (em qualquer formato: com/sem DDI, com
 * máscara), é higienizado por sanitizePhoneNumber e salvo em
 * "profiles.phone_number" (ver supabase/schema.sql, seção 5.1). É esse campo
 * que o webhook da NutriBot (src/app/api/whatsapp/webhook) usa para achar a
 * conta a partir do número que escreveu no WhatsApp.
 *
 * Autenticação: header "x-webhook-secret" precisa bater com CARTPANDA_WEBHOOK_SECRET.
 * Configure esse mesmo valor no painel de webhooks da Cartpanda.
 *
 * Idempotência: reenviar o mesmo evento não cria conta duplicada (usuária é
 * localizada por e-mail antes de criar) nem duplica a permissão (upsert por
 * user_id+product_id, protegido por uma constraint UNIQUE no banco).
 * Cancelamento/atraso só atualiza o status — nunca apaga a conta nem dados do bebê.
 *
 * Permissões: gravamos em "user_products" e "webhook_logs", duas tabelas que já
 * existiam neste projeto Supabase antes desta sessão. Endurecemos as políticas
 * de RLS delas (ver supabase/schema.sql) para que só a service role escreva —
 * antes, a própria usuária conseguia alterar sua linha via API e se
 * autoconceder acesso pago.
 */

const STATUS_MAP: Record<string, EntitlementStatus> = {
  ativo: "active",
  active: "active",
  cancelado: "cancelled",
  cancelled: "cancelled",
  canceled: "cancelled",
  atrasado: "late",
  late: "late",
  overdue: "late",
};

interface WebhookPayload {
  email?: unknown;
  phone?: unknown;
  product_id?: unknown;
  status?: unknown;
  event_id?: unknown;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.CARTPANDA_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-webhook-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: WebhookPayload;
  let rawBody: unknown;
  try {
    rawBody = await request.json();
    payload = rawBody as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const admin = createAdminClient();

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;
  const phoneNumber = sanitizePhoneNumber(
    typeof payload.phone === "string" ? payload.phone : undefined,
  );
  const productId = typeof payload.product_id === "string" ? payload.product_id : null;
  const rawStatus = typeof payload.status === "string" ? payload.status.toLowerCase() : null;

  if (!email || !productId || !rawStatus) {
    await logWebhookEvent(admin, {
      provider: "cartpanda",
      eventType: "purchase.invalid_payload",
      payload: rawBody,
      status: "error",
      errorMessage: "missing_fields",
    });
    return NextResponse.json(
      { error: "missing_fields", required: ["email", "product_id", "status"] },
      { status: 400 },
    );
  }

  if (!isKnownProductKey(productId)) {
    await logWebhookEvent(admin, {
      provider: "cartpanda",
      eventType: "purchase.unknown_product",
      payload: rawBody,
      status: "error",
      errorMessage: `unknown_product_id: ${productId}`,
    });
    return NextResponse.json({ error: "unknown_product_id", product_id: productId }, { status: 422 });
  }
  const productKey: ProductKey = productId;

  const status = STATUS_MAP[rawStatus];
  if (!status) {
    await logWebhookEvent(admin, {
      provider: "cartpanda",
      eventType: "purchase.unknown_status",
      payload: rawBody,
      status: "error",
      errorMessage: `unknown_status: ${rawStatus}`,
    });
    return NextResponse.json(
      { error: "unknown_status", status: rawStatus, accepted: Object.keys(STATUS_MAP) },
      { status: 400 },
    );
  }

  let userId: string;
  let accountCreated: boolean;
  try {
    const result = await findOrCreateUser(admin, email);
    userId = result.userId;
    accountCreated = result.created;
  } catch (err) {
    console.error("[cartpanda-webhook] falha ao localizar/criar usuária", err);
    await logWebhookEvent(admin, {
      provider: "cartpanda",
      eventType: `purchase.${status}`,
      payload: rawBody,
      status: "error",
      errorMessage: "user_lookup_failed",
    });
    return NextResponse.json({ error: "user_lookup_failed" }, { status: 500 });
  }

  if (phoneNumber) {
    await savePhoneNumber(admin, userId, phoneNumber);
  }

  const { error: upsertError } = await admin.from("user_products").upsert(
    {
      user_id: userId,
      product_id: productKey,
      product_name: PRODUCTS[productKey].name,
      status,
      canceled_at: status === "cancelled" ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,product_id" },
  );

  if (upsertError) {
    console.error("[cartpanda-webhook] falha ao salvar permissão", upsertError);
    await logWebhookEvent(admin, {
      provider: "cartpanda",
      eventType: `purchase.${status}`,
      payload: rawBody,
      status: "error",
      errorMessage: upsertError.message,
    });
    return NextResponse.json({ error: "entitlement_upsert_failed" }, { status: 500 });
  }

  await logWebhookEvent(admin, {
    provider: "cartpanda",
    eventType: `purchase.${status}`,
    payload: rawBody,
    status: "processed",
  });

  return NextResponse.json({
    ok: true,
    user_id: userId,
    account_created: accountCreated,
    product_id: productKey,
    status,
  });
}
