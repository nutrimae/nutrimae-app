import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";

const CreativeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  productKey: z.string().trim().max(100).optional(),
  platform: z.string().trim().min(2).max(50).default("meta"),
  concept: z.string().trim().max(200).optional(),
  angle: z.string().trim().max(200).optional(),
  hook: z.string().trim().max(300).optional(),
  format: z.string().trim().max(100).optional(),
  persona: z.string().trim().max(100).optional(),
});

async function adminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user && await isCurrentUserAdmin(supabase, user.id) ? user : null;
}

export async function GET() {
  if (!await adminUser()) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { data, error } = await createAdminClient().from("marketing_creatives").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "creatives_unavailable" }, { status: 503 });
  return NextResponse.json({ creatives: data ?? [] });
}

export async function POST(request: Request) {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = CreativeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_creative" }, { status: 400 });
  const value = parsed.data;
  const { data, error } = await createAdminClient().from("marketing_creatives").insert({
    name: value.name, product_key: value.productKey || null, platform: value.platform,
    concept: value.concept || null, angle: value.angle || null, hook: value.hook || null,
    format: value.format || null, persona: value.persona || null, created_by: user.id,
  }).select("*").single();
  if (error) return NextResponse.json({ error: "creative_create_failed" }, { status: 503 });
  return NextResponse.json({ creative: data }, { status: 201 });
}
