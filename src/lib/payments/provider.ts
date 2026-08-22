/**
 * Contrato provedor-agnóstico de pagamento. `PagarMeProvider`
 * (./pagarme.ts) é a única implementação hoje; qualquer segundo provedor
 * no futuro implementa esta mesma interface — nada além dela deve vazar
 * pro resto do app (rotas de checkout/webhook só falam com este tipo).
 *
 * Dinheiro sempre em centavos (inteiro).
 */

export interface PaymentCustomerInput {
  name: string;
  email: string;
  /** CPF, só dígitos. */
  document: string;
  /** Telefone, formato internacional sem "+" (mesmo padrão de profiles.phone_number). */
  phone?: string;
}

export interface PaymentCustomerResult {
  providerCustomerId: string;
}

export interface CreateOneTimeOrderInput {
  providerCustomerId: string;
  amountCents: number;
  description: string;
  metadata?: Record<string, string>;
}

export interface CreatePixPaymentInput extends CreateOneTimeOrderInput {
  expiresInSeconds?: number;
}

export interface PixPaymentResult {
  providerOrderId: string;
  providerChargeId: string;
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  status: "pending";
}

export interface CreateCardPaymentInput extends CreateOneTimeOrderInput {
  /** Token gerado no navegador via tokenizeCard() — o backend nunca vê o cartão. */
  cardToken: string;
  installments?: number;
}

export interface CardPaymentResult {
  providerOrderId: string;
  providerChargeId: string;
  status: "paid" | "refused" | "processing";
  cardBrand?: string;
  cardLast4?: string;
}

export interface CreateSubscriptionInput {
  providerCustomerId: string;
  /** Preço normal (cobrado a partir do 2º ciclo). */
  amountCents: number;
  /** Preço promocional do 1º ciclo, se diferente do normal. */
  firstCycleAmountCents?: number;
  description: string;
  cardToken: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionResult {
  providerSubscriptionId: string;
  status: string;
  nextBillingAt?: string;
}

export interface PaymentStatusResult {
  status: string;
}

export interface PaymentProvider {
  createCustomer(input: PaymentCustomerInput): Promise<PaymentCustomerResult>;
  createPixPayment(input: CreatePixPaymentInput): Promise<PixPaymentResult>;
  createCardPayment(input: CreateCardPaymentInput): Promise<CardPaymentResult>;
  /**
   * Fase de assinatura (Mensal, NutriBot VIP) — implementado de verdade,
   * não é stub, mas só fica acessível pelo checkout quando a offer
   * correspondente tiver active=true (ver supabase/schema.sql seção 12).
   */
  createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  /** Reembolso — fora do escopo desta entrega, mas com assinatura pronta. */
  refundPayment(providerChargeId: string, amountCents?: number): Promise<void>;
  getPaymentStatus(providerOrderId: string): Promise<PaymentStatusResult>;
}
