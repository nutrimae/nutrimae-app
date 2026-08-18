import { readFile } from "node:fs/promises";
import path from "node:path";

// PDFs reais entregues pela usuária ficam em assets/pdfs/<slug>.pdf e têm
// prioridade sobre os geradores em @react-pdf/renderer (usados como fallback
// para qualquer slug sem arquivo estático). Compartilhado entre a rota de
// download individual (/api/pdf/[slug]) e a de ZIP (/api/downloads/zip).
const STATIC_PDF_DIR = path.join(process.cwd(), "assets", "pdfs");

export async function readStaticPdf(slug: string): Promise<Buffer | null> {
  // slug de rota dinâmica já é um único componente de path, mas validamos
  // mesmo assim antes de tocar o filesystem.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return await readFile(path.join(STATIC_PDF_DIR, `${slug}.pdf`));
  } catch {
    return null;
  }
}
