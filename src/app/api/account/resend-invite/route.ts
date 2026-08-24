import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Reenvia o link de "definir senha" pra quem já tem conta (criada só na
 * compra, nunca aqui) mas o primeiro link expirou — comum com Gmail/Outlook
 * escaneando o link de convite antes da pessoa clicar de verdade, o que
 * consome o token de uso único (ver find-or-create-user.ts).
 *
 * Usa resetPasswordForEmail (tipo "recovery") em vez de reenviar o convite
 * original — funciona de forma confiável pra conta já existente,
 * independente do estado de confirmação. Sempre responde a mesma mensagem
 * genérica, exista ou não conta com esse e-mail, pra não virar oráculo de
 * "quem já comprou".
 */

interface ResendBody {
  email?: unknown;
}

const GENERIC_RESPONSE = {
  ok: true,
  message: "Se esse e-mail tiver uma conta, um novo link chega em instantes.",
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ResendBody | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/set-password`,
    });
  } catch (err) {
    // Nunca expõe se o e-mail existe ou não — só loga pra investigação interna.
    console.error("[account/resend-invite] falha ao reenviar", err);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
