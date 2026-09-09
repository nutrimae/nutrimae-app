"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, ShieldCheck, Loader2, Check, QrCode, Copy } from "lucide-react";
import { isValidCpf } from "@/lib/utils";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { PixCountdown } from "@/components/pix-countdown";
import { Input } from "@/components/ui/input";
import { BillingAddressFields, type BillingAddressValue } from "../../../_components/billing-address-fields";
import { BUMP_IMAGES, BUMP_DESCRIPTIONS } from "@/lib/checkout/bump-content";
import { getCheckoutTrackingContext, getQuizAnswers, track } from "@/lib/tracking/client";
import { TurnstileWidget } from "@/components/turnstile-widget";

interface Bump {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Checkout de assinatura recorrente (Plano Mensal, NutriBot VIP) — isolado
 * do checkout de pagamento único (checkout-form.tsx) de propósito: só
 * cartão (Pix não garante recorrência), e chama /api/checkout/subscription
 * em vez de /api/checkout. Só fica alcançável quando a oferta
 * correspondente estiver com active=true.
 *
 * Order bumps (ativados em 2026-08-24, mesmos do Anual) são pagamento
 * único — nunca entram no valor recorrente, só no cartão cobrado agora,
 * junto com o 1º ciclo da assinatura (ver /api/checkout/subscription).
 */
/**
 * Pix no Mensal: exceção temporária de validação (ver comentário em
 * src/app/api/checkout/route.ts) — só a oferta "nutrimae-mensal" mostra a
 * aba Pix; qualquer outra oferta recorrente (ex.: NutriBot VIP) continua
 * só-cartão, porque Pix não sustenta cobrança recorrente automática.
 */
const PIX_ENABLED_SLUGS = new Set(["nutrimae-mensal"]);

export function SubscriptionCheckoutForm({
  offer,
  bumps,
}: {
  offer: { slug: string; name: string; priceCents: number; recurringPriceCents: number | null };
  bumps: Bump[];
}) {
  const router = useRouter();
  const allowPix = PIX_ENABLED_SLUGS.has(offer.slug);
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">(allowPix ? "pix" : "credit_card");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [documentTouched, setDocumentTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState<BillingAddressValue>({ line1: "", zipCode: "", city: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{ orderId: string; qrCode: string; qrCodeUrl: string; expiresAt: string } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => { track("checkout_viewed", { offer_slug: offer.slug }); }, [offer.slug]);

  const bumpTotal = bumps.filter((b) => selectedBumps.includes(b.slug)).reduce((sum, b) => sum + b.price_cents, 0);
  const chargedNowCents = offer.priceCents + bumpTotal;

  const documentDigits = document.replace(/\D/g, "");
  const documentError = documentTouched && documentDigits.length === 11 && !isValidCpf(documentDigits) ? "CPF inválido — revisa los números." : null;

  function toggleBump(slug: string) {
    setSelectedBumps((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    track("bump_toggled", { bump_slug: slug, selected: !selectedBumps.includes(slug) });
  }

  function pollPixStatus(orderId: string, statusToken: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?token=${encodeURIComponent(statusToken)}`);
      const data = await res.json();
      if (data.status === "paid") {
        clearInterval(interval);
        router.push(`/checkout/obrigado?orderId=${orderId}`);
      }
      if (data.status === "expired" || data.status === "refused") {
        clearInterval(interval);
        setError("El Pix expiró o no fue confirmado. Genera un nuevo pago.");
        setPix(null);
      }
    }, 4000);
  }

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(pix?.qrCode ?? "");
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch {
      setError("No fue posible copiar automáticamente. Selecciona y copia el código abajo.");
    }
  }

  async function handleSubmit() {
    setError(null);

    if (documentDigits.length !== 11 || !isValidCpf(documentDigits)) {
      setDocumentTouched(true);
      setError("Revisa el CPF antes de continuar.");
      return;
    }

    if (
      paymentMethod === "credit_card" &&
      (!billingAddress.line1 || billingAddress.zipCode.replace(/\D/g, "").length !== 8 || !billingAddress.city || !billingAddress.state)
    ) {
      setError("Revisa la dirección de facturación de la tarjeta antes de continuar.");
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Confirma que no eres un robot antes de continuar.");
      return;
    }

    setLoading(true);
    track("checkout_submitted", { offer_slug: offer.slug, payment_method: paymentMethod, bump_slugs: selectedBumps });

    // Pix (só no Mensal, ver PIX_ENABLED_SLUGS): pagamento avulso de 1
    // ciclo via /api/checkout, sem criar subscription — nunca renova
    // sozinho. Cartão continua no fluxo de assinatura de verdade.
    if (paymentMethod === "pix") {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerSlug: offer.slug,
            bumpSlugs: selectedBumps,
            paymentMethod: "pix",
            customer: { name, email, document, phone },
            tracking: getCheckoutTrackingContext(),
            quizAnswers: getQuizAnswers(),
            turnstileToken,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(
            data.error === "bot_verification_failed"
              ? "No pudimos confirmar que no eres un robot. Actualiza la página e intenta de nuevo."
              : "No pudimos generar el Pix ahora. Intenta de nuevo en unos instantes.",
          );
          setLoading(false);
          return;
        }

        setPix({ orderId: data.orderId, qrCode: data.pix.qrCode, qrCodeUrl: data.pix.qrCodeUrl, expiresAt: data.pix.expiresAt });
        pollPixStatus(data.orderId, data.statusToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
        setLoading(false);
      }
      return;
    }

    try {
      const cardToken = await tokenizeCard({
        number: cardNumber,
        holderName: cardHolder,
        expMonth: cardExpMonth,
        expYear: cardExpYear,
        cvv: cardCvv,
      });

      const res = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerSlug: offer.slug,
          bumpSlugs: selectedBumps,
          cardToken,
          billingAddress,
          customer: { name, email, document, phone },
          tracking: getCheckoutTrackingContext(),
          quizAnswers: getQuizAnswers(),
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "bot_verification_failed"
            ? "No pudimos confirmar que no eres un robot. Actualiza la página e intenta de nuevo."
            : "No pudimos procesar tu suscripción ahora. Intenta de nuevo en unos instantes.",
        );
        setLoading(false);
        return;
      }

      router.push(`/checkout/obrigado?subscriptionId=${data.subscriptionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (pix) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-6 text-center shadow-strong">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-600">
          <QrCode className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-heading text-lg font-bold text-brown-900">Escanea para pagar</p>
          <p className="mt-1 text-sm text-brown-700/86">Abre la app de tu banco y escanea el código QR, o copia el código Pix abajo.</p>
        </div>

        {pix.qrCodeUrl ? (
          <div className="rounded-2xl border-2 border-sage-100 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pix.qrCodeUrl} alt="Código QR Pix" className="h-48 w-48" />
          </div>
        ) : null}

        <button
          type="button"
          onClick={copyPixCode}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-sage-100/80 bg-sage-50 px-4 text-sm font-semibold text-sage-700 transition-transform active:scale-[0.98]"
        >
          {pixCopied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
          {pixCopied ? "¡Código copiado!" : "Copiar código Pix"}
        </button>
        <textarea readOnly value={pix.qrCode} className="w-full resize-none rounded-2xl border-2 border-sage-100/80 bg-white/80 p-3 text-xs text-brown-700/70" rows={2} />

        <PixCountdown
          expiresAt={pix.expiresAt}
          onExpire={() => {
            setError("El Pix expiró. Genera un nuevo pago.");
            setPix(null);
          }}
        />
        <p className="flex items-center gap-2 text-xs text-brown-700/70">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" /> Esperando la confirmación del pago...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-strong">
      {bumps.length > 0 && (
        <div className="flex flex-col gap-2.5 border-b border-sage-100/80 pb-5">
          <p className="font-heading text-sm font-bold text-brown-900">Aprovecha y lleva también:</p>
          {bumps.map((bump) => {
            const selected = selectedBumps.includes(bump.slug);
            return (
              <label
                key={bump.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                  selected ? "border-primary-300 bg-primary-50" : "border-sage-100/80 bg-white"
                }`}
              >
                <input type="checkbox" checked={selected} onChange={() => toggleBump(bump.slug)} className="sr-only" />
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? "border-primary-500 bg-primary-500" : "border-sage-200 bg-white"
                  }`}
                >
                  {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                </span>
                {BUMP_IMAGES[bump.slug] && (
                  <Image
                    src={BUMP_IMAGES[bump.slug]}
                    alt={bump.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-subtle"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-brown-900">{bump.name}</span>
                  {BUMP_DESCRIPTIONS[bump.slug] && (
                    <span className="mt-0.5 block text-xs leading-snug text-brown-700/82">{BUMP_DESCRIPTIONS[bump.slug]}</span>
                  )}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-heading font-bold text-primary-600">{formatBRL(bump.price_cents)}</span>
                </span>
              </label>
            );
          })}
          {selectedBumps.length > 0 && (
            <p className="text-xs text-brown-700/70">
              Pago único, cobrado una sola vez junto con el 1er ciclo — nunca entra en tu mensualidad.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="CPF (solo números)"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          onBlur={() => setDocumentTouched(true)}
          error={documentError ?? undefined}
        />
        <Input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      {allowPix ? (
        <div className="flex gap-2 rounded-2xl bg-sage-50 p-1.5">
          <button
            type="button"
            onClick={() => setPaymentMethod("pix")}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              paymentMethod === "pix" ? "bg-white text-primary-600 shadow-subtle" : "text-brown-700/70"
            }`}
          >
            <QrCode className="h-4 w-4" /> Pix
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("credit_card")}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              paymentMethod === "credit_card" ? "bg-white text-primary-600 shadow-subtle" : "text-brown-700/70"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Tarjeta
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl bg-primary-50 p-3 text-sm font-semibold text-primary-600">
          <CreditCard className="h-4 w-4" /> Tarjeta de crédito (obligatoria para la suscripción)
        </div>
      )}

      {paymentMethod === "pix" && allowPix && (
        <p className="text-xs text-brown-700/70">
          Con Pix, este pago cubre solo el 1er mes — la renovación no es automática. Para mantener el acceso cada
          mes sin tener que pagar de nuevo, elige Tarjeta.
        </p>
      )}

      {paymentMethod === "credit_card" && (
        <div className="flex flex-col gap-3">
          <Input placeholder="Número de la tarjeta" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          <Input placeholder="Nombre impreso en la tarjeta" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
          <div className="flex gap-2">
            <Input className="w-1/3" placeholder="MM" value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} />
            <Input className="w-1/3" placeholder="AAAA" value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} />
            <Input className="w-1/3" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
          </div>
          <BillingAddressFields value={billingAddress} onChange={setBillingAddress} />
        </div>
      )}

      <TurnstileWidget onToken={setTurnstileToken} />

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

      {paymentMethod === "credit_card" && offer.recurringPriceCents != null && offer.recurringPriceCents > offer.priceCents ? (
        <div className="rounded-2xl bg-primary-50 p-4 text-center">
          <p className="text-xs text-brown-700/70">
            De <span className="font-bold text-red-500 line-through">{formatBRL(offer.recurringPriceCents)}</span> por
          </p>
          <p className="mt-0.5 font-heading text-3xl font-extrabold text-primary-600">{formatBRL(chargedNowCents)}</p>
          <p className="mt-0.5 text-sm font-bold text-brown-700">en el 1er mes, luego {formatBRL(offer.recurringPriceCents)}/mes</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
          <span className="text-sm font-semibold text-brown-700/86">Cobrado ahora</span>
          <span className="font-heading text-xl font-extrabold text-brown-900">{formatBRL(chargedNowCents)}</span>
        </div>
      )}

      <p className="text-center text-xs font-medium text-sage-600">
        {paymentMethod === "credit_card" ? "Cancela cuando quieras, sin penalidad." : "Pago único de este ciclo, con Pix."}
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 text-base font-bold text-white shadow-[0_4px_16px_var(--color-primary-shadow)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : paymentMethod === "pix" ? (
          `Generar Pix — ${formatBRL(chargedNowCents)}`
        ) : (
          `Suscribirme ahora — ${formatBRL(chargedNowCents)}`
        )}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pago seguro · datos protegidos
      </p>
    </div>
  );
}
