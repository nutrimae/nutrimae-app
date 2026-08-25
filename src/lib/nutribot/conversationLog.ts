import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Log best-effort da conversa — mesmo padrão de retenção/exclusão dos
 * outros dados do bebê (cascade em auth.users, ver schema). Nunca usado
 * pra nenhuma outra finalidade além de responder a própria conversa; uma
 * falha aqui nunca deve impedir o envio da resposta.
 */
export async function logConversationTurn(
  admin: AdminClient,
  params: {
    phone: string;
    userId: string | null;
    babyId: string | null;
    direction: "in" | "out";
    message: string;
  },
) {
  try {
    await admin.from("nutribot_conversation_log").insert({
      phone: params.phone,
      user_id: params.userId,
      baby_id: params.babyId,
      direction: params.direction,
      message: params.message,
    });
  } catch (err) {
    console.error("[nutribot] falha ao gravar log de conversa (best-effort)", err);
  }
}
