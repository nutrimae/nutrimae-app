import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n/get-server-locale";
import { getAudiobook } from "@/lib/audiobooks";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const locale = await getServerLocale();
  const book = getAudiobook(id, locale);
  if (!book) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const text = [book.title, book.subtitle, "", ...book.transcript.map((s) => s.text)].join("\n\n");

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="nutrimae-${id}-transcricao.txt"`,
    },
  });
}
