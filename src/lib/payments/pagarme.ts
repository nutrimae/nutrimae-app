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
  BillingAddress,
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
 * - Se GET /orders/{id} é de fato o endpoint certo pra polling de status
 *   (usado em getPaymentStatus) — parece óbvio pelo padrão REST, mas não
 *   apareceu explicitamente nas páginas consultadas.
 *
 * ✅ Confirmado contra o sandbox real nesta sessão (testes com curl direto,
 * fora do Next.js):
 * - `phones` no /customers: `mobile_phone: { country_code, area_code, number }`
 *   está correto (customer criado com sucesso).
 * - Todo item de /orders exige `code` — sem ele, a API responde
 *   "The item Code is required." (não estava na doc consultada antes).
 * - Cobrança de cartão com `card_token` exige o endereço de cobrança MESMO
 *   ASSIM (a doc lista os campos de billing_address como opcionais, mas o
 *   sandbox rejeita com "billing | value is required" sem ele, e depois
 *   "field is required" um a um pra line_1/zip_code/city/state/country até
 *   os 5 estarem presentes) — vai aninhado em
 *   `credit_card.card.billing_address`, não em `credit_card.billing_address`
 *   direto (o `card` aqui carrega só o billing_address, sem duplicar o
 *   `card_token`). Ver BillingAddress em ./provider.ts.
 * - Pix falhou no sandbox desta conta com
 *   "action_forbidden | Sem ambiente configurado para este tipo de
 *   transação" — não era bug de código, era configuração pendente no painel
 *   do Pagar.me (suporte da Pagar.me habilitou Pix pra esta conta/ambiente;
 *   confirmado pago via webhook depois disso).
 * - POST /subscriptions: `items[0].quantity` é obrigatório (diferente de
 *   /orders, onde é opcional) — "The quantity field is required." sem ele.
 *   `discounts[].discount_type` precisa ser `"flat"` explicitamente pra
 *   `value` ser centavos; sem isso a Pagar.me assume `"percentage"` por
 *   padrão e rejeita qualquer valor > 100. `billing_address` aninhado em
 *   `card` (mesmo padrão do createCardPayment) também funciona aqui.
 *   Assinatura de teste criada e confirmada com status "active" e desconto
 *   do 1º ciclo aplicado corretamente.
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

/**
 * A Pagar.me exige `code` em cada item de /orders ("The item Code is
 * required.", confirmado contra o sandbox — não estava na doc consultada
 * antes de codar isto). Usa o id do pedido local (metadata.order_id) como
 * code, já que cada chamada monta um único item agregado (oferta + bumps
 * somados); sem metadata, cai num valor genérico só pra satisfazer a API.
 */
function itemCode(metadata: Record<string, string> | undefined): string {
  return metadata?.order_id ?? "item-1";
}

function billingAddressPayload(address: BillingAddress) {
  return {
    line_1: address.line1,
    zip_code: address.zipCode.replace(/\D/g, ""),
    city: address.city,
    state: address.state,
    country: address.country,
  };
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
        items: [{ code: itemCode(input.metadata), amount: input.amountCents, description: input.description, quantity: 1 }],
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
        items: [{ code: itemCode(input.metadata), amount: input.amountCents, description: input.description, quantity: 1 }],
        payments: [
          {
            payment_method: "credit_card",
            credit_card: {
              card_token: input.cardToken,
              installments: input.installments ?? 1,
              // O endereço de cobrança não é tokenizado (ver BillingAddress em
              // ./provider.ts) — precisa vir junto, aninhado em `card`, mesmo
              // usando card_token em vez de dados de cartão cru.
              card: { billing_address: billingAddressPayload(input.billingAddress) },
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
        // ✅ Confirmado contra o sandbox real nesta sessão (antes só tinha
        // sido testado por analogia ao /orders, nunca chamado de verdade):
        // billing_address aninhado em `card` funciona igual ao createCardPayment.
        card: { billing_address: billingAddressPayload(input.billingAddress) },
        interval: "month",
        interval_count: 1,
        billing_type: "prepaid",
        // "quantity" é exigido aqui (diferente de /orders, onde é opcional) —
        // sem ele: "The quantity field is required.".
        items: [{ code: itemCode(input.metadata), quantity: 1, description: input.description, pricing_scheme: { price: input.amountCents } }],
        // Desconto só no 1º ciclo — discounts[].cycles limita a quantos
        // ciclos o desconto vale. discount_type precisa ser "flat" pra
        // "value" ser centavos; sem isso a Pagar.me assume "percentage" por
        // padrão e rejeita qualquer valor > 100 (descoberto contra o
        // sandbox — a doc não deixa esse default claro).
        ...(hasPromoCycle
          ? {
              discounts: [
                {
                  discount_type: "flat",
                  cycles: 1,
                  value: input.amountCents - (input.firstCycleAmountCents ?? input.amountCents),
                },
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
