import { redirect } from "next/navigation";
import Image from "next/image";
import { CookingPot, CalendarCheck, Tag, MessageCircle, Sparkles, Clock3 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Chip } from "@/components/ui/chip";
import { UpsellCheckout } from "./_components/upsell-checkout";
import { VipUpsellCheckout } from "./_components/vip-upsell-checkout";

const BATCH_BENEFITS = [
  { icon: CookingPot, color: "bg-primary-50 text-primary-500", title: "Método de porcionamiento", text: "Cocina una vez, come toda la semana." },
  { icon: CalendarCheck, color: "bg-sage-50 text-sage-600", title: "Tabla de vencimiento", text: "Por alimento, en el refrigerador y en el congelador — más seguridad, menos desperdicio." },
  { icon: Tag, color: "bg-amber-50 text-amber-600", title: "Etiquetas para imprimir", text: "Identifica los potitos de forma práctica." },
];

const VIP_BENEFITS = [
  { icon: MessageCircle, color: "bg-primary-50 text-primary-500", title: "Resuelve dudas por WhatsApp", text: "Pregunta sobre cualquier alimento y recibe respuesta al instante, directo en tu celular." },
  { icon: Sparkles, color: "bg-sage-50 text-sage-600", title: "Contexto de tu bebé", text: "El NutriBot ya conoce los alérgenos y el historial alimentario — sin repetir todo de nuevo." },
  { icon: Clock3, color: "bg-amber-50 text-amber-600", title: "Sin límite de uso", text: "Pregunta las veces que necesites, todos los días, mientras la suscripción esté activa." },
];

/**
 * OTO1 pós-compra — a oferta muda conforme o que a pessoa acabou de
 * comprar: Plano Anual (order) vê Batch Cooking; Plano Mensal ou NutriBot
 * VIP (subscription) vê o upgrade pro NutriBot VIP. Nunca os dois ao mesmo
 * tempo (ver checkout/obrigado/page.tsx, que decide pra onde mandar).
 *
 * Ativado em 2026-08-24 junto com o Plano Mensal — antes disso o NutriBot
 * VIP ficava com os botões só navegando pro downsell, sem cobrar de
 * verdade (ver memória "project-bump-upsell-mensal-swap").
 */
export default async function UpsellPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; subscriptionId?: string }>;
}) {
  const { orderId, subscriptionId } = await searchParams;
  if (!orderId && !subscriptionId) redirect("/app");

  const admin = createAdminClient();

  if (subscriptionId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id, status, customer_id")
      .eq("id", subscriptionId)
      .maybeSingle();
    if (!subscription || subscription.status !== "active") redirect("/app");

    const { data: vipOffer } = await admin
      .from("offers")
      .select("id, recurring_price_cents, active")
      .eq("slug", "nutribot-vip-mensal")
      .maybeSingle();

    if (!vipOffer || !vipOffer.active || vipOffer.recurring_price_cents == null) {
      redirect(`/downsell?subscriptionId=${subscription.id}`);
    }

    const { data: existingVip } = await admin
      .from("subscriptions")
      .select("id")
      .eq("customer_id", subscription.customer_id)
      .eq("offer_id", vipOffer.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingVip) redirect(`/downsell?subscriptionId=${subscription.id}`);

    return (
      <main className="min-h-dvh bg-cream pb-10">
        <div className="sticky top-0 z-50 bg-sage-500 px-4 py-3 text-center text-sm font-semibold text-white">
          🎉 ¡Tu suscripción está confirmada! Antes de continuar, mira una oferta exclusiva de esta página.
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold leading-tight text-brown-900">
              ¿Quieres resolver dudas sobre la alimentación sin siquiera abrir la app?
            </h1>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-base text-brown-700/86">
              Conoce el <span className="font-heading font-bold text-primary-600">NutriBot VIP</span>
              <Chip color="primary" variant="solid">por WhatsApp</Chip>
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[24px] bg-white p-5 shadow-strong">
            {VIP_BENEFITS.map(({ icon: Icon, color, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-brown-900">{title}</p>
                  <p className="mt-0.5 text-sm text-brown-700/86">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-brown-700/70">
            Suscripción separada de tu mensualidad de la app. Cancela cuando quieras, sin penalidad.
          </p>

          <VipUpsellCheckout parentSubscriptionId={subscription.id} recurringPriceCents={vipOffer.recurring_price_cents} />
        </div>
      </main>
    );
  }

  const { data: order } = await admin.from("orders").select("id, status").eq("id", orderId!).maybeSingle();
  if (!order || order.status !== "paid") redirect("/app");

  const { data: offer } = await admin
    .from("offers")
    .select("id, price_cents, active")
    .eq("slug", "batch-cooking")
    .maybeSingle();

  if (!offer || !offer.active) redirect(`/downsell?orderId=${order.id}`);

  const { data: existingItem } = await admin
    .from("order_items")
    .select("id")
    .eq("order_id", order.id)
    .eq("offer_id", offer.id)
    .maybeSingle();

  if (existingItem) redirect(`/downsell?orderId=${order.id}`);

  return (
    <main className="min-h-dvh bg-cream pb-10">
      <div className="sticky top-0 z-50 bg-sage-500 px-4 py-3 text-center text-sm font-semibold text-white">
        🎉 ¡Tu compra de NutriMãe está confirmada! Antes de continuar, mira una oferta exclusiva de esta página.
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
        <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[28px] shadow-strong">
          <Image
            src="/images/order-bumps/batch-cooking.webp"
            alt="Batch Cooking y Congelación"
            width={600}
            height={502}
            priority
            className="w-full object-cover"
          />
        </div>

        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold leading-tight text-brown-900">
            Ya aseguraste los menús. ¿Qué tal resolver de una vez la pregunta &ldquo;cuándo voy a cocinar esto&rdquo;?
          </h1>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-base text-brown-700/86">
            Conoce el <span className="font-heading font-bold text-primary-600">Batch Cooking y Congelación</span>
            <Chip color="primary" variant="solid">acceso vitalicio</Chip>
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[24px] bg-white p-5 shadow-strong">
          {BATCH_BENEFITS.map(({ icon: Icon, color, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-brown-900">{title}</p>
                <p className="mt-0.5 text-sm text-brown-700/86">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-brown-700/70">
          Acceso vitalicio, no entra en la suscripción. Si ya invertiste en otra expansión, el valor se convierte en
          crédito guardado en tu perfil.
        </p>

        <UpsellCheckout parentOrderId={order.id} offerSlug="batch-cooking" priceCents={offer.price_cents} />
      </div>
    </main>
  );
}
