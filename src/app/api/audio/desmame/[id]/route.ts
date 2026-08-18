import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEntitlementStatus } from "@/lib/entitlements";
import { getWeaningTrack } from "@/lib/weaning";
import { staticWeaningAudioPath } from "@/lib/audio/static-audio";

export const runtime = "nodejs";

// Serve as narrações do SOS Desmame Noturno (MP3), com suporte a Range.
// Diferente do /api/audio/[id] dos audiobooks (liberado para qualquer
// assinante), este exige o entitlement específico do order bump — quem não
// comprou não consegue nem streamar o áudio direto pela URL.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    const status = await getEntitlementStatus(supabase, user.id, "sos_desmame_noturno");
    if (status !== "active") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const track = getWeaningTrack(id);
  const filePath = staticWeaningAudioPath(id);
  if (!track || !filePath) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

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
        "Content-Disposition": `inline; filename="nutrimae-desmame-${id}.mp3"`,
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
      "Content-Disposition": `inline; filename="nutrimae-desmame-${id}.mp3"`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(size),
    },
  });
}
