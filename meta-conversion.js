/**
 * Envio de eventos server-side pra Meta Conversions API — nunca depende só
 * do Pixel no navegador (que perde eventos com bloqueador de anúncio/Safari
 * ITP). Chamado de dentro de src/app/api/checkout/route.ts (InitiateCheckout,
 * no momento em que o pedido é criado) e de
 * src/app/api/webhooks/pagarme/route.ts (Purchase, só depois que o pedido é
 * confirmado como pago de verdade pelo webhook — nunca antes disso).
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
 * @param {string} params.eventName - "Purchase" ou "InitiateCheckout"
 * @param {string} params.eventId - id do pedido no nosso banco, usado pra deduplicar com o Pixel do navegador (mesmo event_id nos dois lados)
 * @param {string} params.email - e-mail de quem está comprando (será hasheado, nunca enviado em texto puro)
 * @param {string} [params.phone] - telefone só dígitos, com código do país (ex.: "5511999999999")
 * @param {number} [params.amountCents] - valor em centavos (da oferta selecionada, mesmo antes do pagamento ser confirmado)
 * @param {string} [params.clientIp] - IP de quem comprou, capturado no checkout (webhook não tem acesso à requisição original do navegador)
 * @param {string} [params.userAgent] - user-agent de quem comprou, capturado no checkout
 * @param {string} [params.fbc] - cookie _fbc do Pixel (clique de anúncio), capturado no checkout — maior sinal de correspondência que existe
 * @param {string} [params.fbp] - cookie _fbp do Pixel (navegador), capturado no checkout
 */
async function sendMetaEvent({ eventName, eventId, email, phone, amountCents, clientIp, userAgent, fbc, fbp }) {
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
  if (fbc) userData.setFbc(fbc);
  if (fbp) userData.setFbp(fbp);

  const customData = new CustomData().setCurrency("BRL");
  if (typeof amountCents === "number") customData.setValue(amountCents / 100);

  const event = new ServerEvent()
    .setEventName(eventName)
    .setEventTime(Math.floor(Date.now() / 1000))
    .setEventId(eventId) // mesmo id usado no Pixel do navegador, se houver, pra deduplicar
    .setUserData(userData)
    .setCustomData(customData)
    .setActionSource("website");

  const request = new EventRequest(accessToken, pixelId).setEvents([event]);
  if (process.env.META_TEST_EVENT_CODE) {
    request.setTestEventCode(process.env.META_TEST_EVENT_CODE);
  }

  return request.execute();
}

function sendPurchaseEvent({ email, phone, orderId, amountCents, clientIp, userAgent, fbc, fbp }) {
  return sendMetaEvent({ eventName: "Purchase", eventId: orderId, email, phone, amountCents, clientIp, userAgent, fbc, fbp });
}

function sendInitiateCheckoutEvent({ email, phone, orderId, amountCents, clientIp, userAgent, fbc, fbp }) {
  return sendMetaEvent({ eventName: "InitiateCheckout", eventId: `ic_${orderId}`, email, phone, amountCents, clientIp, userAgent, fbc, fbp });
}

module.exports = { sendPurchaseEvent, sendInitiateCheckoutEvent };
