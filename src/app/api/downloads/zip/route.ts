import type { ReactElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { createClient } from "@/lib/supabase/server";
import { PDF_GUIDES } from "@/lib/pdf-guides";
import { readStaticPdf } from "@/lib/pdf/static-pdfs";
import { AUDIOBOOKS } from "@/lib/audiobooks";
import { staticAudioPath } from "@/lib/audio/static-audio";
import { GuiaDefinitivoPdf } from "@/lib/pdf/GuiaDefinitivoPdf";
import { ReceitasPdf } from "@/lib/pdf/ReceitasPdf";
import { GuiaBlwPdf } from "@/lib/pdf/GuiaBlwPdf";
import { ChecklistAlergenicosPdf } from "@/lib/pdf/ChecklistAlergenicosPdf";
import { PratinhosPdf } from "@/lib/pdf/PratinhosPdf";
import { MordedoresPdf } from "@/lib/pdf/MordedoresPdf";
import { PreparoAlimentosPdf } from "@/lib/pdf/PreparoAlimentosPdf";
import { UtensiliosPdf } from "@/lib/pdf/UtensiliosPdf";

export const runtime = "nodejs";

const DOCUMENTS: Record<string, () => ReactElement> = {
  "guia-definitivo": () => GuiaDefinitivoPdf(),
  receitas: () => ReceitasPdf(),
  "guia-blw": () => GuiaBlwPdf(),
  "checklist-alergenicos": () => ChecklistAlergenicosPdf(),
  "pratinhos-divertidos": () => PratinhosPdf(),
  "mordedores-naturais": () => MordedoresPdf(),
  "preparo-alimentos": () => PreparoAlimentosPdf(),
  "utensilios-recomendados": () => UtensiliosPdf(),
};

function transcriptText(id: string): string {
  const book = AUDIOBOOKS.find((a) => a.id === id);
  if (!book) return "";
  return [
    book.title,
    book.subtitle,
    "",
    ...book.transcript.map((s) => s.text),
  ].join("\n\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const only = searchParams.get("only"); // "pdfs" | "audiobooks" | null (tudo)

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const zip = new JSZip();

  if (only !== "audiobooks") {
    for (const guide of PDF_GUIDES) {
      const staticBuffer = await readStaticPdf(guide.slug);
      const buildDocument = DOCUMENTS[guide.slug];
      const buffer = staticBuffer ?? (buildDocument
        ? await renderToBuffer(buildDocument() as Parameters<typeof renderToBuffer>[0])
        : null);
      if (!buffer) continue;
      zip.file(`pdfs/nutrimae-${guide.slug}.pdf`, buffer);
    }
  }

  if (only !== "pdfs") {
    for (const book of AUDIOBOOKS) {
      zip.file(`audiobooks/${book.id}-transcricao.txt`, transcriptText(book.id));
      if (book.hasAudio) {
        try {
          const audioBuffer = await readFile(staticAudioPath(book.id)!);
          zip.file(`audiobooks/nutrimae-${book.id}.mp3`, audioBuffer);
        } catch {
          // sem arquivo de áudio no disco — segue só com a transcrição
        }
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  const filenameSuffix = only === "pdfs" ? "-pdfs" : only === "audiobooks" ? "-audiobooks" : "";

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="nutrimae-recursos${filenameSuffix}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
