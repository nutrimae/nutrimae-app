import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isLocale } from "@/lib/i18n/locale";

/**
 * "profiles" não tem policy de update pro client (só leitura própria — ver
 * supabase/schema.sql e src/app/api/profile/phone/route.ts para o mesmo
 * padrão). Por isso a troca de idioma passa pelo client admin depois de
 * confirmar a identidade via sessão, em vez de um UPDATE direto do
 * useLocale() no client (que sempre falhava silenciosamente, 0 linhas).
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { locale?: string } | null;
  if (!isLocale(body?.locale)) {
    return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ locale: body.locale }).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  return NextResponse.json({ ok: true, locale: body.locale });
}
