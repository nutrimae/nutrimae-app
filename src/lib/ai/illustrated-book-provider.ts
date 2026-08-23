import { buildIllustrationPrompt, type BookPageScript } from "@/lib/illustrated-book";
import type { Baby } from "@/lib/types";

const ALLOWED_IMAGE_MODELS = new Set(["gpt-image-1", "gpt-image-1-mini", "gpt-image-1.5"]);

function configuration() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1-mini";
  if (!apiKey) throw new Error("OPENAI_API_KEY ausente");
  if (process.env.ILLUSTRATED_BOOK_PRIVACY_APPROVED !== "true") {
    throw new Error("Geracao bloqueada: politica de privacidade do provedor ainda nao foi aprovada");
  }
  if (!ALLOWED_IMAGE_MODELS.has(model)) throw new Error("Modelo de imagem nao autorizado");
  return { apiKey, model };
}

function headers(apiKey: string) {
  return { Authorization: `Bearer ${apiKey}` };
}

export function assertReferencePhotoAllowed() {
  if (process.env.OPENAI_REFERENCE_PHOTO_APPROVED !== "true") {
    throw new Error("Foto real bloqueada ate confirmacao contratual especifica do provedor");
  }
}

export async function generateBookIllustration({
  page,
  baby,
  reference,
}: {
  page: BookPageScript;
  baby: Baby;
  reference?: { bytes: Uint8Array; type: string; kind: "real" | "generated" };
}) {
  const { apiKey, model } = configuration();
  const prompt = buildIllustrationPrompt(page, baby, Boolean(reference));

  let response: Response;
  if (reference) {
    if (reference.kind === "real") assertReferencePhotoAllowed();
    const form = new FormData();
    form.set("model", model);
    form.set("prompt", prompt);
    form.set("size", "1024x1536");
    form.set("quality", "medium");
    form.set("output_format", "webp");
    form.set("input_fidelity", "high");
    const referenceBuffer = reference.bytes.slice().buffer as ArrayBuffer;
    form.append("image[]", new Blob([referenceBuffer], { type: reference.type }), "reference.jpg");
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: headers(apiKey),
      body: form,
      signal: AbortSignal.timeout(110_000),
    });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { ...headers(apiKey), "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, size: "1024x1536", quality: "medium", output_format: "webp" }),
      signal: AbortSignal.timeout(110_000),
    });
  }

  if (!response.ok) throw new Error(`Falha do provedor de imagem (${response.status})`);
  const result = await response.json() as { data?: Array<{ b64_json?: string }> };
  const base64 = result.data?.[0]?.b64_json;
  if (!base64) throw new Error("Provedor nao retornou uma imagem");
  return { bytes: Uint8Array.from(Buffer.from(base64, "base64")), model };
}

/** Revisao automatica conservadora antes de liberar qualquer pagina. */
export async function reviewBookIllustration(bytes: Uint8Array) {
  const { apiKey } = configuration();
  const image = `data:image/webp;base64,${Buffer.from(bytes).toString("base64")}`;
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: { ...headers(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: [{ type: "image_url", image_url: { url: image } }],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error("Nao foi possivel revisar a ilustracao");
  const result = await response.json() as { results?: Array<{ flagged?: boolean; category_scores?: Record<string, number> }> };
  const moderation = result.results?.[0];
  if (!moderation || moderation.flagged) {
    return { approved: false, reason: "A revisao automatica bloqueou esta imagem", moderation };
  }
  return { approved: true, moderation };
}
