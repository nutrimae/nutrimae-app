import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LATAM_REGIONS, type LatamRegion } from "@/lib/latam-regions";

const VALID_REGIONS = new Set<string>(LATAM_REGIONS.map((r) => r.key));

function isLatamRegion(value: unknown): value is LatamRegion {
  return typeof value === "string" && VALID_REGIONS.has(value);
}

/**
 * "profiles" não tem policy de update pro client (só leitura própria — ver
 * supabase/schema.sql e src/app/api/profile/phone/route.ts para o mesmo
 * padrão). Por isso a troca de região passa pelo client admin depois de
 * confirmar a identidade via sessão.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { region?: string | null } | null;
  if (body?.region !== null && !isLatamRegion(body?.region)) {
    return NextResponse.json({ error: "invalid_region" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ latam_region: body.region }).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  return NextResponse.json({ ok: true, region: body.region });
}
