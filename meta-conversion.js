/**
 * Esqueleto de envio de evento de compra (Purchase) via Meta Conversions API,
 * server-side — nunca depende só do Pixel no navegador (que perde eventos
 * com bloqueador de anúncio/Safari ITP). Chamar isto de dentro do webhook
 * do Pagar.me (src/app/api/webhooks/pagarme/route.ts), no caso "order.paid"
 * / "charge.paid", depois que o pedido é confirmado como pago de verdade —
 * nunca antes disso, pra não reportar conversão de venda que não aconteceu.
 *
 * Variáveis de ambiente necessárias (configurar você mesmo, nunca cole o
 * valor real disso em uma conversa comigo):
 *   META_ACCESS_TOKEN   — token de sistema (System User) do Business Manager,
 *                          com permissão "ads_management" só pro Pixel usado
 *                          aqui. Gerar em Configurações do Negócio > Usuários
 *                          do Sistema.
 *   META_PIXEL_ID       — o Pixel ID (Conjunto de Dados) de destino, em
 *                          Eventos Manager.
 *   META_TEST_EVENT_CODE (opcional) — código de teste do Events Manager,
 *                          só enquanto estiver validando no modo de teste.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- script Node solto, fora do bundle da app, roda direto com `node`. */
const bizSdk = require("facebook-nodejs-business-sdk");
const crypto = require("node:crypto");

const { EventRequest, UserData, CustomData, ServerEvent } = bizSdk;

function sha256(value) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * @param {object} params
 * @param {string} params.email - e-mail da compradora (será hasheado, nunca enviado em texto puro)
 * @param {string} [params.phone] - telefone só dígitos, com código do país (ex.: "5511999999999")
 * @param {string} params.orderId - id do pedido no nosso banco, usado como event_id pra dedup com o Pixel do navegador
 * @param {number} params.amountCents - valor pago em centavos
 * @param {string} [params.clientIp] - IP de quem comprou, se disponível na request
 * @param {string} [params.userAgent] - user-agent de quem comprou, se disponível
 */
async function sendPurchaseEvent({ email, phone, orderId, amountCents, clientIp, userAgent }) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;
  if (!accessToken || !pixelId) {
    throw new Error("META_ACCESS_TOKEN / META_PIXEL_ID ausentes — configure as variáveis de ambiente antes de chamar isto.");
  }

  bizSdk.FacebookAdsApi.init(accessToken);

  const userData = new UserData().setEmails([sha256(email)]);
  if (phone) userData.setPhones([sha256(phone)]);
  if (clientIp) userData.setClientIpAddress(clientIp);
  if (userAgent) userData.setClientUserAgent(userAgent);

  const customData = new CustomData()
    .setCurrency("BRL")
    .setValue(amountCents / 100);

  const event = new ServerEvent()
    .setEventName("Purchase")
    .setEventTime(Math.floor(Date.now() / 1000))
    .setEventId(orderId) // mesmo id usado no Pixel do navegador, se houver, pra deduplicar
    .setUserData(userData)
    .setCustomData(customData)
    .setActionSource("website");

  const request = new EventRequest(accessToken, pixelId).setEvents([event]);
  if (process.env.META_TEST_EVENT_CODE) {
    request.setTestEventCode(process.env.META_TEST_EVENT_CODE);
  }

  return request.execute();
}

module.exports = { sendPurchaseEvent };
