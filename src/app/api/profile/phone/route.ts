import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePhoneNumber } from "@/lib/utils";

/**
 * A própria usuária edita o telefone de WhatsApp do perfil — antes disso
 * "profiles.phone_number" só era preenchido pelo webhook de compra
 * (savePhoneNumber), então quem nunca passou pelo checkout com esse dado
 * (ex.: uma admin) não tinha como receber alerta nenhum.
 *
 * "profiles" não tem policy de update pro client (só leitura própria —
 * ver supabase/schema.sql) de propósito, porque a mesma linha guarda
 * "is_admin" e "credito_expansao_centavos", que a usuária nunca pode
 * escrever sozinha. Por isso isto passa pelo client admin depois de
 * confirmar a identidade via sessão — nunca abrindo um UPDATE geral na
 * tabela só pra liberar esta uma coluna.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { phone_number?: string } | null;
  const raw = body?.phone_number?.trim();

  // Campo vazio é válido: usuária pode limpar o número.
  if (raw === "") {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ phone_number: null }).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });
    return NextResponse.json({ ok: true, phone_number: null });
  }

  const sanitized = sanitizePhoneNumber(raw);
  if (!sanitized) {
    return NextResponse.json({ error: "invalid_phone", message: "Telefone inválido. Use DDD + número (com ou sem +55)." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ phone_number: sanitized }).eq("user_id", user.id);
  if (error) {
    // profiles.phone_number tem índice único — outra conta já usa esse número.
    if (error.code === "23505") {
      return NextResponse.json({ error: "phone_in_use", message: "Esse número já está vinculado a outra conta." }, { status: 409 });
    }
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, phone_number: sanitized });
}
