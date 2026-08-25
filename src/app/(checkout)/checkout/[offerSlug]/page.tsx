import { notFound } from "next/navigation";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckoutForm } from "./_components/checkout-form";
import { SubscriptionCheckoutForm } from "./_components/subscription-checkout-form";

/**
 * Carrega a oferta pelo slug direto do banco — se estiver inativa (ex.:
 * Mensal/NutriBot VIP antes de a assinatura recorrente estar validada) ou
 * não existir, cai em 404. É essa checagem, não uma flag no front, que
 * mantém ofertas desativadas fora do ar de verdade — inclusive pra
 * ofertas recorrentes, que só passam a existir aqui quando `active=true`.
 */
export default async function CheckoutOfferPage({
  params,
}: {
  params: Promise<{ offerSlug: string }>;
}) {
  const { offerSlug } = await params;
  const admin = createAdminClient();

  const { data: offer } = await admin
    .from("offers")
    .select("id, slug, name, price_cents, recurring_price_cents, billing_type, active")
    .eq("slug", offerSlug)
    .maybeSingle();

  if (!offer || !offer.active) {
    notFound();
  }

  let bumps: Array<{ id: string; slug: string; name: string; price_cents: number }> = [];
  if (offerSlug === "nutrimae-anual") {
    const { data } = await admin
      .from("offers")
      .select("id, slug, name, price_cents")
      .in("slug", ["batch-cooking", "sos-desmame", "protocolo-intestino", "nutribot-30d"])
      .eq("active", true);
    // Batch Cooking primeiro de propósito: resolve a dor que a compra
    // principal acabou de criar ("o que eu dou" -> "quando eu cozinho isso").
    const priority = ["batch-cooking", "sos-desmame", "protocolo-intestino", "nutribot-30d"];
    bumps = (data ?? []).sort((a, b) => priority.indexOf(a.slug) - priority.indexOf(b.slug));
  }

  return (
    <main className="min-h-dvh bg-cream pb-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-8">
        <div className="flex items-center justify-center gap-2">
          <Image src="/nutrimae-logo.png" alt="NutriMãe" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-heading text-sm font-bold tracking-tight text-brown-900">NutriMãe</span>
        </div>

        {offerSlug === "nutrimae-anual" && (
          <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[28px] shadow-strong">
            <Image
              src="/images/order-bumps/nutrimae-anual.webp"
              alt={offer.name}
              width={600}
              height={600}
              priority
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="rounded-[24px] bg-white p-5 text-center shadow-subtle">
          <h1 className="font-heading text-xl font-bold leading-tight text-brown-900">{offer.name}</h1>
          <p className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-primary-600">
              {(offer.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            {offer.billing_type === "recurring" && (
              <span className="text-sm font-semibold text-brown-700/86">
                no 1º ciclo
                {offer.recurring_price_cents != null && offer.recurring_price_cents !== offer.price_cents
                  ? `, depois ${(offer.recurring_price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`
                  : "/mês"}
              </span>
            )}
          </p>
          {offerSlug === "nutrimae-anual" && (
            <p className="mt-1 text-sm font-medium text-sage-600">ou 12x de R$9,70 no cartão, sem juros</p>
          )}
        </div>

        {offer.billing_type === "recurring" ? (
          <SubscriptionCheckoutForm offer={{ slug: offer.slug, name: offer.name }} />
        ) : (
          <CheckoutForm offer={{ slug: offer.slug, name: offer.name, priceCents: offer.price_cents }} bumps={bumps} />
        )}
      </div>
    </main>
  );
}
