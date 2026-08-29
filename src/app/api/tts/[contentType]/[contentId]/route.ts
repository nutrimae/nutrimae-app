import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { synthesizeSpeech, contentHash } from "@/lib/tts";
import { isTtsRateLimited } from "@/lib/tts/rate-limit";

export const runtime = "nodejs";

const VALID_CONTENT_TYPES = new Set(["food", "recipe", "sos", "allergy"]);
const SAFE_ID_PATTERN = /^[a-z0-9-]+$/;
const MAX_TEXT_LENGTH = 2000;

// /sos é a única superfície SEM login (ver isPublicSos abaixo) — por isso é
// a única que precisa de allowlist fechada de contentId. Sem isso, qualquer
// bot podia inventar um contentId novo a cada request pra forçar cache miss
// e gerar áudio (Google Cloud TTS, pago por caractere) infinitamente, sem
// nunca precisar logar. Ids vêm de src/app/sos/page.tsx.
const SOS_ALLOWED_IDS = new Set(["reflex", "gag-info", "allergy", "gut", "fever", "engasgo-infant", "engasgo-child"]);

/**
 * GET /api/tts/:contentType/:contentId
 *
 * Serve o áudio TTS cacheado, ou gera sob demanda se não existir.
 * O texto narrado é passado como query param `text` (URL-encoded)
 * pelo componente ListenButton, garantindo que é EXATAMENTE
 * o texto exibido na tela.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ contentType: string; contentId: string }> },
) {
  const { contentType, contentId } = await params;

  // SEC: rate limit por IP antes de qualquer trabalho — este endpoint
  // dispara uma chamada paga (Google Cloud TTS) em cache miss.
  if (await isTtsRateLimited(request)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!VALID_CONTENT_TYPES.has(contentType) || !SAFE_ID_PATTERN.test(contentId)) {
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }

  // Auth check (usuária logada ou página pública do SOS)
  const isPublicSos = contentType === "sos";
  if (!isPublicSos) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (!SOS_ALLOWED_IDS.has(contentId)) {
    // Superfície pública: só os ids reais do /sos podem gerar áudio.
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }

  // Texto a narrar vem do query param (exatamente o texto da tela)
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json({ error: "missing_text" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "text_too_long" }, { status: 400 });
  }

  const hash = contentHash(text);
  const adminSupabase = createAdminClient();

  // Verificar cache
  const { data: cached } = await adminSupabase
    .from("tts_audio_cache")
    .select("storage_path, content_hash")
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

  if (cached && cached.content_hash === hash) {
    // Cache hit com mesmo hash — redirecionar para o storage público
    const { data: urlData } = adminSupabase.storage
      .from("tts-audio")
      .getPublicUrl(cached.storage_path);

    return NextResponse.redirect(urlData.publicUrl, 302);
  }

  // Cache miss ou hash diferente (texto foi editado) — gerar novo áudio
  try {
    const audioBuffer = await synthesizeSpeech(text);
    const storagePath = `${contentType}/${contentId}-${hash}.mp3`;

    // Upload para Supabase Storage
    const { error: uploadError } = await adminSupabase.storage
      .from("tts-audio")
      .upload(storagePath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("TTS upload error:", uploadError);
      return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }

    // Upsert no cache
    await adminSupabase.from("tts_audio_cache").upsert(
      {
        content_type: contentType,
        content_id: contentId,
        content_hash: hash,
        storage_path: storagePath,
      },
      { onConflict: "content_type,content_id" },
    );

    // Servir o áudio reciém-gerado
    const { data: urlData } = adminSupabase.storage
      .from("tts-audio")
      .getPublicUrl(storagePath);

    return NextResponse.redirect(urlData.publicUrl, 302);
  } catch (err) {
    console.error("TTS generation error:", err);
    return NextResponse.json({ error: "tts_failed" }, { status: 500 });
  }
}
