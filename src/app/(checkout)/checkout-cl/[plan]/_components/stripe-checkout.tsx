"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementOptions } from "@stripe/stripe-js";
import { ShieldCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconAvatar3D } from "@/components/ui/icon-avatar-3d";
import { CheckoutTestimonials } from "@/components/checkout-testimonials";
import { CheckoutTrustFooter } from "@/components/checkout-trust-footer";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/**
 * Estilo dos campos de cartão nativos da Stripe (rodam dentro de um iframe
 * deles, PCI-compliant) — a cor/fonte aqui precisa bater a olho com o
 * componente <Input> do resto do app (ver src/components/ui/input.tsx),
 * já que o wrapper por fora já usa as mesmas classes do Input. Cores em
 * hex puro porque o Elements não lê variável CSS.
 */
const ELEMENT_STYLE: StripeCardNumberElementOptions["style"] = {
  base: {
    fontSize: "16px",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    color: "#453529",
    "::placeholder": { color: "rgba(69,53,41,0.3)" },
  },
  invalid: {
    color: "#dc2626",
  },
};

const FIELD_WRAPPER_BASE =
  "flex min-h-13 w-full items-center rounded-2xl border-2 bg-white/80 px-4 transition-all duration-200";
const FIELD_WRAPPER_IDLE = "border-sage-100/80";
const FIELD_WRAPPER_FOCUS = "border-primary-500 bg-white shadow-[0_0_0_4px_var(--color-primary-glow)]";

function fieldWrapperClass(focusedKey: string | null, fieldKey: string, className = "") {
  return `${FIELD_WRAPPER_BASE} ${focusedKey === fieldKey ? FIELD_WRAPPER_FOCUS : FIELD_WRAPPER_IDLE} ${className}`;
}

function CheckoutFormInner({
  plan,
  info,
}: {
  plan: "basico" | "completo";
  info: { name: string; description: string; amount: number };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "verifying" | "granted">("idle");

  async function handleSubmit() {
    setError(null);

    if (!name.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!email.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (!stripe || !elements) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        setError("No pudimos iniciar el pago. Intenta de nuevo en unos instantes.");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name, email },
        },
      });

      if (confirmError) {
        setError(confirmError.message ?? "No pudimos procesar el pago. Revisa los datos o intenta con otra tarjeta.");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setStatus("verifying");
        const verifyRes = await fetch("/api/stripe/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        setStatus(verifyRes.ok ? "granted" : "idle");
        if (!verifyRes.ok) setError("El pago fue aprobado, pero no pudimos confirmar el acceso. Contáctanos por el chat.");
      } else {
        setError("No pudimos confirmar el pago. Revisa los datos o intenta con otra tarjeta.");
        setLoading(false);
      }
    } catch {
      setError("Algo salió mal. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (status === "granted") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <IconAvatar3D src="/images/illustrations/icon-star.webp" size="xl" />
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-brown-900">¡Pago confirmado!</h1>
          <p className="font-heading text-lg font-bold text-primary-600">
            Tu tranquilidad ya te espera en tu correo.
          </p>
        </div>
        <p className="text-sm text-brown-700/86">
          Te enviamos un email con el enlace para crear tu contraseña y entrar a NutriMama.
          Puede tardar unos minutos — si no lo ves, revisa también la carpeta de spam.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-cream pb-10">
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-primary-50 px-4 py-2.5 text-center text-xs font-semibold text-primary-700">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
        Pago procesado con seguridad · acceso liberado apenas se confirme la compra
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-8">
        <div className="flex items-center justify-center gap-2">
          <Image src="/nutrimae-logo.png" alt="NutriMama" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-heading text-sm font-bold tracking-tight text-brown-900">NutriMama</span>
        </div>

        <div className="rounded-[24px] bg-white p-5 text-center shadow-subtle">
          <h1 className="font-heading text-xl font-bold leading-tight text-brown-900">{info.name}</h1>
          <p className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-primary-600">
            CLP {info.amount.toLocaleString("es-CL")}
          </p>
          <p className="mt-1 text-sm font-medium text-sage-600">pago único, acceso de por vida</p>
        </div>

        <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-strong">
          <div className="flex flex-col gap-3">
            <Input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className={fieldWrapperClass(focusedField, "number")}>
              <CardNumberElement
                options={{ style: ELEMENT_STYLE, showIcon: true }}
                onFocus={() => setFocusedField("number")}
                onBlur={() => setFocusedField(null)}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <div className={fieldWrapperClass(focusedField, "expiry", "w-1/2")}>
                <CardExpiryElement
                  options={{ style: ELEMENT_STYLE }}
                  onFocus={() => setFocusedField("expiry")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full"
                />
              </div>
              <div className={fieldWrapperClass(focusedField, "cvc", "w-1/2")}>
                <CardCvcElement
                  options={{ style: ELEMENT_STYLE }}
                  onFocus={() => setFocusedField("cvc")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
            <span className="text-sm font-semibold text-brown-700/86">Total</span>
            <span className="font-heading text-xl font-extrabold text-brown-900">
              CLP {info.amount.toLocaleString("es-CL")}
            </span>
          </div>

          <Button
            variant="brand"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || status === "verifying" || !stripe}
            loading={loading || status === "verifying"}
          >
            <span className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" strokeWidth={2.5} />
              {`Pagar ahora — CLP ${info.amount.toLocaleString("es-CL")}`}
            </span>
          </Button>

          <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pago seguro · datos protegidos · 7 días de garantía
          </p>
        </div>

        <CheckoutTestimonials />
        <CheckoutTrustFooter />
      </div>
    </main>
  );
}

export function StripeCheckout({
  plan,
  info,
}: {
  plan: "basico" | "completo";
  info: { name: string; description: string; amount: number };
}) {
  const options = useMemo(() => ({ locale: "es" as const }), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    stripePromise.then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-cream px-4">
        <p className="text-sm text-brown-700/86">Cargando formulario de pago...</p>
      </main>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutFormInner plan={plan} info={info} />
    </Elements>
  );
}
