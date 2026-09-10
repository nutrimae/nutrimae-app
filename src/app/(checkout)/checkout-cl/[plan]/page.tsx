import { notFound } from "next/navigation";
import { StripeCheckout } from "./_components/stripe-checkout";

const PLAN_INFO = {
  basico: {
    name: "NutriMãe — Plan Básico",
    description: "Menú, cortes y recetas por edad — pago único, acceso de por vida.",
    amount: 3990,
  },
  completo: {
    name: "NutriMãe — Plan Completo",
    description: "Todo NutriMãe + bono SOS Destete Nocturno — pago único, acceso de por vida.",
    amount: 9900,
  },
} as const;

export default async function CheckoutClPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  if (plan !== "basico" && plan !== "completo") notFound();

  return <StripeCheckout plan={plan} info={PLAN_INFO[plan]} />;
}
