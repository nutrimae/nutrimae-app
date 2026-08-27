"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, QrCode, CreditCard, ShieldCheck, Check, Copy } from "lucide-react";
import { event } from "@/lib/fpixel";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { PixCountdown } from "@/components/pix-countdown";
import { Input } from "@/components/ui/input";
import { BillingAddressFields, type BillingAddressValue } from "../../_components/billing-address-fields";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DownsellCheckout({
  parentOrderId,
  parentSubscriptionId,
  priceCents,
}: {
  parentOrderId?: string;
  parentSubscriptionId?: string;
  priceCents: number;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
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

  function handleDeclineFinal() {
    router.push("/app");
  }

  function pollPixStatus(orderId: string, statusToken: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?token=${encodeURIComponent(statusToken)}`);
      const data = await res.json();
      if (data.status === "paid") {
        clearInterval(interval);
        router.push("/app");
      }
      if (data.status === "expired" || data.status === "refused") {
        clearInterval(interval);
        setError("O Pix expirou ou não foi confirmado. Tente de novo.");
        setPix(null);
      }
    }, 4000);
  }

  async function handleAcceptDownsell() {
    setError(null);

    if (paymentMethod === "credit_card" && (!billingAddress.line1 || billingAddress.zipCode.replace(/\D/g, "").length !== 8 || !billingAddress.city || !billingAddress.state)) {
      setError("Confira o endereço de cobrança do cartão antes de continuar.");
      return;
    }

    setLoading(true);
    event("AddToCart", { value: priceCents / 100, currency: "BRL", content_name: "NutriBot — 30 Dias" });

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

      const res = await fetch("/api/checkout/downsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentOrderId,
          parentSubscriptionId,
          paymentMethod,
          cardToken,
          billingAddress: paymentMethod === "credit_card" ? billingAddress : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError("Não conseguimos processar o pagamento agora. Tente de novo em instantes.");
        setLoading(false);
        return;
      }

      if (paymentMethod === "pix") {
        setPix({ orderId: data.orderId, qrCode: data.pix.qrCode, qrCodeUrl: data.pix.qrCodeUrl, expiresAt: data.pix.expiresAt });
        pollPixStatus(data.orderId, data.statusToken);
        return;
      }

      if (data.status === "refused") {
        setError("Cartão recusado. Confira os dados ou tente outro cartão.");
        setLoading(false);
        return;
      }

      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
      setLoading(false);
    }
  }

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(pix?.qrCode ?? "");
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch {
      // Clipboard indisponível — o campo abaixo continua selecionável manualmente.
    }
  }

  if (pix) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-6 text-center shadow-strong">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-600">
          <QrCode className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-brown-700/86">Escaneie o QR Code ou copie o código Pix:</p>
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
            setError("O Pix expirou. Tente de novo.");
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
    <div className="flex flex-col gap-5">
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
          <BillingAddressFields value={billingAddress} onChange={setBillingAddress} />
        </div>
      )}

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAcceptDownsell}
        disabled={loading}
        className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 text-lg font-bold text-white shadow-[0_8px_24px_var(--color-primary-glow)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `SIM! Quero testar por ${formatBRL(priceCents)}`}
      </button>

      <button
        type="button"
        onClick={handleDeclineFinal}
        className="mx-auto text-sm text-brown-700/60 underline"
      >
        Não, quero apenas o meu acesso ao aplicativo base e aos bônus.
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-brown-700/70">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-500" /> Pagamento seguro · dados protegidos
      </p>
    </div>
  );
}
