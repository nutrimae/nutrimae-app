"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { event } from "@/lib/fpixel";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { Input } from "@/components/ui/input";
import { BillingAddressFields, type BillingAddressValue } from "../../_components/billing-address-fields";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Upsell do NutriBot VIP (assinatura recorrente) pra quem acabou de assinar
 * o Plano Mensal — reaproveita o cliente já cadastrado (nome/e-mail/CPF),
 * só pede o cartão de novo. Só cartão: assinatura recorrente não aceita Pix
 * (mesma trava do checkout do Mensal). Ativado em 2026-08-24, substitui o
 * placeholder antigo que só navegava pro downsell sem cobrar de verdade.
 */
export function VipUpsellCheckout({
  parentSubscriptionId,
  recurringPriceCents,
}: {
  parentSubscriptionId: string;
  recurringPriceCents: number;
}) {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState<BillingAddressValue>({ line1: "", zipCode: "", city: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDecline() {
    router.push(`/downsell?subscriptionId=${parentSubscriptionId}`);
  }

  async function handleAccept() {
    setError(null);

    if (!billingAddress.line1 || billingAddress.zipCode.replace(/\D/g, "").length !== 8 || !billingAddress.city || !billingAddress.state) {
      setError("Confira o endereço de cobrança do cartão antes de continuar.");
      return;
    }

    setLoading(true);
    event("AddToCart", { value: recurringPriceCents / 100, currency: "BRL", content_name: "NutriBot VIP" });

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
          offerSlug: "nutribot-vip-mensal",
          parentSubscriptionId,
          cardToken,
          billingAddress,
        }),
      });

      if (!res.ok) {
        setError("Não conseguimos processar a assinatura agora. Confira os dados do cartão ou tente de novo.");
        setLoading(false);
        return;
      }

      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-strong">
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

      <button
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 text-lg font-bold text-white shadow-[0_8px_24px_var(--color-primary-glow)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `SIM! Quero o NutriBot VIP por ${formatBRL(recurringPriceCents)}/mês`}
      </button>

      <button type="button" onClick={handleDecline} className="mx-auto text-sm text-brown-700/60 underline">
        Não, obrigada. Continuar sem o NutriBot VIP.
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pagamento seguro · cancele quando quiser
      </p>
    </div>
  );
}
