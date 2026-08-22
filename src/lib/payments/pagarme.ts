import type {
  PaymentProvider,
  PaymentCustomerInput,
  PaymentCustomerResult,
  CreatePixPaymentInput,
  PixPaymentResult,
  CreateCardPaymentInput,
  CardPaymentResult,
  CreateSubscriptionInput,
  SubscriptionResult,
  PaymentStatusResult,
} from "./provider";

/**
 * Implementação real contra a API v5 do Pagar.me (https://api.pagar.me/core/v5).
 *
 * Superfície verificada contra a documentação oficial atual
 * (docs.pagar.me) nesta sessão: base URL, autenticação (Basic Auth com a
 * secret_key), POST /orders (items + payments[{payment_method, credit_card,
 * pix}]), tokenização de cartão (client-side, POST /tokens com public_key —
 * por isso NÃO existe um método de tokenizar no server: o token já chega
 * pronto em `cardToken`), assinaturas v5 (POST /subscriptions, com
 * `discounts: [{cycles, value}]` pra resolver o preço promocional do 1º
 * ciclo sem inventar um mecanismo que o Pagar.me não tem), e a lista
 * completa de eventos de webhook.
 *
 * ⚠️ NÃO verificado (marcar antes de ativar em produção real):
 * - Formato exato do objeto `phones` no /customers (assumido
 *   `mobile_phone: { country_code, area_code, number }`, padrão comum da
 *   v5, mas não confirmado nesta sessão contra a doc de /customers
 *   especificamente).
 * - Se GET /orders/{id} é de fato o endpoint certo pra polling de status
 *   (usado em getPaymentStatus) — parece óbvio pelo padrão REST, mas não
 *   apareceu explicitamente nas páginas consultadas.
 *
 * ✅ Confirmado direto no painel do Pagar.me (conta de teste real): a
 * autenticação de webhook é HTTP Basic Auth (usuário/senha escolhidos ao
 * cadastrar o webhook em Configurações → Webhooks), não HMAC — ver
 * src/app/api/webhooks/pagarme/route.ts. Os nomes de evento usados no
 * webhook (order.paid, order.payment_failed, charge.paid,
 * charge.payment_failed, charge.refunded, charge.chargedback,
 * subscription.created, subscription.canceled) também foram conferidos
 * contra a lista real de eventos disponíveis no painel.
 */

const BASE_URL = "https://api.pagar.me/core/v5";

function getSecretKey(): string {
  const key = process.env.PAGARME_API_KEY;
  if (!key) throw new Error("PAGARME_API_KEY não configurada.");
  return key;
}

function authHeader(): string {
  // Basic Auth: usuário = secret_key, senha = vazia. Confirmado na doc oficial.
  const token = Buffer.from(`${getSecretKey()}:`).toString("base64");
  return `Basic ${token}`;
}

