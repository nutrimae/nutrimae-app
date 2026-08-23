import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildBookScript, MIN_BOOK_DIARY_ENTRIES } from "@/lib/illustrated-book";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const babyId = new URL(request.url).searchParams.get("babyId");
  if (!babyId) return NextResponse.json({ error: "baby_id_required" }, { status: 400 });

  const [{ data: baby }, { count }, { data: book }, { data: entitlement }] = await Promise.all([
    supabase.from("babies").select("*").eq("id", babyId).eq("user_id", user.id).maybeSingle(),
    supabase.from("food_log").select("id", { count: "exact", head: true }).eq("baby_id", babyId),
    supabase.from("illustrated_books").select("*").eq("baby_id", babyId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("user_products").select("status").eq("user_id", user.id).eq("product_id", "livro_ilustrado").eq("status", "active").maybeSingle(),
  ]);

  if (!baby) return NextResponse.json({ error: "baby_not_found" }, { status: 404 });

  const accountAgeDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000);
  return NextResponse.json({
    book,
    diaryCount: count ?? 0,
    eligible: (count ?? 0) >= MIN_BOOK_DIARY_ENTRIES && accountAgeDays >= 7,
    accountAgeDays,
    hasAccess: Boolean(entitlement),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { babyId?: string } | null;
  if (!body?.babyId) return NextResponse.json({ error: "baby_id_required" }, { status: 400 });

  const [{ data: baby }, { data: log }, { data: milestones }] = await Promise.all([
    supabase.from("babies").select("*").eq("id", body.babyId).eq("user_id", user.id).maybeSingle(),
    supabase.from("food_log").select("food_key,reaction,tried_at").eq("baby_id", body.babyId).order("tried_at"),
    supabase.from("food_milestones").select("milestone_key,achieved_at").eq("baby_id", body.babyId).order("achieved_at"),
  ]);

  if (!baby) return NextResponse.json({ error: "baby_not_found" }, { status: 404 });
  if ((log?.length ?? 0) < MIN_BOOK_DIARY_ENTRIES) {
    return NextResponse.json({ error: "not_enough_diary_entries", required: MIN_BOOK_DIARY_ENTRIES }, { status: 409 });
  }
  const accountAgeDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000);
  if (accountAgeDays < 7) return NextResponse.json({ error: "available_after_seven_days" }, { status: 409 });

  const script = buildBookScript(baby, log ?? [], milestones ?? []);
  const { data: book, error } = await supabase.from("illustrated_books").insert({
    user_id: user.id,
    baby_id: baby.id,
    script,
    status: "draft",
  }).select("*").single();

  if (error) return NextResponse.json({ error: "create_failed" }, { status: 500 });
  return NextResponse.json({ book }, { status: 201 });
}
