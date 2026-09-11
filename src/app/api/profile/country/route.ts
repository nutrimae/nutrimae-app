import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COUNTRY_TO_LATAM_REGION, isCountry } from "@/lib/i18n/country";

/**
 * "profiles" não tem policy de update pro client (só leitura própria — ver
 * supabase/schema.sql e src/app/api/profile/phone/route.ts para o mesmo
 * padrão). Por isso a troca de país passa pelo client admin depois de
 * confirmar a identidade via sessão.
 *
 * Também grava latam_region (inferida do país, ver COUNTRY_TO_LATAM_REGION)
 * no mesmo update — mantém a priorização de alimentos/receitas por região
 * (foods.ts/recipes.ts/menu.ts) sincronizada sem precisar de uma segunda
 * chamada de quem usa este endpoint (ex.: onboarding).
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { country?: string } | null;
  if (!isCountry(body?.country)) {
    return NextResponse.json({ error: "invalid_country" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ country: body.country, latam_region: COUNTRY_TO_LATAM_REGION[body.country] })
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  return NextResponse.json({ ok: true, country: body.country });
}
