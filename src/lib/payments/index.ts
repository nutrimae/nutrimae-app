import type { PaymentProvider } from "./provider";
import { PagarMeProvider } from "./pagarme";

let cached: PaymentProvider | null = null;

/**
 * Ponto único de acesso ao provedor de pagamento ativo. Só existe um hoje
 * (Pagar.me) — esta função é o lugar certo pra trocar/escolher entre
 * provedores no futuro, sem precisar mudar quem a chama.
 */
export function getPaymentProvider(): PaymentProvider {
  if (!cached) cached = new PagarMeProvider();
  return cached;
}

export type * from "./provider";
