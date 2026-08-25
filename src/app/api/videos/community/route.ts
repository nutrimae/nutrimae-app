import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SubmitVideoSchema = z.object({
  food_id: z.string().min(1),
  baby_age_months: z.number().int().min(1).max(60).optional(),
  // Ou uma URL externa (link colado pela usuária), ou o caminho relativo
  // dentro do bucket privado "food-videos" devolvido pelo próprio upload
  // (formato "<user_id>/<arquivo>") — nunca uma URL pública, o bucket não
  // tem uma. Ver src/app/api/videos/[id]/route.ts pra como isso é resolvido
  // em URL assinada na hora de reproduzir.
  video_url: z.string().min(1).refine(
    (value) => /^https?:\/\//i.test(value) || /^[0-9a-f-]{36}\/[^/]+$/i.test(value),
    "video_url precisa ser uma URL http(s) ou um caminho '<user_id>/<arquivo>' válido",
  ),
  terms_accepted: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SubmitVideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos. O aceite dos termos é obrigatório.", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { food_id, baby_age_months, video_url } = parsed.data;

    // Se for um caminho do nosso bucket (não uma URL externa), o primeiro
    // segmento TEM que ser o próprio user_id — senão a usuária poderia
    // registrar um vídeo apontando pro arquivo de outra pessoa (mesmo sem
    // conseguir baixá-lo diretamente, a linha ficaria associada ao caminho
    // errado e um admin/dona real poderia acabar reproduzindo o vídeo de
    // outra usuária ao revisar/assistir este registro).
    if (!/^https?:\/\//i.test(video_url) && !video_url.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Caminho de vídeo inválido." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("food_videos")
      .insert({
        food_id,
        baby_age_months: baby_age_months || 12,
        video_url,
        video_tipo: "comunidade",
        video_status: "pendente_moderacao",
        user_id: user.id,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting community food video", error);
      return NextResponse.json({ error: "Erro ao salvar vídeo no banco de dados." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in /api/videos/community", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json({ error: "ID do vídeo é obrigatório." }, { status: 400 });
    }

    // Pega o caminho antes de apagar a linha — depois de apagada não tem
    // mais como saber qual arquivo remover.
    const { data: existing } = await supabase
      .from("food_videos")
      .select("video_url")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
    }

    const { error } = await supabase
      .from("food_videos")
      .delete()
      .eq("id", videoId)
      .eq("user_id", user.id);

    // Pedido de remoção é hard delete de verdade: sem isto, o arquivo
    // continuava existindo no Storage mesmo depois da linha sumir do banco.
    if (!error && !/^https?:\/\//i.test(existing.video_url)) {
      const admin = createAdminClient();
      const { error: storageError } = await admin.storage.from("food-videos").remove([existing.video_url]);
      if (storageError) console.error("[videos/community] falha ao remover arquivo do storage", storageError);
    }

    if (error) {
      console.error("Error deleting user video", error);
      return NextResponse.json({ error: "Erro ao remover vídeo." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/videos/community", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
