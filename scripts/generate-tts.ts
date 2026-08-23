/**
 * Script de geração em batch de áudio TTS.
 * Execução: npx tsx scripts/generate-tts.ts
 *
 * Percorre todo o conteúdo estático aprovado (alimentos, receitas, SOS)
 * e gera áudio TTS para cada item, cacheando no Supabase Storage.
 * Pula itens cujo hash já está no cache (texto não mudou).
 */

import { createClient } from "@supabase/supabase-js";
import { synthesizeSpeech, contentHash } from "../src/lib/tts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ContentItem {
  contentType: string;
  contentId: string;
  text: string;
}

async function collectContent(): Promise<ContentItem[]> {
  const items: ContentItem[] = [];

  // Import food data dynamically
  const { FOODS } = await import("../src/lib/foods");
  const { getFoodPrepGuide } = await import("../src/lib/food-prep");
  const { AGE_BAND_LABEL } = await import("../src/lib/menu");

  for (const food of FOODS) {
    // Skip pending foods
    if (food.revisao === "pendente") continue;

    // Build narration text for each food
    const parts: string[] = [`${food.name}.`];
    for (const [band, cut] of Object.entries(food.cuts)) {
      parts.push(`${AGE_BAND_LABEL[band as keyof typeof AGE_BAND_LABEL]}: ${cut}`);
    }
    if (food.warning) parts.push(`Atenção: ${food.warning}`);

    const guide = getFoodPrepGuide(food.id);
    if (guide) {
      parts.push("Modo de preparo:");
      guide.steps.forEach((s, i) => parts.push(`Passo ${i + 1}: ${s.action}`));
      parts.push(`Congelamento: ${guide.freezing}`);
      parts.push(`Descongelamento: ${guide.thawing}`);
    }

    items.push({
      contentType: "food",
      contentId: food.id,
      text: parts.join(" "),
    });
  }

  // Import recipes
  const { RECIPES } = await import("../src/lib/recipes");
  for (const recipe of RECIPES) {
    if (recipe.revisao === "pendente") continue;

    const parts = [
      `${recipe.title}.`,
      `Ingredientes: ${recipe.ingredients.join(", ")}.`,
      "Modo de preparo:",
      ...recipe.steps.map((s, i) => `Passo ${i + 1}: ${s}`),
    ];

    items.push({
      contentType: "recipe",
      contentId: recipe.id,
      text: parts.join(" "),
    });
  }

  return items;
}

async function main() {
  console.log("🎙️  NutriMãe TTS Batch Generator\n");

  const items = await collectContent();
  console.log(`Encontrados ${items.length} itens de conteúdo.\n`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of items) {
    const hash = contentHash(item.text);

    // Check cache
    const { data: cached } = await supabase
      .from("tts_audio_cache")
      .select("content_hash")
      .eq("content_type", item.contentType)
      .eq("content_id", item.contentId)
      .maybeSingle();

    if (cached?.content_hash === hash) {
      skipped++;
      continue;
    }

    try {
      console.log(`  Gerando: [${item.contentType}] ${item.contentId}...`);
      const audio = await synthesizeSpeech(item.text);
      const path = `${item.contentType}/${item.contentId}-${hash}.mp3`;

      await supabase.storage.from("tts-audio").upload(path, audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });

      await supabase.from("tts_audio_cache").upsert(
        {
          content_type: item.contentType,
          content_id: item.contentId,
          content_hash: hash,
          storage_path: path,
        },
        { onConflict: "content_type,content_id" },
      );

      generated++;

      // Rate limit: 1 request per second to be safe
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ Erro: [${item.contentType}] ${item.contentId}:`, err);
      errors++;
    }
  }

  console.log(`\n✅ Concluído!`);
  console.log(`   Gerados: ${generated}`);
  console.log(`   Pulados (cache válido): ${skipped}`);
  console.log(`   Erros: ${errors}`);
}

main().catch(console.error);
