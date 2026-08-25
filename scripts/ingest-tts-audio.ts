/**
 * Ingestão manual de áudio TTS gerado fora do pipeline (ex.: ElevenLabs),
 * usado enquanto GOOGLE_TTS_API_KEY não está configurada.
 *
 * Sobe cada arquivo local pro Storage e grava o cache com o hash do texto
 * EXATO que ele narra — o mesmo texto que o componente ListenButton envia
 * como query param, senão o app não vai considerar cache hit.
 *
 * Execução: npx tsx scripts/ingest-tts-audio.ts
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { contentHash } from "../src/lib/tts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DOWNLOADS = "C:/Users/vitor/Downloads";

interface Item {
  file: string;
  contentType: string;
  contentId: string;
  text: string;
}

async function buildItems(): Promise<Item[]> {
  const sosPage = await import("../src/app/sos/page");
  const alergiaPage = await import("../src/app/app/(paid)/alergia/page");

  const engasgoText = (steps: typeof sosPage.INFANT_STEPS) =>
    steps.map((s, i) => `Passo ${i + 1}: ${s.title}. ${s.text}`).join(" ");

  return [
    { file: "sos_engasgo-infant.mp3", contentType: "sos", contentId: "engasgo-infant", text: engasgoText(sosPage.INFANT_STEPS) },
    { file: "sos_engasgo-child.mp3", contentType: "sos", contentId: "engasgo-child", text: engasgoText(sosPage.CHILD_STEPS) },
    { file: "sos_reflex.mp3", contentType: "sos", contentId: "reflex", text: sosPage.REFLEX_TEXT },
    { file: "sos_gag-info.mp3", contentType: "sos", contentId: "gag-info", text: sosPage.GAG_INFO_TEXT },
    { file: "sos_allergy.mp3", contentType: "sos", contentId: "allergy", text: sosPage.ALLERGY_SOS_TEXT },
    { file: "sos_gut.mp3", contentType: "sos", contentId: "gut", text: sosPage.GUT_TEXT },
    { file: "sos_fever.mp3", contentType: "sos", contentId: "fever", text: sosPage.FEVER_TEXT },
    {
      file: "allergy_guia-alergia.mp3",
      contentType: "allergy",
      contentId: "guia-alergia",
      text: `Sinais de alergia alimentar. Depois de introduzir um alimento novo, observe o bebê por 3 a 5 dias antes de oferecer outro alimento novo. Sinais leves, observar: ${alergiaPage.MILD_SIGNS.join(". ")}. Sinais de alerta grave, atendimento imediato: ${alergiaPage.SEVERE_SIGNS.join(". ")}.`,
    },
  ];
}

async function main() {
  console.log("🎙️  Ingestão manual de áudio TTS (ElevenLabs)\n");
  const items = await buildItems();

  let uploaded = 0;
  let errors = 0;

  for (const item of items) {
    const filePath = path.join(DOWNLOADS, item.file);
    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ Arquivo não encontrado: ${filePath}`);
      errors++;
      continue;
    }

    const hash = contentHash(item.text);
    const storagePath = `${item.contentType}/${item.contentId}-${hash}.mp3`;
    const audio = fs.readFileSync(filePath);

    console.log(`  Subindo: [${item.contentType}] ${item.contentId} (${(audio.length / 1024).toFixed(0)}KB)...`);

    const { error: uploadError } = await supabase.storage
      .from("tts-audio")
      .upload(storagePath, audio, { contentType: "audio/mpeg", upsert: true });

    if (uploadError) {
      console.error(`  ❌ Erro no upload de ${item.file}:`, uploadError.message);
      errors++;
      continue;
    }

    const { error: cacheError } = await supabase.from("tts_audio_cache").upsert(
      {
        content_type: item.contentType,
        content_id: item.contentId,
        content_hash: hash,
        storage_path: storagePath,
      },
      { onConflict: "content_type,content_id" },
    );

    if (cacheError) {
      console.error(`  ❌ Erro ao gravar cache de ${item.file}:`, cacheError.message);
      errors++;
      continue;
    }

    uploaded++;
  }

  console.log(`\n✅ Concluído! Subidos: ${uploaded} | Erros: ${errors}`);
}

main().catch(console.error);
