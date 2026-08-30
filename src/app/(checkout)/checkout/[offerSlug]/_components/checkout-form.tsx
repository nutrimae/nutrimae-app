"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, QrCode, CreditCard, ShieldCheck, Check, Copy, Lock } from "lucide-react";
import { isValidCpf } from "@/lib/utils";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { PixCountdown } from "@/components/pix-countdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { BillingAddressFields, type BillingAddressValue } from "../../../_components/billing-address-fields";
import { BUMP_IMAGES, BUMP_DESCRIPTIONS } from "@/lib/checkout/bump-content";
import { getCheckoutTrackingContext, getFacebookMatchCookies, getQuizAnswers, track } from "@/lib/tracking/client";
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

export function CheckoutForm({
  offer,
  bumps,
}: {
  offer: { slug: string; name: string; priceCents: number };
  bumps: Bump[];
}) {
  const router = useRouter();
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
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

  const bumpTotal = bumps
    .filter((b) => selectedBumps.includes(b.slug))
    .reduce((sum, b) => sum + b.price_cents, 0);
  const totalCents = offer.priceCents + bumpTotal;

  const documentDigits = document.replace(/\D/g, "");
  const documentError = documentTouched && documentDigits.length === 11 && !isValidCpf(documentDigits) ? "CPF inválido — confira os números." : null;

  function toggleBump(slug: string) {
    setSelectedBumps((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    track("bump_toggled", { bump_slug: slug, selected: !selectedBumps.includes(slug) });
  }

  async function handleSubmit() {
    setError(null);

    if (documentDigits.length !== 11 || !isValidCpf(documentDigits)) {
      setDocumentTouched(true);
      setError("Confira o CPF antes de continuar.");
      return;
    }

    if (paymentMethod === "credit_card" && (!billingAddress.line1 || billingAddress.zipCode.replace(/\D/g, "").length !== 8 || !billingAddress.city || !billingAddress.state)) {
      setError("Confira o endereço de cobrança do cartão antes de continuar.");
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Confirme que você não é um robô antes de continuar.");
      return;
    }

    setLoading(true);
    track("checkout_submitted", { offer_slug: offer.slug, payment_method: paymentMethod, bump_slugs: selectedBumps });
    try {
      let cardToken: string | undefined;
      if (paymentMethod === "credit_card") {
        cardToken = await tokenizeCard({
          number: cardNumber,
          holderName: cardHolder,
          expMonth: cardExpMonth,
          expYear: cardExpYear,
          cvv: cardCvv,
        });
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerSlug: offer.slug,
          bumpSlugs: selectedBumps,
          paymentMethod,
          cardToken,
          billingAddress: paymentMethod === "credit_card" ? billingAddress : undefined,
          customer: { name, email, document, phone },
          tracking: getCheckoutTrackingContext(),
          quizAnswers: getQuizAnswers(),
          turnstileToken,
          ...getFacebookMatchCookies(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "bot_verification_failed"
            ? "Não conseguimos confirmar que você não é um robô. Atualize a página e tente de novo."
            : data.error === "payment_processing_failed"
              ? "Não conseguimos processar o pagamento agora. Tente de novo em instantes."
              : "Confira os dados e tente de novo.",
        );
        setLoading(false);
        return;
      }

      if (paymentMethod === "pix") {
        setPix({ orderId: data.orderId, qrCode: data.pix.qrCode, qrCodeUrl: data.pix.qrCodeUrl, expiresAt: data.pix.expiresAt });
        pollPixStatus(data.orderId, data.statusToken);
        return;
      }

      if (data.status === "paid") {
        router.push(`/checkout/obrigado?orderId=${data.orderId}`);
        return;
      }

      if (data.status === "refused") {
        setError("Cartão recusado. Confira os dados ou tente outro cartão.");
        setLoading(false);
        return;
      }

      // "processing" — a confirmação definitiva vem do webhook; a página de
      // obrigado revalida e mostra o estado real.
      router.push(`/checkout/obrigado?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
      setLoading(false);
    }
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
        setError("O Pix expirou ou não foi confirmado. Gere um novo pagamento.");
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
      setError("Não foi possível copiar automaticamente. Selecione e copie o código abaixo.");
    }
  }

  if (pix) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-6 text-center shadow-strong">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-600">
          <QrCode className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-heading text-lg font-bold text-brown-900">Escaneie pra pagar</p>
          <p className="mt-1 text-sm text-brown-700/86">Abra o app do seu banco e escaneie o QR Code, ou copie o código Pix abaixo.</p>
        </div>

        {pix.qrCodeUrl ? (
          <div className="rounded-2xl border-2 border-sage-100 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pix.qrCodeUrl} alt="QR Code Pix" className="h-48 w-48" />
          </div>
        ) : null}

        <button
          type="button"
          onClick={copyPixCode}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-sage-100/80 bg-sage-50 px-4 text-sm font-semibold text-sage-700 transition-transform active:scale-[0.98]"
        >
          {pixCopied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
          {pixCopied ? "Código copiado!" : "Copiar código Pix"}
        </button>
        <textarea readOnly value={pix.qrCode} className="w-full resize-none rounded-2xl border-2 border-sage-100/80 bg-white/80 p-3 text-xs text-brown-700/70" rows={2} />

        <PixCountdown
          expiresAt={pix.expiresAt}
          onExpire={() => {
            setError("O Pix expirou. Gere um novo pagamento.");
            setPix(null);
          }}
        />
        <p className="flex items-center gap-2 text-xs text-brown-700/70">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" /> Aguardando confirmação do pagamento...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-strong">
      {bumps.length > 0 && (
        <div className="flex flex-col gap-2.5 border-b border-sage-100/80 pb-5">
          <p className="font-heading text-sm font-bold text-brown-900">Aproveite e leve também:</p>
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
                  <Chip color="sage">vitalício</Chip>
                  <span className="font-heading font-bold text-primary-600">{formatBRL(bump.price_cents)}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="CPF (só números)"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          onBlur={() => setDocumentTouched(true)}
          error={documentError ?? undefined}
        />
        {!documentError && (
          <p className="-mt-2 text-xs text-brown-700/70">Pedimos o CPF só pra validar o pagamento com segurança, exigência do sistema bancário.</p>
        )}
        <Input placeholder="Telefone (com DDD)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

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
          <CreditCard className="h-4 w-4" /> Cartão
        </button>
      </div>

      {paymentMethod === "credit_card" && (
        <div className="flex flex-col gap-3">
          <Input placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          <Input placeholder="Nome impresso no cartão" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
          <div className="flex gap-2">
            <Input className="w-1/3" placeholder="MM" value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} />
            <Input className="w-1/3" placeholder="AAAA" value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} />
            <Input className="w-1/3" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
          </div>
          <p className="text-xs font-medium text-sage-600">ou 12x de {formatBRL(Math.round(totalCents / 12))} no cartão</p>
          <BillingAddressFields value={billingAddress} onChange={setBillingAddress} />
        </div>
      )}

      <TurnstileWidget onToken={setTurnstileToken} />

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
        <span className="text-sm font-semibold text-brown-700/86">Total</span>
        <span className="font-heading text-xl font-extrabold text-brown-900">{formatBRL(totalCents)}</span>
      </div>

      <Button variant="brand" size="lg" onClick={handleSubmit} disabled={loading} loading={loading}>
        <span className="flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" strokeWidth={2.5} />
          {`Finalizar compra — ${formatBRL(totalCents)}`}
        </span>
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pagamento seguro · dados protegidos · 7 dias de garantia
      </p>
    </div>
  );
}