async function pagarmeFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Pagar.me ${init.method ?? "GET"} ${path} falhou (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

function splitPhone(phone: string | undefined): { area_code: string; number: string } | null {
  if (!phone) return null;
  // Telefone salvo como "5511999999999" (DDI + DDD + número, sem "+").
  // Corta o DDI "55" e separa DDD (2) do resto — mesmo formato usado em
  // src/lib/utils.ts sanitizePhoneNumber().
  const digits = phone.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("55") ? digits.slice(2) : digits;
  if (withoutCountryCode.length < 10) return null;
  return {
    area_code: withoutCountryCode.slice(0, 2),
    number: withoutCountryCode.slice(2),
  };
}

interface PagarmeCustomerResponse {
  id: string;
}

interface PagarmeCharge {
  id: string;
  status: string;
  last_transaction?: {
    id?: string;
    qr_code?: string;
    qr_code_url?: string;
    expires_at?: string;
    card?: { brand?: string; last_four_digits?: string };
  };
}

interface PagarmeOrderResponse {
  id: string;
  status: string;
  charges?: PagarmeCharge[];
}

interface PagarmeSubscriptionResponse {
  id: string;
  status: string;
  next_billing_at?: string;
}

export class PagarMeProvider implements PaymentProvider {
  async createCustomer(input: PaymentCustomerInput): Promise<PaymentCustomerResult> {
    const phone = splitPhone(input.phone);

    const result = await pagarmeFetch<PagarmeCustomerResponse>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        type: "individual",
        document: input.document,
        document_type: "CPF",
        ...(phone
          ? { phones: { mobile_phone: { country_code: "55", ...phone } } }
          : {}),
      }),
    });

    return { providerCustomerId: result.id };
  }

  async createPixPayment(input: CreatePixPaymentInput): Promise<PixPaymentResult> {
    const order = await pagarmeFetch<PagarmeOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_id: input.providerCustomerId,
        items: [{ amount: input.amountCents, description: input.description, quantity: 1 }],
        payments: [
          {
            payment_method: "pix",
            pix: { expires_in: input.expiresInSeconds ?? 30 * 60 },
          },
        ],
        metadata: input.metadata,
      }),
    });

    const charge = order.charges?.[0];
    const tx = charge?.last_transaction;

    if (!charge || !tx?.qr_code || !tx.qr_code_url || !tx.expires_at) {
      throw new Error(
        `Pagar.me: resposta de criação de Pix sem QR code — payload real: ${JSON.stringify(order).slice(-3000)}`,
      );
    }

    return {
      providerOrderId: order.id,
      providerChargeId: charge.id,
      qrCode: tx.qr_code,
      qrCodeUrl: tx.qr_code_url,
      expiresAt: tx.expires_at,
      status: "pending",
    };
  }

  async createCardPayment(input: CreateCardPaymentInput): Promise<CardPaymentResult> {
    const order = await pagarmeFetch<PagarmeOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_id: input.providerCustomerId,
        items: [{ amount: input.amountCents, description: input.description, quantity: 1 }],
        payments: [
          {
            payment_method: "credit_card",
            credit_card: {
              card_token: input.cardToken,
              installments: input.installments ?? 1,
            },
          },
        ],
        metadata: input.metadata,
      }),
    });

    const charge = order.charges?.[0];
    if (!charge) {
      throw new Error("Pagar.me: resposta de cobrança de cartão sem charge — verificar payload contra a doc atual.");
    }

    const status: CardPaymentResult["status"] =
      charge.status === "paid" ? "paid" : charge.status === "failed" ? "refused" : "processing";

    return {
      providerOrderId: order.id,
      providerChargeId: charge.id,
      status,
      cardBrand: charge.last_transaction?.card?.brand,
      cardLast4: charge.last_transaction?.card?.last_four_digits,
    };
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult> {
    const hasPromoCycle =
      input.firstCycleAmountCents != null && input.firstCycleAmountCents < input.amountCents;

    const subscription = await pagarmeFetch<PagarmeSubscriptionResponse>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer_id: input.providerCustomerId,
        payment_method: "credit_card",
        card_token: input.cardToken,
        interval: "month",
        interval_count: 1,
        billing_type: "prepaid",
        items: [{ description: input.description, pricing_scheme: { price: input.amountCents } }],
        // Desconto só no 1º ciclo — é assim que o Pagar.me v5 suporta preço
        // promocional de primeiro ciclo (confirmado na doc de "assinatura
        // avulsa": discounts[].cycles limita a quantos ciclos o desconto vale).
        ...(hasPromoCycle
          ? {
              discounts: [
                { cycles: 1, value: input.amountCents - (input.firstCycleAmountCents ?? input.amountCents) },
              ],
            }
          : {}),
        metadata: input.metadata,
      }),
    });

    return {
      providerSubscriptionId: subscription.id,
      status: subscription.status,
      nextBillingAt: subscription.next_billing_at,
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    await pagarmeFetch(`/subscriptions/${providerSubscriptionId}`, { method: "DELETE" });
  }

  async refundPayment(providerChargeId: string, amountCents?: number): Promise<void> {
    await pagarmeFetch(`/charges/${providerChargeId}/refund`, {
      method: "POST",
      body: JSON.stringify(amountCents != null ? { amount: amountCents } : {}),
    });
  }

  async getPaymentStatus(providerOrderId: string): Promise<PaymentStatusResult> {
    const order = await pagarmeFetch<PagarmeOrderResponse>(`/orders/${providerOrderId}`, { method: "GET" });
    return { status: order.status };
  }
}
