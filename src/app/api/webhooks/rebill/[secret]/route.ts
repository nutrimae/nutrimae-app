import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccessForRebillPayment } from "@/lib/webhooks/grant-access-rebill";
import { claimWebhookEvent, finalizeWebhookEvent } from "@/lib/webhooks/log-event";

/**
 * Cobre o que o "success" do <rebill-checkout> não cobre: reembolso,
 * chargeback, e qualquer confirmação atrasada. A verificação server-side em
 * /api/rebill/verify-payment já libera acesso no caminho feliz — este
 * webhook é a rede de segurança (ver docs.rebill.com/guides/webhooks).
 *
 * Ainda NÃO registrado na Rebill (POST /v3/webhooks precisa de uma URL
 * pública, que não existe rodando local) — registrar quando o app estiver
 * implantado, com REBILL_WEBHOOK_SECRET (segmento da URL, escolhido por nós)
 * e REBILL_WEBHOOK_SIGNING_SECRET (o "signingSecret" que a Rebill devolve
 * na criação do webhook, mostrado só uma vez).
 */
export async function POST(request: Request, { params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params;
  if (!process.env.REBILL_WEBHOOK_SECRET || secret !== process.env.REBILL_WEBHOOK_SECRET) {
    return new NextResponse(null, { status: 404 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-rebill-signature");
  if (!isValidSignature(rawBody, signature, process.env.REBILL_WEBHOOK_SIGNING_SECRET)) {
    return new NextResponse(null, { status: 401 });
  }

  const parsed = JSON.parse(rawBody) as {
    data: { payment?: { id: string; status: string }; id?: string };
    webhook: { event: string; logId: string };
  };
  const { data, webhook } = parsed;

  const admin = createAdminClient();
  const claim = await claimWebhookEvent(admin, {
    provider: "rebill",
    providerEventId: webhook.logId,
    eventType: webhook.event,
    payload: parsed,
  });
  if (!claim.claimed) return new NextResponse(null, { status: 200 });

  try {
    if (webhook.event === "payment.created" || webhook.event === "payment.updated") {
      const paymentId = data.payment?.id ?? data.id;
      if (paymentId) await reconcilePayment(paymentId);
    }
    await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
  } catch (err) {
    console.error("[rebill-webhook] falha ao processar evento", err);
    await finalizeWebhookEvent(admin, claim.logId, { status: "error", errorMessage: String(err) });
  }

  return new NextResponse(null, { status: 200 });
}

function isValidSignature(rawBody: string, header: string | null, secret: string | undefined): boolean {
  if (!header || !secret || !rawBody) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(header, "hex");
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

/** Sempre reconfirma contra a API antes de liberar — nunca confia só no corpo do webhook. */
async function reconcilePayment(paymentId: string) {
  const res = await fetch(`https://api.rebill.com/v3/payments/${paymentId}`, {
    headers: { "x-api-key": process.env.REBILL_SECRET_KEY! },
    cache: "no-store",
  });
  if (!res.ok) return;
  const payment = await res.json();
  await grantAccessForRebillPayment(createAdminClient(), payment);
}
