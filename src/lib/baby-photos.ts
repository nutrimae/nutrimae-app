import type { SupabaseClient } from "@supabase/supabase-js";
import type { Baby } from "@/lib/types";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hora

/**
 * O bucket "baby-photos" é privado; `babies.photo_url` guarda o caminho no
 * storage (não uma URL pública), então resolvemos uma URL assinada e
 * temporária sempre que a lista de bebês é carregada.
 */
export async function withSignedPhotoUrls(
  supabase: SupabaseClient,
  babies: Baby[],
): Promise<Baby[]> {
  return Promise.all(
    babies.map(async (baby) => {
      if (!baby.photo_url) return baby;

      const { data } = await supabase.storage
        .from("baby-photos")
        .createSignedUrl(baby.photo_url, SIGNED_URL_TTL_SECONDS);

      return { ...baby, photo_url: data?.signedUrl ?? null };
    }),
  );
}
