"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, QrCode, CreditCard, ShieldCheck } from "lucide-react";
import { isValidCpf } from "@/lib/utils";
import { tokenizeCard } from "@/lib/payments/tokenize-card";
import { PixCountdown } from "@/components/pix-countdown";
import { BillingAddressFields, type BillingAddressValue } from "../../../_components/billing-address-fields";

interface Bump {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
}

const BUMP_IMAGES: Record<string, string> = {
  "protocolo-intestino": "/images/order-bumps/protocolo-intestino.png",
  "sos-desmame": "/images/order-bumps/sos-desmame.png",
  "nutribot-30d": "/images/order-bumps/nutribot-30d.png",
};

const BUMP_DESCRIPTIONS: Record<string, string> = {
  "batch-cooking": "Cozinhe a semana inteira em uma hora só. Método de porcionamento, tabela de validade e etiquetas pra imprimir. Acesso vitalício, não entra na assinatura.",
};

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

  const bumpTotal = bumps
    .filter((b) => selectedBumps.includes(b.slug))
    .reduce((sum, b) => sum + b.price_cents, 0);
  const totalCents = offer.priceCents + bumpTotal;

  const documentDigits = document.replace(/\D/g, "");
  const documentError = documentTouched && documentDigits.length === 11 && !isValidCpf(documentDigits) ? "CPF inválido — confira os números." : null;

  function toggleBump(slug: string) {
    setSelectedBumps((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error === "payment_processing_failed" ? "Não conseguimos processar o pagamento agora. Tente de novo em instantes." : "Confira os dados e tente de novo.");
        setLoading(false);
        return;
      }

      if (paymentMethod === "pix") {
        setPix({ orderId: data.orderId, qrCode: data.pix.qrCode, qrCodeUrl: data.pix.qrCodeUrl, expiresAt: data.pix.expiresAt });
        pollPixStatus(data.orderId);
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

  function pollPixStatus(orderId: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?orderId=${orderId}`);
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
            setError("O Pix expirou. Gere um novo pagamento.");
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
      {bumps.length > 0 && (
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
          <p className="text-sm font-semibold text-gray-800">Aproveite e leve também:</p>
          {bumps.map((bump) => (
            <label
              key={bump.id}
              className={`flex items-center gap-3 rounded-xl border p-2 text-sm text-gray-700 transition-colors ${selectedBumps.includes(bump.slug) ? "border-rose-300 bg-rose-50" : "border-gray-100"}`}
            >
              <input type="checkbox" checked={selectedBumps.includes(bump.slug)} onChange={() => toggleBump(bump.slug)} />
              {BUMP_IMAGES[bump.slug] && (
                <Image
                  src={BUMP_IMAGES[bump.slug]}
                  alt={bump.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              )}
              <span className="flex-1">
                <span className="block">{bump.name}</span>
                {BUMP_DESCRIPTIONS[bump.slug] && (
                  <span className="mt-0.5 block text-xs text-gray-500">{BUMP_DESCRIPTIONS[bump.slug]}</span>
                )}
              </span>
              <span className="font-medium">{formatBRL(bump.price_cents)}</span>
            </label>
          ))}
        </div>
      )}

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
          {documentError ? (
            <p className="text-xs text-red-600">{documentError}</p>
          ) : (
            <p className="text-xs text-gray-400">Pedimos o CPF só pra validar o pagamento com segurança, exigência do sistema bancário.</p>
          )}
        </div>
        <input className="rounded-lg border border-gray-200 p-3 text-sm" placeholder="Telefone (com DDD)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

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
          <p className="text-xs text-gray-400">ou 12x de {formatBRL(Math.round(totalCents / 12))} no cartão</p>
          <BillingAddressFields value={billingAddress} onChange={setBillingAddress} />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-500">Total</span>
        <span className="text-lg font-bold text-gray-900">{formatBRL(totalCents)}</span>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="min-h-14 w-full rounded-2xl bg-[#25D366] px-6 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a] disabled:opacity-60"
      >
        {loading ? "Processando..." : `Finalizar compra — ${formatBRL(totalCents)}`}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Pagamento seguro · dados protegidos · 7 dias de garantia
      </p>
    </div>
  );
}
