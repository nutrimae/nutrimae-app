import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { formatAge } from "@/lib/age";
import { DIARY_FOODS, type Reaction } from "@/lib/food-diary";
import { ALLERGEN_CHECKLIST, ALLERGEN_LABEL } from "@/lib/allergen-checklist";
import type { Allergen } from "@/lib/recipes";
import { RelatorioPediatraPdf, type RelatorioPediatraFoodRow } from "@/lib/pdf/RelatorioPediatraPdf";

export const runtime = "nodejs";

const KNOWN_ALLERGEN_IDS = new Set(ALLERGEN_CHECKLIST.map((a) => a.id));
const FOOD_NAME_BY_KEY = new Map(DIARY_FOODS.map((f) => [f.key, f.name]));

interface RequestBody {
  babyId?: unknown;
  periodDays?: unknown;
  allergenIds?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const babyId = typeof body?.babyId === "string" ? body.babyId : "";
  const periodDays = typeof body?.periodDays === "number" && body.periodDays > 0 ? Math.min(body.periodDays, 365) : 30;
  const allergenIds: Allergen[] = Array.isArray(body?.allergenIds)
    ? (body.allergenIds as unknown[]).filter((id): id is Allergen => typeof id === "string" && KNOWN_ALLERGEN_IDS.has(id as Allergen))
    : [];

  if (!babyId) return NextResponse.json({ error: "missing_baby_id" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: baby } = await supabase
    .from("babies")
    .select("name, birth_date")
    .eq("id", babyId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!baby) return NextResponse.json({ error: "baby_not_found" }, { status: 404 });

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - periodDays * 86_400_000);
  const periodStartIso = periodStart.toISOString().slice(0, 10);

  const { data: logRows } = await supabase
    .from("food_log")
    .select("food_key, reaction, tried_at")
    .eq("baby_id", babyId)
    .gte("tried_at", periodStartIso)
    .order("tried_at", { ascending: true });

  const foods: RelatorioPediatraFoodRow[] = (logRows ?? []).map((row) => ({
    name: FOOD_NAME_BY_KEY.get(row.food_key) ?? row.food_key,
    triedAt: row.tried_at as string,
    reaction: row.reaction as Reaction,
  }));

  const knownAllergens = allergenIds.map((id) => ALLERGEN_LABEL[id]).filter(Boolean);

  const brFormat = (d: Date) => d.toLocaleDateString("pt-BR");
  const document = RelatorioPediatraPdf({
    babyName: baby.name,
    ageLabel: formatAge(baby.birth_date),
    periodLabel: `${brFormat(periodStart)} a ${brFormat(periodEnd)}`,
    foods,
    knownAllergens,
    generatedAtLabel: brFormat(periodEnd),
  });
  const buffer = await renderToBuffer(document as Parameters<typeof renderToBuffer>[0]);

  const safeName = baby.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-pediatra-${safeName}.pdf"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
