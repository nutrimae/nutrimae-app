"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, ShieldCheck, Loader2, Check } from "lucide-react";
import { isValidCpf } from "@/lib/utils";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { BillingAddressFields, type BillingAddressValue } from "../../../_components/billing-address-fields";
import { BUMP_IMAGES, BUMP_DESCRIPTIONS } from "@/lib/checkout/bump-content";
import { getCheckoutTrackingContext, getQuizAnswers, track } from "@/lib/tracking/client";

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
export function SubscriptionCheckoutForm({
  offer,
  bumps,
}: {
  offer: { slug: string; name: string; priceCents: number };
  bumps: Bump[];
}) {
  const router = useRouter();
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
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

  useEffect(() => { track("checkout_viewed", { offer_slug: offer.slug }); }, [offer.slug]);

  const bumpTotal = bumps.filter((b) => selectedBumps.includes(b.slug)).reduce((sum, b) => sum + b.price_cents, 0);
  const chargedNowCents = offer.priceCents + bumpTotal;

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

    if (!billingAddress.line1 || billingAddress.zipCode.replace(/\D/g, "").length !== 8 || !billingAddress.city || !billingAddress.state) {
      setError("Confira o endereço de cobrança do cartão antes de continuar.");
      return;
    }

    setLoading(true);
    track("checkout_submitted", { offer_slug: offer.slug, payment_method: "credit_card", bump_slugs: selectedBumps });
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError("Não conseguimos processar sua assinatura agora. Tente de novo em instantes.");
        setLoading(false);
        return;
      }

      router.push(`/checkout/obrigado?subscriptionId=${data.subscriptionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
      setLoading(false);
    }
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
          {selectedBumps.length > 0 && (
            <p className="text-xs text-brown-700/70">
              Pagamento único, cobrado uma vez só junto com o 1º ciclo — nunca entra na sua mensalidade.
            </p>
          )}
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
        <Input placeholder="Telefone (com DDD)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-primary-50 p-3 text-sm font-semibold text-primary-600">
        <CreditCard className="h-4 w-4" /> Cartão de crédito (obrigatório para assinatura)
      </div>

      <div className="flex flex-col gap-3">
        <Input placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        <Input placeholder="Nome impresso no cartão" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
        <div className="flex gap-2">
          <Input className="w-1/3" placeholder="MM" value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} />
          <Input className="w-1/3" placeholder="AAAA" value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} />
          <Input className="w-1/3" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
        </div>
        <BillingAddressFields value={billingAddress} onChange={setBillingAddress} />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
        <span className="text-sm font-semibold text-brown-700/86">Cobrado agora</span>
        <span className="font-heading text-xl font-extrabold text-brown-900">{formatBRL(chargedNowCents)}</span>
      </div>

      <p className="text-center text-xs font-medium text-sage-600">Cancele quando quiser, sem multa.</p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 text-base font-bold text-white shadow-[0_4px_16px_var(--color-primary-shadow)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Assinar agora — ${formatBRL(chargedNowCents)}`}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pagamento seguro · dados protegidos
      </p>
    </div>
  );
}
