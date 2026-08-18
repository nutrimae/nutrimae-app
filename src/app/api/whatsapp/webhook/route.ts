import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAiResponse, transcribeAudio } from "@/lib/ai/nutribot-service";
import { downloadMedia, sendMessage } from "@/lib/whatsapp/whatsapp-client";
import { getEntitlementStatus } from "@/lib/entitlements";

/**
 * Webhook do WhatsApp Cloud API para a NutriBot.
 *
 * Variáveis de ambiente necessárias (ver também nutribot-service.ts e
 * whatsapp-client.ts):
 * - WA_VERIFY_TOKEN: valor arbitrário definido por nós e configurado também
 *   no painel do Meta ao registrar este webhook (usado na verificação GET).
 * - WA_TOKEN / WA_PHONE_ID: ver whatsapp-client.ts.
 * - OPENAI_API_KEY: ver nutribot-service.ts.
 *
 * Permissão de acesso: reaproveitamos o schema já existente em vez de criar
 * uma tabela isolada.
 * 1. `profiles.phone_number` (ver supabase/schema.sql, seção 5.1) guarda o
 *    telefone no formato internacional sem "+" — preenchido pelo webhook de
 *    compra quando a plataforma de pagamento envia o telefone da cliente.
 * 2. Achamos o `user_id` correspondente ao telefone que escreveu.
 * 3. Checamos em `user_products` se esse `user_id` tem o produto
 *    "nutribot_vip" (ver src/lib/products.ts) com status "active".
 */

const CHECKOUT_LINK = process.env.NUTRIBOT_CHECKOUT_LINK ?? "[LINK_DO_CHECKOUT]";

const NO_ACCESS_REPLY =
  `Olá! Sou a NutriBot 🤖. Vi que você ainda não ativou seu acesso VIP. ` +
  `Para tirar dúvidas 24h por dia comigo, libere seu acesso aqui: ${CHECKOUT_LINK}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

interface WhatsAppTextMessage {
  from: string;
  type: "text";
  text: { body: string };
}

interface WhatsAppAudioMessage {
  from: string;
  type: "audio";
  audio: { id: string };
}

type WhatsAppMessage = WhatsAppTextMessage | WhatsAppAudioMessage | { from: string; type: string };

function isTextMessage(message: WhatsAppMessage): message is WhatsAppTextMessage {
  return message.type === "text";
}

function isAudioMessage(message: WhatsAppMessage): message is WhatsAppAudioMessage {
  return message.type === "audio";
}

async function hasNutribotAccess(
  admin: ReturnType<typeof createAdminClient>,
  phoneNumber: string,
): Promise<boolean> {
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (profileError) {
    console.error("[whatsapp-webhook] falha ao consultar profiles por telefone", profileError);
    return false;
  }

  if (!profile?.user_id) {
    // Nenhuma conta com esse telefone — não é considerado erro, só sem acesso.
    return false;
  }

  const status = await getEntitlementStatus(admin, profile.user_id, "nutribot_vip");
  return status === "active";
}

async function handleIncomingMessage(from: string, message: WhatsAppMessage) {
  const admin = createAdminClient();

  const allowed = await hasNutribotAccess(admin, from);
  if (!allowed) {
    await sendMessage(from, NO_ACCESS_REPLY);
    return;
  }

  let content: string | null = null;

  if (isTextMessage(message)) {
    content = message.text.body;
  } else if (isAudioMessage(message)) {
    try {
      const audioBlob = await downloadMedia(message.audio.id);
      content = await transcribeAudio(audioBlob);
      console.log(`[whatsapp-webhook] áudio de ${from} transcrito: "${content}"`);
    } catch (err) {
      console.error(`[whatsapp-webhook] falha ao processar áudio de ${from}`, err);
      await sendMessage(
        from,
        "Não consegui entender seu áudio agora 😕 Pode tentar escrever sua pergunta?",
      );
      return;
    }
  }

  if (!content) {
    await sendMessage(
      from,
      "Por agora só consigo entender mensagens de texto ou áudio 🙏",
    );
    return;
  }

  const reply = await getAiResponse(content);
  await sendMessage(from, reply);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: any[] = (body as any)?.entry ?? [];

    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const messages: WhatsAppMessage[] = change?.value?.messages ?? [];
        for (const message of messages) {
          if (!message?.from) continue;
          // Processa de forma best-effort: uma falha numa mensagem não deve
          // impedir o processamento das demais nem derrubar o webhook.
          try {
            await handleIncomingMessage(message.from, message);
          } catch (err) {
            console.error("[whatsapp-webhook] falha ao processar mensagem", err);
          }
        }
      }
    }
  } catch (err) {
    console.error("[whatsapp-webhook] falha inesperada ao processar payload", err);
  }

  // A Meta exige 200 rapidamente, independente do resultado do processamento,
  // para não reenviar o mesmo evento em loop.
  return NextResponse.json({ ok: true });
}
