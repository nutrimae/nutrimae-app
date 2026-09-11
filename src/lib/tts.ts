import crypto from "node:crypto";

// Google Cloud Text-to-Speech configuration
// es-US é a variante latino-americana da Google (não es-ES, que soa
// espanhol da Espanha) — a mais próxima disponível pro sotaque chileno/LATAM.
const TTS_VOICES = {
  "pt-BR": { voice: "pt-BR-Wavenet-A", language: "pt-BR" },
  es: { voice: "es-US-Wavenet-A", language: "es-US" },
} as const;
const TTS_SPEAKING_RATE = 0.95;
const TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

/**
 * Gera hash do conteúdo para detectar alterações.
 * Quando o texto muda, o hash muda → áudio é regenerado.
 */
export function contentHash(text: string): string {
  return crypto.createHash("sha256").update(text, "utf-8").digest("hex").slice(0, 16);
}

/**
 * Chama a API do Google Cloud TTS e retorna o áudio em MP3.
 *
 * REGRA DE SEGURANÇA: o texto passado aqui DEVE ser exatamente
 * o texto aprovado/revisado exibido na tela. Nunca uma paráfrase.
 */
export async function synthesizeSpeech(text: string, locale: "pt-BR" | "es" = "pt-BR"): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_TTS_API_KEY não configurada.");
  }

  const { voice, language } = TTS_VOICES[locale];

  const response = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: TTS_SPEAKING_RATE,
        pitch: 0,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google TTS error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return Buffer.from(data.audioContent, "base64");
}

/**
 * Tipos de conteúdo que podem ter áudio TTS.
 */
export type TtsContentType = "food" | "recipe" | "sos" | "allergy";

/**
 * Extrai o texto narravel de um tipo de conteúdo.
 * Centralizado aqui para garantir que todo o pipeline
 * use exatamente o mesmo texto revisado.
 */
export { contentHash as hashText };
