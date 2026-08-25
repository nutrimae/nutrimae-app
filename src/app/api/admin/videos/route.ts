import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isCurrentUserAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase.from("food_videos").select("*").order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("video_status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching videos for moderation", error);
      return NextResponse.json({ error: "Erro ao buscar vídeos." }, { status: 500 });
    }

    // Bucket é privado — o painel de moderação também precisa de URL
    // assinada pra reproduzir, mesmo tendo acesso de admin à linha do banco.
    const admin = createAdminClient();
    const videos = await Promise.all(
      (data || []).map(async (video) => {
        if (/^https?:\/\//i.test(video.video_url)) return video;
        const { data: signed } = await admin.storage.from("food-videos").createSignedUrl(video.video_url, 600);
        return { ...video, video_url: signed?.signedUrl ?? video.video_url };
      }),
    );

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Unexpected error in GET /api/admin/videos", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

const ModerateVideoSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["aprovar", "rejeitar", "excluir"]),
  rejection_reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isCurrentUserAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ModerateVideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.issues }, { status: 400 });
    }

    const { id, action, rejection_reason } = parsed.data;

    if (action === "excluir") {
      const { data: existing } = await supabase.from("food_videos").select("video_url").eq("id", id).maybeSingle();

      const { error } = await supabase.from("food_videos").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: "Erro ao excluir vídeo." }, { status: 500 });
      }

      if (existing && !/^https?:\/\//i.test(existing.video_url)) {
        const admin = createAdminClient();
        const { error: storageError } = await admin.storage.from("food-videos").remove([existing.video_url]);
        if (storageError) console.error("[admin/videos] falha ao remover arquivo do storage", storageError);
      }

      return NextResponse.json({ success: true, action: "excluido" });
    }

    if (action === "rejeitar" && !rejection_reason?.trim()) {
      return NextResponse.json(
        { error: "Motivo da rejeição é obrigatório para registrar a moderação." },
        { status: 400 },
      );
    }

    const nextStatus = action === "aprovar" ? "aprovado" : "rejeitado";

    const { data, error } = await supabase
      .from("food_videos")
      .update({
        video_status: nextStatus,
        rejection_reason: action === "rejeitar" ? rejection_reason : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating video status", error);
      return NextResponse.json({ error: "Erro ao atualizar status do vídeo." }, { status: 500 });
    }

    return NextResponse.json({ success: true, video: data });
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/videos", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
