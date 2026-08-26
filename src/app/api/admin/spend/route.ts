import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";

const RowSchema = z.object({
  spend_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), platform: z.string().min(2).max(50),
  account_id: z.string().max(200).default(""), campaign_id: z.string().max(200).default(""),
  adset_id: z.string().max(200).default(""), ad_id: z.string().max(200).default(""),
  creative_id: z.string().uuid().nullable().default(null), currency: z.string().length(3).default("BRL"),
  spend_cents: z.number().int().nonnegative(), impressions: z.number().int().nonnegative().nullable().default(null),
  clicks: z.number().int().nonnegative().nullable().default(null),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin(supabase, user.id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null) as { rows?: unknown } | null;
  const parsed = z.array(RowSchema).min(1).max(5000).safeParse(body?.rows);
  if (!parsed.success) return NextResponse.json({ error: "invalid_spend_rows", details: parsed.error.issues.slice(0, 5) }, { status: 400 });
  const importHash = createHash("sha256").update(JSON.stringify(parsed.data)).digest("hex");
  const rows = parsed.data.map((row) => ({ ...row, import_hash: importHash, source: "manual_csv", created_by: user.id }));
  const { error } = await createAdminClient().from("ad_spend_daily").upsert(rows, { onConflict: "spend_date,platform,account_id,campaign_id,adset_id,ad_id,creative_id,import_hash", ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: "spend_import_failed" }, { status: 503 });
  return NextResponse.json({ imported: rows.length, importHash });
}
