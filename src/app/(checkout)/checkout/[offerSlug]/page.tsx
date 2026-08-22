import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckoutForm } from "./_components/checkout-form";

/**
 * Carrega a oferta pelo slug direto do banco — se estiver inativa (ex.:
 * Mensal/NutriBot VIP antes de a assinatura recorrente estar validada) ou
 * não existir, cai em 404. É essa checagem, não uma flag no front, que
 * mantém ofertas desativadas fora do ar de verdade.
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
    .select("id, slug, name, price_cents, billing_type, active")
    .eq("slug", offerSlug)
    .maybeSingle();

  if (!offer || !offer.active || offer.billing_type !== "one_time") {
    notFound();
  }

  let bumps: Array<{ id: string; slug: string; name: string; price_cents: number }> = [];
  if (offerSlug === "nutrimae-anual") {
    const { data } = await admin
      .from("offers")
      .select("id, slug, name, price_cents")
      .in("slug", ["sos-desmame", "protocolo-intestino", "nutribot-30d"])
      .eq("active", true);
    bumps = data ?? [];
  }

  return (
    <main className="min-h-dvh bg-gray-50 pb-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">{offer.name}</h1>
          <p className="mt-2 text-3xl font-extrabold text-rose-600">
            {(offer.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        <CheckoutForm offer={{ slug: offer.slug, name: offer.name, priceCents: offer.price_cents }} bumps={bumps} />
      </div>
    </main>
  );
}
