import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Log simples (sem idempotência) — grava o evento já com o status final.
 * Best-effort, nunca lança (uma falha ao gravar log não pode derrubar o
 * processamento do webhook).
 */
export async function logWebhookEvent(
  admin: AdminClient,
  params: {
    provider: string;
    eventType: string;
    payload: unknown;
    status: "processed" | "error";
    errorMessage?: string;
  },
) {
  try {
    await admin.from("webhook_logs").insert({
      provider: params.provider,
      event_type: params.eventType,
      payload: params.payload,
      status: params.status,
      error_message: params.errorMessage ?? null,
      processed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[${params.provider}-webhook] falha ao gravar webhook_logs`, err);
  }
}

/**
 * Reivindica um evento pelo par (provider, providerEventId) ANTES de
 * processar — grava com status "received". Se esse par já foi reivindicado
 * (índice único em webhook_logs, ver supabase/schema.sql seção 12), o
 * insert falha com 23505 e devolvemos claimed=false: quem chamar não deve
 * reprocessar nem chamar o provedor de pagamento de novo, só responder 200.
 *
 * Isso é o que garante idempotência mesmo com duas entregas concorrentes do
 * mesmo webhook (retry do provedor, replay, etc.) — o teste é feito pelo
 * próprio banco, não por um Set em memória (que não sobrevive a cold start
 * nem a múltiplas instâncias do servidor).
 */
export async function claimWebhookEvent(
  admin: AdminClient,
  params: { provider: string; providerEventId: string; eventType: string; payload: unknown },
): Promise<{ claimed: true; logId: string } | { claimed: false; logId: null }> {
  const { data, error } = await admin
    .from("webhook_logs")
    .insert({
      provider: params.provider,
      provider_event_id: params.providerEventId,
      event_type: params.eventType,
      payload: params.payload,
      status: "received",
      processed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = unique_violation — evento já reivindicado antes (duplicata).
    // Qualquer OUTRO erro também é tratado como "não reivindicado" (mais
    // seguro recusar processar do que arriscar duplicar uma liberação de
    // acesso por causa de uma falha transitória de gravação do log).
    if (error.code !== "23505") {
      console.error(`[${params.provider}-webhook] falha ao reivindicar evento`, error);
    }
    return { claimed: false, logId: null };
  }

  return { claimed: true, logId: data.id };
}

/** Atualiza o log já reivindicado com o resultado final do processamento. */
export async function finalizeWebhookEvent(
  admin: AdminClient,
  logId: string,
  params: { status: "processed" | "error" | "ignored"; errorMessage?: string },
) {
  try {
    await admin
      .from("webhook_logs")
      .update({ status: params.status, error_message: params.errorMessage ?? null })
      .eq("id", logId);
  } catch (err) {
    console.error("[webhook] falha ao finalizar webhook_logs", err);
  }
}
