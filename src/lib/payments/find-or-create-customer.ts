import type { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentProvider } from "./provider";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Acha ou cria o customer local + no Pagar.me, a partir do e-mail. Usado por
 * toda rota de checkout que precisa de um customer (anual, downsell,
 * assinatura) — extraído pra não triplicar a mesma lógica.
 */
export async function findOrCreateLocalCustomer(
  admin: AdminClient,
  provider: PaymentProvider,
  input: { name: string; email: string; document: string; phone?: string },
): Promise<{ customerId: string; providerCustomerId: string }> {
  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id, pagarme_customer_id")
    .eq("email", input.email)
    .maybeSingle();

  if (existingCustomer?.pagarme_customer_id) {
    return { customerId: existingCustomer.id, providerCustomerId: existingCustomer.pagarme_customer_id };
  }

  const providerCustomer = await provider.createCustomer({
    name: input.name,
    email: input.email,
    document: input.document,
    phone: input.phone,
  });

  if (existingCustomer) {
    await admin
      .from("customers")
      .update({ pagarme_customer_id: providerCustomer.providerCustomerId })
      .eq("id", existingCustomer.id);
    return { customerId: existingCustomer.id, providerCustomerId: providerCustomer.providerCustomerId };
  }

  const { data: created, error } = await admin
    .from("customers")
    .insert({
      email: input.email,
      name: input.name,
      document: input.document,
      phone_number: input.phone,
      pagarme_customer_id: providerCustomer.providerCustomerId,
    })
    .select("id")
    .single();

  if (error || !created) throw error ?? new Error("Falha ao criar customer local.");

  return { customerId: created.id, providerCustomerId: providerCustomer.providerCustomerId };
}
