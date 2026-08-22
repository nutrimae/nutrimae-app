"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck } from "lucide-react";
import { isValidCpf } from "@/lib/utils";

/**
 * Checkout de assinatura recorrente (Plano Mensal, NutriBot VIP) — isolado
 * do checkout de pagamento único (checkout-form.tsx) de propósito: só
 * cartão (Pix não garante recorrência), sem order bumps, e chama
 * /api/checkout/subscription em vez de /api/checkout. Só fica alcançável
 * quando a oferta correspondente estiver com active=true.
 */
async function tokenizeCard(card: { number: string; holderName: string; expMonth: string; expYear: string; cvv: string }) {
  const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_PAGARME_PUBLIC_KEY não configurada.");

  const res = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${publicKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "card",
      card: {
        number: card.number.replace(/\s/g, ""),
        holder_name: card.holderName,
        exp_month: card.expMonth,
        exp_year: card.expYear,
        cvv: card.cvv,
      },
    }),
  });

  if (!res.ok) throw new Error("Não foi possível validar o cartão. Confira os dados e tente de novo.");
  const data: { id: string } = await res.json();
  return data.id;
}

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
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex flex-col gap-1">
          <input
            className={`rounded-lg border p-3 text-sm ${documentError ? "border-red-400" : "border-gray-200"}`}
            placeholder="CPF (só números)"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            onBlur={() => setDocumentTouched(true)}
          />
          {documentError && <p className="text-xs text-red-600">{documentError}</p>}
        </div>
        <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Telefone (com DDD)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-rose-600 bg-rose-50 p-3 text-sm font-semibold text-rose-600">
        <CreditCard className="h-4 w-4" /> Cartão de crédito (obrigatório para assinatura)
      </div>

      <div className="flex flex-col gap-3">
        <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Nome impresso no cartão" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
        <div className="flex gap-2">
          <input className="w-1/3 rounded-lg border border-gray-200 p-3 text-sm" placeholder="MM" value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} />
          <input className="w-1/3 rounded-lg border border-gray-200 p-3 text-sm" placeholder="AAAA" value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} />
          <input className="w-1/3 rounded-lg border border-gray-200 p-3 text-sm" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-center text-xs text-gray-500">Cancele quando quiser, sem multa.</p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="min-h-14 w-full rounded-2xl bg-[#25D366] px-6 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a] disabled:opacity-60"
      >
        {loading ? "Processando..." : "Assinar agora"}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Pagamento seguro · dados protegidos
      </p>
    </div>
  );
}
