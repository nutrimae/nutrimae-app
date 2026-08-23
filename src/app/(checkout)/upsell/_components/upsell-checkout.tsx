"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, QrCode, CreditCard, ShieldCheck } from "lucide-react";
import { PixCountdown } from "@/components/pix-countdown";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Mesma tokenização client-side usada no checkout principal — ver
 * src/app/(checkout)/checkout/[offerSlug]/_components/checkout-form.tsx. */
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

export function UpsellCheckout({
  parentOrderId,
  offerSlug,
  priceCents,
}: {
  parentOrderId: string;
  offerSlug: string;
  priceCents: number;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{ orderId: string; qrCode: string; qrCodeUrl: string; expiresAt: string } | null>(null);

  function handleDecline() {
    router.push(`/downsell?orderId=${parentOrderId}`);
  }

  function pollPixStatus(orderId: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?orderId=${orderId}`);
      const data = await res.json();
      if (data.status === "paid") {
        clearInterval(interval);
        router.push(`/downsell?orderId=${parentOrderId}`);
      }
      if (data.status === "expired" || data.status === "refused") {
        clearInterval(interval);
        setError("O Pix expirou ou não foi confirmado. Tente de novo.");
        setPix(null);
      }
    }, 4000);
  }

  async function handleAccept() {
    setError(null);
    setLoading(true);

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

      const res = await fetch("/api/checkout/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentOrderId, offerSlug, paymentMethod, cardToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError("Não conseguimos processar o pagamento agora. Tente de novo em instantes.");
        setLoading(false);
        return;
      }

      if (paymentMethod === "pix") {
        setPix({ orderId: data.orderId, qrCode: data.pix.qrCode, qrCodeUrl: data.pix.qrCodeUrl, expiresAt: data.pix.expiresAt });
        pollPixStatus(data.orderId);
        return;
      }

      if (data.status === "refused") {
        setError("Cartão recusado. Confira os dados ou tente outro cartão.");
        setLoading(false);
        return;
      }

      router.push(`/downsell?orderId=${parentOrderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
      setLoading(false);
    }
  }

  if (pix) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-sm">
        <QrCode className="h-8 w-8 text-rose-600" strokeWidth={1.75} />
        <p className="text-sm text-gray-600">Escaneie o QR Code ou copie o código Pix:</p>
        {pix.qrCodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pix.qrCodeUrl} alt="QR Code Pix" className="h-48 w-48" />
        ) : null}
        <textarea readOnly value={pix.qrCode} className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-500" rows={3} />
        <PixCountdown
          expiresAt={pix.expiresAt}
          onExpire={() => {
            setError("O Pix expirou. Tente de novo.");
            setPix(null);
          }}
        />
        <p className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Aguardando confirmação do pagamento...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("pix")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${paymentMethod === "pix" ? "border-rose-600 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500"}`}
        >
          <QrCode className="h-4 w-4" /> Pix
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("credit_card")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${paymentMethod === "credit_card" ? "border-rose-600 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500"}`}
        >
          <CreditCard className="h-4 w-4" /> Cartão
        </button>
      </div>

      {paymentMethod === "credit_card" && (
        <div className="flex flex-col gap-3">
          <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Nome impresso no cartão" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
          <div className="flex gap-2">
            <input className="w-1/3 rounded-lg border border-gray-200 p-3 text-sm" placeholder="MM" value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} />
            <input className="w-1/3 rounded-lg border border-gray-200 p-3 text-sm" placeholder="AAAA" value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} />
            <input className="w-1/3 rounded-lg border border-gray-200 p-3 text-sm" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className="min-h-16 w-full animate-[pulse_2s_ease-in-out_infinite] rounded-2xl bg-[#25D366] px-6 text-lg font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a] disabled:opacity-60"
      >
        {loading ? "Processando..." : `SIM! Quero adicionar por ${formatBRL(priceCents)}`}
      </button>

      <button type="button" onClick={handleDecline} className="mx-auto text-sm text-gray-400 underline hover:text-gray-600">
        Não, obrigada. Continuar sem essa.
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Pagamento seguro · dados protegidos
      </p>
    </div>
  );
}
