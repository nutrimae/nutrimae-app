import { redirect } from "next/navigation";
import Image from "next/image";
import { Clock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { DownsellCheckout } from "./_components/downsell-checkout";

/**
 * Downsell — segunda chance do NutriBot com desconto: NutriBot — 30 Dias
 * (oferta "nutribot-30d", pagamento único). É a mesma oferta usada como
 * order bump no checkout do Plano Anual — preço lido do banco (offers),
 * nunca hardcoded aqui, pra não divergir.
 *
 * Cobra de verdade (reaproveita o caminho one-time via
 * /api/checkout/downsell) — diferente do upsell (NutriBot VIP, recorrente),
 * que ainda não tem cobrança real habilitada.
 *
 * Ajuste em relação ao pedido original: troquei "Última chance antes de
 * liberar seu acesso ao App" pelo texto abaixo. O original insinuava que o
 * acesso ao aplicativo — que ela já pagou na compra principal — ficava
 * retido até ela decidir sobre este upsell. Isso é um dark pattern real
 * (segurar entrega de algo já comprado pra pressionar uma venda separada),
 * não só uma questão de tom.
 */
export default async function DownsellPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/app");

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id, status").eq("id", orderId).maybeSingle();
  if (!order || order.status !== "paid") redirect("/app");

  const { data: offer } = await admin
    .from("offers")
    .select("price_cents, active")
    .eq("slug", "nutribot-30d")
    .maybeSingle();

  if (!offer || !offer.active) redirect("/app");

  return (
    <main className="min-h-dvh bg-cream pb-10">
      {/* A. Alerta superior — urgência real (a oferta só aparece nesta
          tela), sem insinuar que o acesso já pago está sendo retido. */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-terracotta-500 px-4 py-3 text-center text-sm font-semibold text-white">
        <Clock className="h-4 w-4 shrink-0" strokeWidth={2.5} />
        Esta oferta aparece só agora — não vamos mostrá-la de novo.
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8">
        <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[28px] shadow-strong">
          <Image
            src="/images/order-bumps/nutribot-30d.webp"
            alt="NutriBot — 30 Dias"
            width={600}
            height={600}
            priority
            className="w-full object-cover"
          />
        </div>

        {/* B. Headline e copy de ancoragem */}
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold leading-tight text-brown-900">
            Eu entendo... assumir mais um gasto agora pode parecer muito.
          </h1>
          <p className="mt-3 text-base text-brown-700/86">
            Mas eu não quero que você fique sem essa ajuda na cozinha. Que tal testar o NutriBot por 30 dias com
            desconto?
          </p>
        </div>

        {/* C. Card da oferta */}
        <div className="relative rounded-[24px] border-2 border-primary-300 bg-white p-6 text-center shadow-strong">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Oferta única
          </span>
          <p className="mt-2 text-sm font-medium text-brown-700/70 line-through">De R$37,00</p>
          <p className="font-heading text-4xl font-extrabold text-primary-600">
            {(offer.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-2 text-xs text-brown-700/70">Pagamento único, 30 dias de acesso ao NutriBot.</p>
        </div>

        <DownsellCheckout parentOrderId={order.id} priceCents={offer.price_cents} />
      </div>
    </main>
  );
}
