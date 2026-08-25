"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { isValidCpf } from "@/lib/utils";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { Input } from "@/components/ui/input";
import { BillingAddressFields, type BillingAddressValue } from "../../../_components/billing-address-fields";

/**
 * Checkout de assinatura recorrente (Plano Mensal, NutriBot VIP) — isolado
 * do checkout de pagamento único (checkout-form.tsx) de propósito: só
 * cartão (Pix não garante recorrência), sem order bumps, e chama
 * /api/checkout/subscription em vez de /api/checkout. Só fica alcançável
 * quando a oferta correspondente estiver com active=true.
 */

export function SubscriptionCheckoutForm({ offer }: { offer: { slug: string; name: string } }) {
  const router = useRouter();
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

  const documentDigits = document.replace(/\D/g, "");
  const documentError = documentTouched && documentDigits.length === 11 && !isValidCpf(documentDigits) ? "CPF inválido — confira os números." : null;

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
          cardToken,
          billingAddress,
          customer: { name, email, document, phone },
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

      <p className="text-center text-xs font-medium text-sage-600">Cancele quando quiser, sem multa.</p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 text-base font-bold text-white shadow-[0_4px_16px_var(--color-primary-shadow)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Assinar agora"}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pagamento seguro · dados protegidos
      </p>
    </div>
  );
}
