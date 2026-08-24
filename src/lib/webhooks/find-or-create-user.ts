import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Modelo de segurança do projeto: contas só são criadas por um webhook de
 * compra autenticado (ver SECURITY_PURCHASE_ONLY.md) — nunca por
 * auto-cadastro. Compartilhado entre todo webhook de pagamento (Cartpanda,
 * Pagar.me, e qualquer futuro) para que essa regra nunca divirja entre eles.
 */

export async function findUserIdByEmail(
  admin: AdminClient,
  email: string,
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}&per_page=1000`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const body = await res.json();
  const users: Array<{ id: string; email?: string }> = body.users ?? [];
  const match = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

export async function findOrCreateUser(
  admin: AdminClient,
  email: string,
): Promise<{ userId: string; created: boolean }> {
  const existingId = await findUserIdByEmail(admin, email);
  if (existingId) return { userId: existingId, created: false };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Este convite é gerado pelo client admin (@supabase/supabase-js puro),
  // que usa fluxo implicit por padrão (token no #hash da URL) — diferente
  // do client do navegador (@supabase/ssr, PKCE por padrão, token em
  // ?code=). Por isso vai direto pro /auth/set-password (página client);
  // o SDK do navegador lê o #access_token automaticamente ao carregar
  // (detectSessionInUrl). Mandar pro /auth/callback (rota server, só
  // entende ?code=) faz o convite falhar sempre — o hash nunca chega no
  // servidor. Confirmado contra o sandbox: link de convite caía em
  // /auth/auth-code-error com o access_token intacto no hash.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/set-password`,
  });

  if (error) {
    // Corrida: outro evento pode ter criado a conta entre o lookup e o invite.
    const raceId = await findUserIdByEmail(admin, email);
    if (raceId) return { userId: raceId, created: false };
    throw error;
  }

  if (!data.user) throw new Error("Convite não retornou usuária criada.");
  return { userId: data.user.id, created: true };
}

export async function savePhoneNumber(admin: AdminClient, userId: string, phoneNumber: string) {
  const { error } = await admin.from("profiles").update({ phone_number: phoneNumber }).eq("user_id", userId);

  if (error) {
    // Best-effort: telefone é usado pela NutriBot, mas não deve travar a
    // liberação do produto principal se a gravação falhar.
    console.error("[webhook] falha ao salvar phone_number em profiles", error);
  }
}
