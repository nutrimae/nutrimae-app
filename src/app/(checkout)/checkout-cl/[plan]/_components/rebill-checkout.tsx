"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { CheckoutTestimonials } from "@/components/checkout-testimonials";
import { CheckoutTrustFooter } from "@/components/checkout-trust-footer";

/**
 * Checkout embutido da Rebill — mesmo componente `<rebill-checkout>` que
 * roda dentro de um iframe PCI-compliant deles, mas hospedado dentro da
 * nossa própria página (mesma cara do checkout-form.tsx que usa Pagar.me),
 * em vez do link hospedado em pay.rebill.com. O "success" do componente
 * NUNCA libera acesso sozinho — sempre confirma contra
 * /api/rebill/verify-payment antes (ver docs.rebill.com/sdk/checkout).
 */
export function RebillCheckout({
  plan,
  info,
}: {
  plan: "basico" | "completo";
  info: { name: string; description: string; amount: number };
}) {
  const ref = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<"idle" | "verifying" | "granted" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("rebill"), import("rebill/config")]).then(([, { setAssetsURL }]) => {
      // Por padrão o SDK busca seus ícones/loaders de unpkg.com — em redes
      // mais lentas isso demora vários segundos e deixa os campos do cartão
      // em branco nesse meio-tempo. Servimos os mesmos assets pelo nosso
      // próprio domínio (copiados em public/rebill-assets).
      setAssetsURL("/rebill-assets/");
      if (!cancelled) setSdkReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const instantProduct = JSON.stringify({
    name: [{ language: "es", text: info.name }],
    description: [{ language: "es", text: info.description }],
    amount: info.amount,
    currency: "CLP",
    metadata: { plan },
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    async function onSuccess(event: Event) {
      const detail = (event as CustomEvent).detail;
      const paymentId = detail?.data?.result?.paymentId;
      if (!paymentId) {
        setStatus("failed");
        return;
      }
      setStatus("verifying");
      try {
        const res = await fetch("/api/rebill/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        setStatus(res.ok ? "granted" : "failed");
      } catch {
        setStatus("failed");
      }
    }

    function onError(event: Event) {
      const detail = (event as CustomEvent).detail;
      const reason = detail?.data?.result?.statusDetail ?? detail?.data?.error?.error?.message;
      setErrorMessage(reason ?? "No pudimos procesar el pago. Revisa los datos o intenta con otra tarjeta.");
      setStatus("failed");
    }

    function onReady() {
      // O "ready" dispara assim que o componente monta a sessão, mas o
      // iframe dos campos do cartão ainda leva um instante para pintar
      // — sem essa folga o skeleton some antes dos campos aparecerem.
      setTimeout(() => setFormReady(true), 500);
    }

    el.addEventListener("success", onSuccess);
    el.addEventListener("error", onError);
    el.addEventListener("ready", onReady);
    return () => {
      el.removeEventListener("success", onSuccess);
      el.removeEventListener("error", onError);
      el.removeEventListener("ready", onReady);
    };
  }, [sdkReady, status]);

  if (status === "granted") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <CheckCircle2 className="h-14 w-14 text-sage-500" strokeWidth={1.5} />
        <h1 className="font-heading text-2xl font-bold text-brown-900">¡Pago confirmado!</h1>
        <p className="text-sm text-brown-700/86">
          Gracias por confiar en NutriMãe. En los próximos minutos vas a recibir un correo con las instrucciones
          para acceder a tu cuenta.
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
          <Image src="/nutrimae-logo.png" alt="NutriMãe" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-heading text-sm font-bold tracking-tight text-brown-900">NutriMãe</span>
        </div>

        <div className="rounded-[24px] bg-white p-5 text-center shadow-subtle">
          <h1 className="font-heading text-xl font-bold leading-tight text-brown-900">{info.name}</h1>
          <p className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-primary-600">
            CLP {info.amount.toLocaleString("es-CL")}
          </p>
          <p className="mt-1 text-sm font-medium text-sage-600">pago único, acceso de por vida</p>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-strong">
          {status === "verifying" ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <p className="text-sm text-brown-700/86">Confirmando tu pago...</p>
            </div>
          ) : !sdkReady ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <p className="text-sm text-brown-700/86">Cargando formulario de pago...</p>
            </div>
          ) : (
            <div className="relative">
              {!formReady && (
                <div className="absolute inset-0 z-10 flex flex-col items-center gap-3 bg-white py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <p className="text-sm text-brown-700/86">Cargando formulario de pago...</p>
                </div>
              )}
              <rebill-checkout
                ref={ref}
                key={plan}
                public-key={process.env.NEXT_PUBLIC_REBILL_PUBLIC_KEY}
                instant-product={instantProduct}
                language="es"
                one-click-checkout="false"
                display={JSON.stringify({ logo: false, footer: true, sandboxMode: true, excludePaymentMethods: ["bank_transfer", "cash"] })}
                customer-information={JSON.stringify({ phoneNumber: { countryCode: "CL" } })}
              />
            </div>
          )}

          {status === "failed" && errorMessage && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
          )}
        </div>

        <CheckoutTestimonials />
        <CheckoutTrustFooter />
      </div>
    </main>
  );
}
