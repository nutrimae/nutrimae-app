import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEvolutionClient } from "@/lib/nutribot/evolutionClient";
import { sanitizePhoneNumber } from "@/lib/utils";

/**
 * Lembrete de Pix gerado mas não pago — roda via Vercel Cron (ver
 * vercel.json), 1x por dia às 15h UTC (~meio-dia em Brasília) — é o
 * máximo permitido no plano Hobby da Vercel (crons mais frequentes que
 * 1x/dia falham no deploy). Por isso a janela é de 1h a 36h de idade, não
 * de minutos: com cadência diária, precisa cobrir o dia inteiro sem
 * deixar buraco entre uma execução e a próxima, e sem pegar pedidos ainda
 * dentro dos 30min de validade do próprio Pix.
 *
 * Se um dia o projeto for pro plano Pro da Vercel, dá pra apertar isso
 * pra rodar a cada 15-30min (mais perto do momento real do abandono) —
 * só trocar o "schedule" no vercel.json e a janela abaixo.
 *
 * Urgência real, não fabricada: a pessoa de fato gerou um Pix de verdade e
 * não pagou — isso não é reengajamento genérico, é "você começou algo e
 * não terminou".
 *
 * Reaproveita o cliente da Evolution API já usado pelo NutriBot
 * (src/lib/nutribot/evolutionClient.ts) — mesma instância de WhatsApp.
 */

function verifyCronAuth(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false; // sem segredo configurado: nunca roda (fail-closed)
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstanceName = process.env.EVOLUTION_INSTANCE_NAME;

  if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstanceName) {
    console.error("[cron/abandoned-checkout] Evolution API não configurada");
    return NextResponse.json({ error: "missing_configuration" }, { status: 500 });
  }

  const admin = createAdminClient();

  const now = Date.now();
  const windowStart = new Date(now - 36 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now - 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await admin
    .from("orders")
    .select("id, amount_cents, customer_id, offer_id, offers(name, slug)")
    .eq("status", "pending")
    .eq("payment_method", "pix")
    .is("abandoned_reminder_sent_at", null)
    .gte("created_at", windowStart)
    .lte("created_at", windowEnd);

  if (error) {
    console.error("[cron/abandoned-checkout] falha ao buscar pedidos pendentes", error);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 });
  }

  const evolution = createEvolutionClient({
    baseUrl: evolutionApiUrl,
    instanceName: evolutionInstanceName,
    apiKey: evolutionApiKey,
  });

  let reminded = 0;

  for (const order of orders) {
    try {
      const { data: customer } = await admin
        .from("customers")
        .select("name, phone_number")
        .eq("id", order.customer_id)
        .maybeSingle();

      const phone = sanitizePhoneNumber(customer?.phone_number ?? undefined);
      if (!customer || !phone) continue;

      const offer = order.offers as unknown as { name?: string; slug?: string } | null;
      const firstName = customer.name?.split(" ")[0] ?? "";
      const offerName = offer?.name ?? "seu plano";
      const amount = (order.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      const checkoutUrl = `https://nutrimae-app.vercel.app/checkout/${offer?.slug ?? "nutrimae-anual"}`;

      const message =
        `Oi${firstName ? `, ${firstName}` : ""}! 💛 Vi que você começou a garantir o ${offerName} (${amount}) ` +
        `mas o Pix não foi finalizado. Ainda dá tempo — é só gerar um novo Pix aqui: ${checkoutUrl}`;

      await evolution.sendText({ to: phone, message });

      await admin.from("orders").update({ abandoned_reminder_sent_at: new Date().toISOString() }).eq("id", order.id);
      reminded += 1;
    } catch (err) {
      console.error("[cron/abandoned-checkout] falha ao lembrar pedido", order.id, err);
    }
  }

  return NextResponse.json({ ok: true, reminded });
}
