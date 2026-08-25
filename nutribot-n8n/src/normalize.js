/**
 * Normalização do evento cru recebido pelo webhook (Evolution API).
 *
 * Dois detalhes que quebraram em produção e por isso ficam documentados
 * aqui, não só no código:
 *
 * 1. O node Webhook do n8n NÃO expõe o corpo do POST direto em `$json` —
 *    ele embrulha tudo em `{ headers, params, query, body }`. Ler
 *    `$input.item.json.phone` sem descer em `.body` primeiro sempre dá
 *    `undefined`, não importa o provedor. `unwrapWebhookBody()` resolve
 *    isso (e ainda aceita o objeto "cru" — usado pelos testes/fixtures,
 *    que simulam só o corpo do POST, sem o envelope do n8n).
 *
 * 2. O formato de payload da Evolution API é bem diferente do da Z-API:
 *    o telefone vem em `data.key.remoteJid` (formato "5511...@s.whatsapp.net",
 *    precisa cortar o sufixo), o texto vem em `data.message.conversation`
 *    (texto simples) ou `data.message.extendedTextMessage.text` (texto
 *    com formatação/resposta citada), o id da mensagem em `data.key.id`,
 *    `fromMe` em `data.key.fromMe`, e o nome de quem mandou em
 *    `data.pushName`. `extractMessageData()` resolve isso — e ainda cai de
 *    volta no formato antigo (`phone`/`text.message`/`messageId`/...) se
 *    esses campos não existirem, então fixtures antigas continuam válidas.
 *
 * Espelha o Code node "Normalize Event" do workflow n8n
 * (workflow/nutribot.workflow.json) — qualquer mudança aqui precisa ser
 * replicada lá (e vice-versa). Coberto por tests/normalize.test.mjs.
 */

const RESET_COMMANDS = new Set([
  "reiniciar",
  "reiniciar bot",
  "resetar",
  "comecar de novo",
  "menu",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Remove acentos para comparar comandos de reinício de forma tolerante
 * (ex.: "começar de novo" e "comecar de novo" devem ser equivalentes).
 * Regra explícita do spec: "normalizar acentos dos comandos quando necessário".
 */
export function stripAccents(value) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Desembrulha o `{ headers, params, query, body }` que o node Webhook do
 * n8n coloca em volta do corpo real do POST. Se não houver esse envelope
 * (ex.: testes passando o corpo direto), devolve o valor como veio.
 */
export function unwrapWebhookBody(raw) {
  if (raw && typeof raw === "object" && raw.body && typeof raw.body === "object") {
    return raw.body;
  }
  return raw;
}

/**
 * Extrai phone/text/messageId/senderName/fromMe do payload da Evolution
 * API (`{ event, instance, data: { key, message, pushName } }`), com
 * fallback para o formato antigo (flat) usado pelas fixtures/testes.
 */
function extractMessageData(body) {
  const source = body && typeof body === "object" ? body : {};
  const data = source.data && typeof source.data === "object" ? source.data : source;
  const key = data.key && typeof data.key === "object" ? data.key : {};
  const message = data.message && typeof data.message === "object" ? data.message : {};

  const remoteJid = typeof key.remoteJid === "string" ? key.remoteJid : null;
  const rawPhone = remoteJid ? remoteJid.split("@")[0] : (data.phone ?? "");

  const rawText =
    message.conversation ??
    message.extendedTextMessage?.text ??
    data.text?.message ??
    "";

  const rawMessageId = key.id ?? data.messageId ?? "";
  const rawSenderName = data.pushName ?? data.senderName ?? "";
  const rawFromMe = "fromMe" in key ? key.fromMe : data.fromMe;

  return { rawPhone, rawText, rawMessageId, rawSenderName, rawFromMe };
}

/**
 * @param {unknown} raw payload bruto recebido no webhook (item.json do node Webhook)
 */
export function normalizeEvent(raw) {
  const body = unwrapWebhookBody(raw);
  const { rawPhone, rawText, rawMessageId, rawSenderName, rawFromMe } = extractMessageData(body);

  const phone = String(rawPhone ?? "").trim();
  const text = String(rawText ?? "").trim();
  const textLower = text.toLowerCase();
  const textLowerNoAccents = stripAccents(textLower);
  const messageId = String(rawMessageId ?? "").trim();
  const senderName = String(rawSenderName ?? "").trim();

  // fromMe pode vir como boolean ou como string "true"/"false" dependendo
  // do provedor/evento — aceitamos os dois.
  const fromMe = rawFromMe === true || rawFromMe === "true";

  const containsAt = text.includes("@");
  const isValidEmail = EMAIL_REGEX.test(text);
  const isInvalidEmail = containsAt && !isValidEmail;
  const isReset = RESET_COMMANDS.has(textLowerNoAccents);

  // E-mail sempre normalizado em minúsculas antes de ir para o Typebot/DB.
  const normalizedEmail = isValidEmail ? text.toLowerCase() : null;

  return {
    phone,
    text,
    textLower,
    messageId,
    senderName,
    fromMe,
    containsAt,
    isValidEmail,
    isInvalidEmail,
    isReset,
    normalizedEmail,
  };
}

export { RESET_COMMANDS, EMAIL_REGEX };
