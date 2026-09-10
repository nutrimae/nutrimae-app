import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

const PLAN_INFO = {
  basico: { name: "NutriMãe — Plan Básico", amount: 3990 },
  completo: { name: "NutriMãe — Plan Completo", amount: 9900 },
} as const;

/**
 * CLP é moeda "zero-decimal" na Stripe — o amount vai em pesos inteiros,
 * sem multiplicar por 100 (confirmado testando direto na API antes de
 * escrever isso, a doc deles não deixa claro se conta chilena aceita CLP).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { plan?: string; email?: string } | null;
  const plan = body?.plan;
  const email = body?.email;

  if (plan !== "basico" && plan !== "completo") {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const info = PLAN_INFO[plan];

  const paymentIntent = await stripe.paymentIntents.create({
    amount: info.amount,
    currency: "clp",
    automatic_payment_methods: { enabled: true },
    receipt_email: email,
    metadata: { plan, email },
    description: info.name,
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
