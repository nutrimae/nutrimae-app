/**
 * Cliente fino para a WhatsApp Cloud API (Meta).
 *
 * Variáveis de ambiente necessárias:
 * - WA_TOKEN: token de acesso permanente do WhatsApp Business (System User).
 * - WA_PHONE_ID: ID do número de telefone (Phone Number ID) configurado no
 *   Meta Business Manager, de onde as mensagens são enviadas.
 */

const WA_API_VERSION = "v21.0";

function getWhatsAppConfig() {
  const token = process.env.WA_TOKEN;
  const phoneId = process.env.WA_PHONE_ID;

  if (!token || !phoneId) {
    throw new Error("WA_TOKEN e WA_PHONE_ID precisam estar configurados.");
  }

  return { token, phoneId };
}

/**
 * Envia uma mensagem de texto para um número via WhatsApp Cloud API.
 *
 * @param to Número do destinatário no formato E.164 sem "+" (ex: "5511999998888").
 * @param text Corpo da mensagem.
 */
export async function sendMessage(to: string, text: string): Promise<void> {
  const { token, phoneId } = getWhatsAppConfig();

  const res = await fetch(
    `https://graph.facebook.com/${WA_API_VERSION}/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text, preview_url: false },
      }),
    },
  );

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Falha ao enviar mensagem via WhatsApp Cloud API (status ${res.status}): ${errorBody}`,
    );
  }
}

/**
 * Baixa a mídia de uma mensagem (ex: áudio) a partir do seu media ID.
 *
 * A WhatsApp Cloud API entrega mídia em duas etapas: primeiro busca os
 * metadados (que incluem uma URL temporária e assinada), depois baixa os
 * bytes dessa URL — ambas as chamadas exigem o mesmo Bearer token.
 */
export async function downloadMedia(mediaId: string): Promise<Blob> {
  const { token } = getWhatsAppConfig();

  const metadataRes = await fetch(`https://graph.facebook.com/${WA_API_VERSION}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metadataRes.ok) {
    const errorBody = await metadataRes.text().catch(() => "");
    throw new Error(
      `Falha ao buscar metadados da mídia ${mediaId} (status ${metadataRes.status}): ${errorBody}`,
    );
  }

  const metadata: { url?: string } = await metadataRes.json();
  if (!metadata.url) {
    throw new Error(`Metadados da mídia ${mediaId} não trouxeram uma URL de download.`);
  }

  const mediaRes = await fetch(metadata.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!mediaRes.ok) {
    const errorBody = await mediaRes.text().catch(() => "");
    throw new Error(
      `Falha ao baixar os bytes da mídia ${mediaId} (status ${mediaRes.status}): ${errorBody}`,
    );
  }

  return mediaRes.blob();
}
