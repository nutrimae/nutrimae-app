import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAudiobook } from "@/lib/audiobooks";
import { staticAudioPath } from "@/lib/audio/static-audio";

export const runtime = "nodejs";

// Serve a narração real do audiobook (MP3), com suporte a Range para o
// player poder buscar/adiantar sem baixar o arquivo inteiro de novo.
// ?download=1 força o download (Content-Disposition attachment) em vez de
// tocar inline — usado pela tela de Downloads.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const book = getAudiobook(id);
  const filePath = staticAudioPath(id);
  if (!book || !filePath) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download") === "1";
  const disposition = download
    ? `attachment; filename="nutrimae-${id}.mp3"`
    : `inline; filename="nutrimae-${id}.mp3"`;

  const range = request.headers.get("range");
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : size - 1;
    const chunkSize = end - start + 1;

    const stream = createReadStream(filePath, { start, end });
    return new NextResponse(Readable.toWeb(stream) as unknown as BodyInit, {
      status: 206,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": disposition,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
      },
    });
  }

  const stream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as unknown as BodyInit, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": disposition,
      "Accept-Ranges": "bytes",
      "Content-Length": String(size),
    },
  });
}
