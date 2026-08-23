import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOK_PRIVACY_POLICY_VERSION } from "@/lib/illustrated-book";

export const runtime = "nodejs";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request, context: RouteContext<"/api/illustrated-book/[id]/reference">) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: book } = await supabase.from("illustrated_books").select("id,user_id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!book) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const form = await request.formData();
  const file = form.get("photo");
  const consent = form.get("consent") === "true";
  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_SIZE) {
    return NextResponse.json({ error: "invalid_photo", maxMb: 5 }, { status: 400 });
  }
  if (!consent) return NextResponse.json({ error: "consent_required" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${id}/reference.${ext}`;
  const { error: uploadError } = await supabase.storage.from("illustrated-books").upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return NextResponse.json({ error: "upload_failed" }, { status: 500 });

  const { error } = await supabase.from("illustrated_books").update({
    use_reference_photo: true,
    reference_photo_path: path,
    privacy_policy_version: BOOK_PRIVACY_POLICY_VERSION,
    privacy_consent_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
