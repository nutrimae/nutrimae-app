import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IllustratedBookPdf } from "@/lib/pdf/IllustratedBookPdf";
import type { BookPageScript } from "@/lib/illustrated-book";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_request: Request, context: RouteContext<"/api/illustrated-book/[id]/pdf">) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: book } = await supabase.from("illustrated_books").select("*").eq("id", id).eq("user_id", user.id).eq("status", "ready").maybeSingle();
  if (!book) return NextResponse.json({ error: "book_not_ready" }, { status: 409 });
  const { data: baby } = await supabase.from("babies").select("name").eq("id", book.baby_id).eq("user_id", user.id).maybeSingle();
  if (!baby) return NextResponse.json({ error: "baby_not_found" }, { status: 404 });

  const admin = createAdminClient();
  const pages: Array<BookPageScript & { imageData: string }> = [];
  for (const page of (book.script ?? []) as BookPageScript[]) {
    if (!page.imagePath) return NextResponse.json({ error: "page_missing" }, { status: 409 });
    const { data, error } = await admin.storage.from("illustrated-books").download(page.imagePath);
    if (error || !data) return NextResponse.json({ error: "page_unavailable" }, { status: 500 });
    pages.push({ ...page, imageData: `data:${data.type || "image/webp"};base64,${Buffer.from(await data.arrayBuffer()).toString("base64")}` });
  }

  const document = IllustratedBookPdf({ babyName: baby.name, pages });
  const buffer = await renderToBuffer(document as Parameters<typeof renderToBuffer>[0]);
  const pdfPath = `${user.id}/${id}/livro-${id}.pdf`;
  await admin.storage.from("illustrated-books").upload(pdfPath, buffer, { upsert: true, contentType: "application/pdf" });
  await supabase.from("illustrated_books").update({ pdf_path: pdfPath }).eq("id", id).eq("user_id", user.id);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="livro-introducao-alimentar-${baby.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
