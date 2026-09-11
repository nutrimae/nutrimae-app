import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccessForHotmartPayment } from "@/lib/webhooks/grant-access-hotmart";
import { claimWebhookEvent, finalizeWebhookEvent } from "@/lib/webhooks/log-event";

/**
 * Segmento [secret] na URL (mesmo padrão de webhooks/rebill/[secret]) mais o
 * HOTTOK — token fixo que o Hotmart gera por assinatura de webhook e envia
 * de volta em toda notificação (não é uma assinatura HMAC sobre o corpo,
 * é um token estático — comparação em tempo constante mesmo assim, por
 * hábito). Configurar em Ferramentas > Webhook no painel Hotmart do
 * produto 8499889, com HOTMART_WEBHOOK_SECRET (este segmento da URL,
 * escolhido por nós) e HOTMART_HOTTOK (o token mostrado pelo Hotmart).
 *
 * IMPORTANTE: o formato exato do payload abaixo (nomes dos campos em
 * `data`) foi escrito de memória a partir da doc pública do Hotmart
 * (developers.hotmart.com/docs/pt-BR/webhooks) e AINDA NÃO foi validado
 * contra uma notificação real — assim que o Hotmart mandar o primeiro
 * webhook de teste, conferir `payload` salvo em webhook_logs e ajustar os
 * caminhos se necessário, antes de confiar nisso em produção.
 */
export async function POST(request: Request, { params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params;
  if (!process.env.HOTMART_WEBHOOK_SECRET || secret !== process.env.HOTMART_WEBHOOK_SECRET) {
    return new NextResponse(null, { status: 404 });
  }

  const rawBody = await request.text();
  const hottok = request.headers.get("x-hotmart-hottok");
  if (!isValidHottok(hottok, process.env.HOTMART_HOTTOK)) {
    return new NextResponse(null, { status: 401 });
  }

  const parsed = JSON.parse(rawBody) as {
    id: string;
    event: string;
    data: {
      purchase: {
        transaction: string;
        status: string;
        offer?: { code?: string };
      };
      buyer?: { email?: string };
    };
  };

  const admin = createAdminClient();
  const claim = await claimWebhookEvent(admin, {
    provider: "hotmart",
    providerEventId: parsed.id,
    eventType: parsed.event,
    payload: parsed,
  });
  if (!claim.claimed) return new NextResponse(null, { status: 200 });

  try {
    if (parsed.event === "PURCHASE_APPROVED" || parsed.event === "PURCHASE_COMPLETE") {
      await grantAccessForHotmartPayment(admin, {
        transaction: parsed.data.purchase.transaction,
        status: parsed.data.purchase.status,
        offer: parsed.data.purchase.offer,
        buyer: parsed.data.buyer,
      });
    }
    await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
  } catch (err) {
    console.error("[hotmart-webhook] falha ao processar evento", err);
    await finalizeWebhookEvent(admin, claim.logId, { status: "error", errorMessage: String(err) });
  }

  return new NextResponse(null, { status: 200 });
}

function isValidHottok(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const receivedBuf = Buffer.from(received);
  const expectedBuf = Buffer.from(expected);
  if (receivedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(receivedBuf, expectedBuf);
}
