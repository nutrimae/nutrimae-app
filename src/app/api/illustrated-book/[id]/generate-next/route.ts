import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBookIllustration, reviewBookIllustration } from "@/lib/ai/illustrated-book-provider";
import type { BookPageScript } from "@/lib/illustrated-book";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_request: Request, context: RouteContext<"/api/illustrated-book/[id]/generate-next">) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [{ data: book }, { data: entitlement }] = await Promise.all([
    supabase.from("illustrated_books").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("user_products").select("status").eq("user_id", user.id).eq("product_id", "livro_ilustrado").eq("status", "active").maybeSingle(),
  ]);
  if (!book) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!entitlement) return NextResponse.json({ error: "purchase_required" }, { status: 403 });

  const { data: baby } = await supabase.from("babies").select("*").eq("id", book.baby_id).eq("user_id", user.id).maybeSingle();
  if (!baby) return NextResponse.json({ error: "baby_not_found" }, { status: 404 });

  const script = (book.script ?? []) as BookPageScript[];
  const nextIndex = script.findIndex((page) => !page.imagePath);
  if (nextIndex < 0) {
    await supabase.from("illustrated_books").update({ status: "ready", generated_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ done: true, progress: 100 });
  }

  let reference: { bytes: Uint8Array; type: string; kind: "real" | "generated" } | undefined;
  if (book.use_reference_photo && book.reference_photo_path) {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from("illustrated-books").download(book.reference_photo_path);
    if (error || !data) return NextResponse.json({ error: "reference_unavailable" }, { status: 409 });
    reference = { bytes: new Uint8Array(await data.arrayBuffer()), type: data.type || "image/jpeg", kind: "real" };
  } else if (nextIndex > 0 && script[0]?.imagePath) {
    // A primeira pagina vira referencia visual das seguintes, mantendo
    // personagem, roupa e paleta consistentes mesmo sem foto real.
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from("illustrated-books").download(script[0].imagePath);
    if (!error && data) {
      reference = { bytes: new Uint8Array(await data.arrayBuffer()), type: data.type || "image/webp", kind: "generated" };
    }
  }

  try {
    await supabase.from("illustrated_books").update({ status: "generating", failure_reason: null }).eq("id", id);
    const generated = await generateBookIllustration({ page: script[nextIndex], baby, reference });
    const review = await reviewBookIllustration(generated.bytes);
    if (!review.approved) {
      await supabase.from("illustrated_books").update({ status: "failed", failure_reason: review.reason, automated_review: review }).eq("id", id);
      return NextResponse.json({ error: "review_failed" }, { status: 422 });
    }

    const path = `${user.id}/${id}/page-${nextIndex + 1}.webp`;
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage.from("illustrated-books").upload(path, generated.bytes, { upsert: true, contentType: "image/webp" });
    if (uploadError) throw new Error("Nao foi possivel guardar a pagina");

    script[nextIndex] = { ...script[nextIndex], imagePath: path, review: { approved: true } };
    const done = script.every((page) => page.imagePath);
    await supabase.from("illustrated_books").update({
      script,
      pages: script.filter((page) => page.imagePath),
      status: done ? "ready" : "generating",
      provider: "openai",
      model: generated.model,
      automated_review: { approved: true, reviewedPages: script.filter((page) => page.review?.approved).length },
      generated_at: done ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    return NextResponse.json({ done, progress: Math.round(((nextIndex + 1) / script.length) * 100) });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Falha inesperada";
    await supabase.from("illustrated_books").update({ status: "failed", failure_reason: reason }).eq("id", id);
    return NextResponse.json({ error: "generation_failed", message: reason }, { status: 503 });
  }
}
