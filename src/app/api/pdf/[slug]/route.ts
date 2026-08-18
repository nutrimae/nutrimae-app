import type { ReactElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getPdfGuide } from "@/lib/pdf-guides";
import { readStaticPdf } from "@/lib/pdf/static-pdfs";
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

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const guide = getPdfGuide(slug);
  if (!guide) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const staticBuffer = await readStaticPdf(slug);
  const buffer = staticBuffer ?? (DOCUMENTS[slug]
    ? await renderToBuffer(DOCUMENTS[slug]() as Parameters<typeof renderToBuffer>[0])
    : null);

  if (!buffer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="nutrimae-${slug}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
