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

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/auth/set-password`,
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
