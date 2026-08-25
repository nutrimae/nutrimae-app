import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SIGNED_URL_TTL_SECONDS = 600;

/**
 * Único caminho autorizado pra reproduzir um vídeo de food_videos. O bucket
 * "food-videos" é privado — ninguém pega a URL de reprodução direto do
 * banco (`video_url` guarda só o caminho no Storage pra upload próprio, ou
 * uma URL externa quando a usuária colou um link em vez de enviar arquivo).
 *
 * Autorização: dona do vídeo, admin, ou vídeo já "aprovado" (qualquer
 * usuária autenticada pode assistir conteúdo aprovado). Vídeo
 * "pendente_moderacao"/"rejeitado" só é visível pra dona e admin — nem por
 * engenharia reversa da URL, porque o Storage em si nunca fica público.
 */
export async function GET(_request: Request, context: RouteContext<"/api/videos/[id]">) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: video } = await admin
    .from("food_videos")
    .select("video_url, video_status, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!video) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: profile } = await admin.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle();
  const isOwner = video.user_id === user.id;
  const isAdmin = Boolean(profile?.is_admin);
  const isApproved = video.video_status === "aprovado";

  if (!isOwner && !isAdmin && !isApproved) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Link externo colado pela usuária em vez de arquivo enviado — não é
  // nosso arquivo, não tem o que assinar, devolve como está.
  if (/^https?:\/\//i.test(video.video_url)) {
    return NextResponse.json({ url: video.video_url });
  }

  const { data: signed, error } = await admin.storage
    .from("food-videos")
    .createSignedUrl(video.video_url, SIGNED_URL_TTL_SECONDS);

  if (error || !signed) return NextResponse.json({ error: "playback_unavailable" }, { status: 500 });

  return NextResponse.json({ url: signed.signedUrl });
}
