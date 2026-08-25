// Gera workflow/nutribot.workflow.json e workflow/nutribot-error.workflow.json
// e workflow/nutribot-typebot-sync.workflow.json a partir de definições JS
// normais (evita erro humano de escaping ao escrever JSON gigante à mão).
//
// Rodar: node tools/generate-workflow.mjs
//
// O código dos Code nodes abaixo é a MESMA lógica de src/normalize.js,
// src/router.js, src/typebotResponse.js e src/sessionStore.js — só que
// reescrita como script auto-contido (Code nodes do n8n não importam
// arquivos locais). Qualquer mudança de regra de negócio precisa ser
// replicada nos dois lugares; os testes em tests/ cobrem a versão em
// src/, não este texto (ver docs/route-map.md, seção "sincronização").

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "workflow");
mkdirSync(outDir, { recursive: true });

function id() {
  return "n8n-" + Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------
// Code node bodies (JS puro, sem import/require — restrição do n8n Code node)
// ---------------------------------------------------------------------

const NORMALIZE_CODE = `
// Tudo dentro de um try/catch de propósito: se algo aqui lançar, o n8n
// mostra só um resumo genérico no painel de erro, sem indicar linha nem
// arquivo. Capturando aqui, o node NUNCA falha "silenciosamente" de novo
// — ele sempre devolve um item, e se algo quebrou, esse item traz
// debugErrorMessage/debugErrorStack pra gente
// ver a causa real na aba Output, em vez de adivinhar.
try {
  const RESET_COMMANDS = new Set(['reiniciar', 'reiniciar bot', 'resetar', 'comecar de novo', 'menu']);
  const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

  function stripAccents(value) {
    return value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  }

  // O node Webhook do n8n embrulha o corpo do POST em { headers, params,
  // query, body } — sem descer em .body primeiro, todo campo abaixo vem
  // undefined, não importa o provedor.
  const envelope = $input.item.json;
  const rawBody = (envelope && typeof envelope.body === 'object' && envelope.body) ? envelope.body : envelope;

  // Formato da Evolution API (evento messages.upsert): { data: { key, message, pushName } }.
  // Se não vier nesse formato (ex.: fixture antiga só com phone/text.message),
  // cai de volta pro formato achatado.
  const data = (rawBody && typeof rawBody.data === 'object') ? rawBody.data : (rawBody || {});
  const key = (data && typeof data.key === 'object') ? data.key : {};
  const message = (data && typeof data.message === 'object') ? data.message : {};

  const remoteJid = typeof key.remoteJid === 'string' ? key.remoteJid : null;
  const rawPhone = remoteJid ? remoteJid.split('@')[0] : (data.phone ?? '');

  const rawText =
    message.conversation ??
    (message.extendedTextMessage && message.extendedTextMessage.text) ??
    (data.text && data.text.message) ??
    '';

  const rawMessageId = key.id ?? data.messageId ?? '';
  const rawSenderName = data.pushName ?? data.senderName ?? '';
  const rawFromMe = ('fromMe' in key) ? key.fromMe : data.fromMe;

  const phone = String(rawPhone ?? '').trim();
  const text = String(rawText ?? '').trim();
  const textLower = text.toLowerCase();
  const textLowerNoAccents = stripAccents(textLower);
  const messageId = String(rawMessageId ?? '').trim();
  const senderName = String(rawSenderName ?? '').trim();

  // fromMe pode vir como boolean ou como string "true"/"false" dependendo do provedor/evento.
  const fromMe = rawFromMe === true || rawFromMe === 'true';

  const containsAt = text.includes('@');
  const isValidEmail = EMAIL_REGEX.test(text);
  const isInvalidEmail = containsAt && !isValidEmail;
  const isReset = RESET_COMMANDS.has(textLowerNoAccents);
  const normalizedEmail = isValidEmail ? text.toLowerCase() : null;

  const isRejected = fromMe || !phone || !text || !messageId;

  return {
    json: {
      phone, text, textLower, messageId, senderName, fromMe,
      containsAt, isValidEmail, isInvalidEmail, isReset, normalizedEmail,
      isRejected,
      debugError: false,
    },
  };
} catch (err) {
  return {
    json: {
      isRejected: true,
      debugError: true,
      debugErrorMessage: String(err && err.message),
      debugErrorStack: String(err && err.stack),
      debugRawInput: $input.item.json,
    },
  };
}
`.trim();

const DECIDE_ROUTE_CODE = `
// Espelha src/router.js decideRoute() + monta a "action" que o node
// Switch usa a seguir. Roda depois do Postgres "Claim Message (dedup)".
const event = $('Normalize Event').item.json;
const claimRow = $input.item.json;

// "claimed" vem da CTE em CLAIM_MESSAGE_SQL: false = este messageId já
// tinha sido processado antes (dedup) — nem chega a decidir rota de verdade.
if (claimRow.claimed !== true) {
  return { json: { route: 'duplicate_ignored', action: 'duplicate', phone: event.phone } };
}

const isNewRow = claimRow.is_new_row === true || claimRow.is_new_row === 't';

// Sessão "para fins de roteamento": se a linha acabou de ser criada agora
// pelo claim, semanticamente não existia sessão nenhuma até este instante.
const session = isNewRow ? null : claimRow;

const SESSION_TTL_HOURS = Number($env.SESSION_TTL_HOURS || 24);
const now = new Date();

function isSessionActive(s) {
  if (!s) return false;
  if (!s.session_id || String(s.session_id).trim() === '') return false;
  if (s.status && s.status !== 'active') return false;
  if (!s.updated_at) return false;
  const updatedAt = new Date(s.updated_at);
  if (Number.isNaN(updatedAt.getTime())) return false;
  return (now.getTime() - updatedAt.getTime()) < SESSION_TTL_HOURS * 60 * 60 * 1000;
}

let route;
if (event.isReset) {
  route = 'reset';
} else if (event.isValidEmail) {
  route = 'email_valid';
} else if (event.isInvalidEmail) {
  route = 'email_invalid';
} else if (isSessionActive(session)) {
  route = 'continuation';
} else if (session) {
  route = 'fallback_expired_or_invalid';
} else {
  route = 'initial_no_session';
}

const savedEmail = session ? session.email_cliente : null;
const savedIdade = session ? session.idade_bebe : null;
const hasEmail = Boolean(savedEmail);

let action;
let staticMessage = null;
let typebotMode = null;
let prefilledVariables = null;
let sessionIdForContinue = null;

const MSG_NEED_EMAIL_MEMORY = 'Mamãe, para eu continuar te ajudando, preciso confirmar seu e-mail de compra. 💛';
const MSG_INVALID_EMAIL = 'Ops, mamãe! Esse e-mail parece incompleto. 💛 Confira e envie novamente o mesmo e-mail usado na compra. Exemplo: seumail@gmail.com';
const MSG_WELCOME_NO_SESSION = 'Oi, mamãe! 🥰 Seja muito bem-vinda ao NutriBot.\\n\\nPara localizar sua assinatura e liberar seu acesso, digite aqui o mesmo e-mail que você utilizou no momento da compra.\\n\\nExemplo: seumail@gmail.com';

switch (route) {
  case 'email_invalid':
    action = 'send_static';
    staticMessage = MSG_INVALID_EMAIL;
    break;

  case 'initial_no_session':
    action = 'send_static';
    staticMessage = MSG_WELCOME_NO_SESSION;
    break;

  case 'reset':
  case 'fallback_expired_or_invalid':
    if (!hasEmail) {
      action = 'send_static';
      staticMessage = MSG_NEED_EMAIL_MEMORY;
    } else {
      action = 'start_chat';
      typebotMode = 'start';
      prefilledVariables = savedIdade
        ? { email_cliente: savedEmail, telefone: event.phone, idade_bebe: savedIdade }
        : { email_cliente: savedEmail, telefone: event.phone };
    }
    break;

  case 'email_valid':
    action = 'start_chat';
    typebotMode = 'start';
    prefilledVariables = savedIdade
      ? { email_cliente: event.normalizedEmail, telefone: event.phone, idade_bebe: savedIdade }
      : { email_cliente: event.normalizedEmail, telefone: event.phone };
    break;

  case 'continuation':
    action = 'continue_chat';
    typebotMode = 'continue';
    sessionIdForContinue = session.session_id;
    break;

  default:
    action = 'send_static';
    staticMessage = MSG_NEED_EMAIL_MEMORY;
}

return {
  json: {
    route,
    action,
    staticMessage,
    typebotMode,
    prefilledVariables,
    sessionIdForContinue,
    phone: event.phone,
    text: event.text,
    messageId: event.messageId,
    emailForSave: route === 'email_valid' ? event.normalizedEmail : savedEmail,
    idadeForSave: savedIdade,
    lastErrorNotifiedAt: session ? session.last_error_notified_at : null,
  },
};
`.trim();

const INTERPRET_TYPEBOT_REPLY_CODE = `
// Espelha src/typebotResponse.js interpretTypebotResult().
const decision = $('Decide Route & Build Action').item.json;
const result = $input.item.json;

function flattenRichTextNode(node) {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(flattenRichTextNode).join('');
  return '';
}
function richTextToString(rt) {
  if (!Array.isArray(rt)) return '';
  return rt.map(flattenRichTextNode).filter(Boolean).join('\\n');
}
function extractMessageText(message) {
  if (!message || message.type !== 'text') return '';
  const content = message.content || {};
  const raw = content.markdown ?? content.richText ?? '';
  if (raw == null) return '';
  const text = typeof raw === 'string' ? raw : richTextToString(raw);
  return text.trim();
}

const messages = Array.isArray(result.messages) ? result.messages : [];
const hasInput = Boolean(result.input);
const replyText = messages.map(extractMessageText).map((t) => t.trim()).filter((t) => t.length > 0).join('\\n');

return {
  json: {
    phone: decision.phone,
    messageId: decision.messageId,
    route: decision.route,
    emailForSave: decision.emailForSave,
    idadeForSave: decision.idadeForSave,
    sessionId: result.sessionId ?? null,
    replyText,
    hasReply: replyText.length > 0,
    shouldKeepSession: hasInput,
  },
};
`.trim();

const HANDLE_TYPEBOT_ERROR_CODE = `
// Espelha src/sessionStore.js shouldNotifyError() — cooldown do aviso de erro.
const decision = $('Decide Route & Build Action').item.json;
const cooldownMinutes = Number($env.ERROR_MESSAGE_COOLDOWN_MINUTES || 10);
const now = new Date();

let shouldNotify = true;
if (decision.lastErrorNotifiedAt) {
  const last = new Date(decision.lastErrorNotifiedAt);
  if (!Number.isNaN(last.getTime())) {
    shouldNotify = (now.getTime() - last.getTime()) >= cooldownMinutes * 60 * 1000;
  }
}

const MSG_TEMPORARY_ERROR = 'Não consegui continuar sua conversa neste momento. Por favor, aguarde alguns instantes e envie sua mensagem novamente.\\n\\nSe precisar reiniciar, digite "reiniciar" para eu continuar te ajudando. 💛';

return {
  json: {
    phone: decision.phone,
    shouldNotify,
    message: MSG_TEMPORARY_ERROR,
  },
};
`.trim();

// ---------------------------------------------------------------------
// SQL (idêntico a src/sql.js — ver comentários lá sobre as decisões de design)
// ---------------------------------------------------------------------

// Variante em CTE de src/sql.js CLAIM_MESSAGE_SQL: a versão simples (INSERT
// ... ON CONFLICT ... WHERE ...) retorna ZERO linhas quando o messageId é
// duplicado, o que funciona perfeitamente no orchestrator Node.js (checa
// rowCount) mas NÃO no n8n — um node IF/Switch que recebe zero itens de
// entrada simplesmente não produz saída em nenhum ramo (não existe "ramo
// false" para zero itens). Por isso aqui garantimos SEMPRE exatamente 1
// linha de saída, com uma coluna "claimed" explícita para o Code/Switch
// node decidirem. A garantia de dedup (linha só é "reivindicada" uma vez
// por messageId) é idêntica à do src/sql.js — só a forma de expor o
// resultado muda.
const CLAIM_MESSAGE_SQL = `WITH claim AS (
  INSERT INTO nutribot_whatsapp_sessions (phone, last_message_id, updated_at, status)
  VALUES ($1, $2, NOW(), 'active')
  ON CONFLICT (phone) DO UPDATE SET
    last_message_id = EXCLUDED.last_message_id
  WHERE nutribot_whatsapp_sessions.last_message_id IS DISTINCT FROM EXCLUDED.last_message_id
  RETURNING
    phone, session_id, email_cliente, idade_bebe, status, updated_at,
    ended_at, last_message_id, last_error_notified_at,
    (xmax = 0) AS is_new_row, true AS claimed
)
SELECT * FROM claim
UNION ALL
SELECT
  phone, session_id, email_cliente, idade_bebe, status, updated_at,
  ended_at, last_message_id, last_error_notified_at,
  false AS is_new_row, false AS claimed
FROM nutribot_whatsapp_sessions
WHERE phone = $1 AND NOT EXISTS (SELECT 1 FROM claim);`;

const UPSERT_SESSION_AFTER_REPLY_SQL = `INSERT INTO nutribot_whatsapp_sessions (
  phone, session_id, updated_at, last_message_id, email_cliente, idade_bebe, status, ended_at, last_route
)
VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)
ON CONFLICT (phone) DO UPDATE SET
  session_id      = COALESCE(NULLIF(EXCLUDED.session_id, ''), nutribot_whatsapp_sessions.session_id),
  updated_at       = NOW(),
  last_message_id  = COALESCE(NULLIF(EXCLUDED.last_message_id, ''), nutribot_whatsapp_sessions.last_message_id),
  email_cliente    = COALESCE(NULLIF(EXCLUDED.email_cliente, ''), nutribot_whatsapp_sessions.email_cliente),
  idade_bebe       = COALESCE(NULLIF(EXCLUDED.idade_bebe, ''), nutribot_whatsapp_sessions.idade_bebe),
  status           = EXCLUDED.status,
  ended_at         = EXCLUDED.ended_at,
  last_route       = EXCLUDED.last_route
RETURNING *;`;

const MARK_ERROR_NOTIFIED_SQL = `UPDATE nutribot_whatsapp_sessions SET last_error_notified_at = NOW() WHERE phone = $1;`;

const SYNC_IDADE_FROM_TYPEBOT_SQL = `UPDATE nutribot_whatsapp_sessions
SET idade_bebe = COALESCE(NULLIF($2, ''), idade_bebe), updated_at = NOW()
WHERE phone = $1
RETURNING *;`;

// ---------------------------------------------------------------------
// Helpers de node
// ---------------------------------------------------------------------

function webhookNode(name, path, pos) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    position: pos,
    parameters: {
      httpMethod: "POST",
      path,
      responseMode: "responseNode",
      options: {},
    },
  };
}

function codeNode(name, code, pos) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: pos,
    parameters: { mode: "runOnceForEachItem", jsCode: code },
  };
}

function ifNode(name, conditions, pos) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.if",
    typeVersion: 2,
    position: pos,
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
        combinator: "and",
        conditions,
      },
      options: {},
    },
  };
}

function switchNode(name, valueExpr, rules, pos) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.switch",
    typeVersion: 3,
    position: pos,
    parameters: {
      mode: "rules",
      rules: {
        values: rules.map((r) => ({
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
            combinator: "and",
            conditions: [
              {
                leftValue: valueExpr,
                rightValue: r.value,
                operator: { type: "string", operation: "equals" },
              },
            ],
          },
          renameOutput: true,
          outputKey: r.output,
        })),
      },
      options: { fallbackOutput: "none" },
    },
  };
}

function postgresQueryNode(name, query, pos, extraOptions = {}) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.postgres",
    typeVersion: 2.5,
    position: pos,
    credentials: { postgres: { id: "POSTGRES_CREDENTIAL_ID", name: "Postgres — NutriBot" } },
    parameters: {
      operation: "executeQuery",
      query,
      options: { ...extraOptions },
    },
  };
}

function httpRequestNode(name, urlExpr, bodyExpr, pos, { onError = "continueRegularOutput", timeoutExpr } = {}) {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position: pos,
    onError,
    parameters: {
      method: "POST",
      url: urlExpr,
      sendHeaders: true,
      headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
      sendBody: true,
      specifyBody: "json",
      jsonBody: bodyExpr,
      options: { timeout: timeoutExpr ?? 15000 },
    },
  };
}

function respondNode(name, pos, body = '={{ { ok: true, route: $json.route ?? null } }}') {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1.1,
    position: pos,
    parameters: {
      respondWith: "json",
      responseBody: body,
      options: { responseCode: 200 },
    },
  };
}

// ---------------------------------------------------------------------
// Workflow principal
// ---------------------------------------------------------------------

const webhook = webhookNode("Webhook: Z-API Inbound", "nutribot/whatsapp", [0, 0]);
const normalize = codeNode("Normalize Event", NORMALIZE_CODE, [260, 0]);
const rejectIf = ifNode(
  "Reject? (fromMe / payload inválido)",
  [{ leftValue: "={{$json.isRejected}}", rightValue: true, operator: { type: "boolean", operation: "equals" } }],
  [520, 0],
);
const respondRejected = respondNode("Respond: Rejected", [780, -120], '={{ { ok: true, route: "rejected" } }}');

const claim = postgresQueryNode("Claim Message (dedup)", CLAIM_MESSAGE_SQL, [780, 80]);
// "Query Parameters" no n8n (parameters.options.queryReplacement) — o campo
// que o node mostra como "Query Parameters: Fixed/Expression". O valor
// precisa ser a expressão de verdade aqui (não uma string tipo "positional",
// que era um engano de uma versão anterior deste gerador).
claim.parameters.options.queryReplacement =
  "={{ [$('Normalize Event').item.json.phone, $('Normalize Event').item.json.messageId] }}";
// A CTE acima SEMPRE devolve exatamente 1 linha (claimed=true ou false) —
// de propósito, para nunca depender de um node de saída zero itens (ver
// comentário longo em CLAIM_MESSAGE_SQL acima).

const decideRoute = codeNode("Decide Route & Build Action", DECIDE_ROUTE_CODE, [1040, -40]);

const respondDuplicate = respondNode("Respond: Duplicate Ignored", [1560, 220]);

const actionSwitch = switchNode(
  "Action Switch",
  "={{$json.action}}",
  [
    { value: "duplicate", output: "duplicate" },
    { value: "send_static", output: "send_static" },
    { value: "start_chat", output: "start_chat" },
    { value: "continue_chat", output: "continue_chat" },
  ],
  [1300, -40],
);

// --- send_static branch ---
//
// Evolution API, não Z-API. Duas correções em relação ao que foi pedido:
// 1. Host: n8n e evolution-api são dois containers separados na mesma rede
//    docker "nutribot-net" (ver docker-compose.yml gerado por instalar.sh).
//    "127.0.0.1" de dentro do container do n8n aponta para o PRÓPRIO n8n,
//    não para a Evolution API — só funcionaria se os dois estivessem no
//    mesmo container/host network. O endereço que funciona é o nome do
//    serviço no compose: http://evolution-api:8080.
// 2. Corpo: a Evolution API não usa {phone, message} (isso é forma da
//    Z-API) — o endpoint /message/sendText/{instance} espera {number, text}.
//    Sem essa troca, a chamada seria aceita mas não enviaria nada.
const EVOLUTION_SEND_TEXT_URL = "={{ `http://evolution-api:8080/message/sendText/Nutribot` }}";
const EVOLUTION_API_KEY_HEADER = { name: "apikey", value: "EA70D372080B-4533-BECA-63D23F1EB3F3" };

const zapiStatic = httpRequestNode(
  "Evolution API: Send Static Message",
  EVOLUTION_SEND_TEXT_URL,
  "={{ { number: $json.phone, text: $json.staticMessage } }}",
  [1820, -260],
  { timeoutExpr: "={{ Number($env.WHATSAPP_SEND_TIMEOUT_MS || 10000) }}" },
);
zapiStatic.parameters.headerParameters.parameters.push({ ...EVOLUTION_API_KEY_HEADER });
// Nota: o node HTTP Request substitui $json pelo corpo da resposta da Z-API,
// então o Respond seguinte não pode ler $json.route — tem que buscar no
// node de origem explicitamente.
const respondStatic = respondNode(
  "Respond: Static Sent",
  [2080, -260],
  "={{ { ok: true, route: $('Decide Route & Build Action').item.json.route } }}",
);

// --- start_chat branch ---
const typebotStart = httpRequestNode(
  "Typebot: startChat",
  "={{ `${$env.TYPEBOT_BASE_URL}/api/v1/typebots/${$env.TYPEBOT_PUBLIC_ID}/startChat` }}",
  "={{ { prefilledVariables: $json.prefilledVariables, textBubbleContentFormat: 'markdown' } }}",
  [1820, -40],
  { onError: "continueErrorOutput", timeoutExpr: "={{ Number($env.TYPEBOT_TIMEOUT_MS || 15000) }}" },
);
typebotStart.parameters.headerParameters.parameters.push({
  name: "Authorization",
  value: "={{ $env.TYPEBOT_API_TOKEN ? `Bearer ${$env.TYPEBOT_API_TOKEN}` : undefined }}",
});

// --- continue_chat branch ---
const typebotContinue = httpRequestNode(
  "Typebot: continueChat",
  // session_id nunca vazio aqui: já validado no Code node "Decide Route" (rota continuation exige session_id truthy).
  // Expressões do n8n só aceitam UMA expressão (sem if/return soltos) — por isso a IIFE.
  "={{ (() => { if (!$json.sessionIdForContinue) throw new Error('session_id ausente — bloqueado antes de chamar continueChat.'); return `${$env.TYPEBOT_BASE_URL}/api/v1/sessions/${$json.sessionIdForContinue}/continueChat`; })() }}",
  "={{ { message: $json.text, textBubbleContentFormat: 'markdown' } }}",
  [1820, 180],
  { onError: "continueErrorOutput", timeoutExpr: "={{ Number($env.TYPEBOT_TIMEOUT_MS || 15000) }}" },
);
typebotContinue.parameters.headerParameters.parameters.push({
  name: "Authorization",
  value: "={{ $env.TYPEBOT_API_TOKEN ? `Bearer ${$env.TYPEBOT_API_TOKEN}` : undefined }}",
});

const interpretReply = codeNode("Interpret Typebot Reply", INTERPRET_TYPEBOT_REPLY_CODE, [2080, 60]);

const upsertAfterReply = postgresQueryNode("Upsert Session After Reply", UPSERT_SESSION_AFTER_REPLY_SQL, [2340, 60]);
upsertAfterReply.parameters.options.queryReplacement =
  "={{ [$json.phone, $json.sessionId || '', $json.messageId, $json.emailForSave || '', $json.idadeForSave || '', $json.shouldKeepSession ? 'active' : 'ended', $json.shouldKeepSession ? null : new Date().toISOString(), $json.route] }}";

// A entrada deste IF vem do Postgres "Upsert Session After Reply", cujo
// RETURNING * é a LINHA DO BANCO (sem campo hasReply/replyText) — por isso
// buscamos explicitamente no Code node de origem, não em $json.
const hasReplyIf = ifNode(
  "Has Reply Text?",
  [
    {
      leftValue: "={{$('Interpret Typebot Reply').item.json.hasReply}}",
      rightValue: true,
      operator: { type: "boolean", operation: "equals" },
    },
  ],
  [2600, 60],
);

const zapiReply = httpRequestNode(
  "Evolution API: Send Typebot Reply",
  EVOLUTION_SEND_TEXT_URL,
  "={{ { number: $('Interpret Typebot Reply').item.json.phone, text: $('Interpret Typebot Reply').item.json.replyText } }}",
  [2860, -60],
  { timeoutExpr: "={{ Number($env.WHATSAPP_SEND_TIMEOUT_MS || 10000) }}" },
);
zapiReply.parameters.headerParameters.parameters.push({ ...EVOLUTION_API_KEY_HEADER });

const respondReplySent = respondNode(
  "Respond: Reply Sent",
  [3120, -60],
  "={{ { ok: true, route: $('Interpret Typebot Reply').item.json.route } }}",
);
const respondNoReply = respondNode(
  "Respond: No Reply Needed",
  [2860, 180],
  "={{ { ok: true, route: $('Interpret Typebot Reply').item.json.route, note: 'typebot sem mensagens para enviar' } }}",
);

// --- error branch (timeout / créditos esgotados / HTTP erro do Typebot) ---
const handleTypebotError = codeNode("Handle Typebot Error", HANDLE_TYPEBOT_ERROR_CODE, [2080, 400]);
const shouldNotifyIf = ifNode(
  "Should Notify Error? (cooldown)",
  [{ leftValue: "={{$json.shouldNotify}}", rightValue: true, operator: { type: "boolean", operation: "equals" } }],
  [2340, 400],
);
// MARK_ERROR_NOTIFIED_SQL não tem RETURNING (é um UPDATE de efeito colateral
// só para o cooldown) — então este node não passa itens adiante. O envio da
// mensagem de erro sai em paralelo, direto do IF, para não depender da
// saída de uma query sem RETURNING.
const markErrorNotified = postgresQueryNode("Mark Error Notified", MARK_ERROR_NOTIFIED_SQL, [2600, 460]);
markErrorNotified.parameters.options.queryReplacement = "={{ [$json.phone] }}";

const zapiError = httpRequestNode(
  "Evolution API: Send Temporary Error",
  EVOLUTION_SEND_TEXT_URL,
  "={{ { number: $json.phone, text: $json.message } }}",
  [2600, 320],
  { timeoutExpr: "={{ Number($env.WHATSAPP_SEND_TIMEOUT_MS || 10000) }}" },
);
zapiError.parameters.headerParameters.parameters.push({ ...EVOLUTION_API_KEY_HEADER });

const respondErrorSent = respondNode("Respond: Error Message Sent", [2860, 320], '={{ { ok: true, route: "error_temporary" } }}');
const respondErrorCooldown = respondNode("Respond: Error Cooldown (silent)", [2600, 520], '={{ { ok: true, route: "error_temporary_cooldown" } }}');

const nodes = [
  webhook,
  normalize,
  rejectIf,
  respondRejected,
  claim,
  decideRoute,
  respondDuplicate,
  actionSwitch,
  zapiStatic,
  respondStatic,
  typebotStart,
  typebotContinue,
  interpretReply,
  upsertAfterReply,
  hasReplyIf,
  zapiReply,
  respondReplySent,
  respondNoReply,
  handleTypebotError,
  shouldNotifyIf,
  markErrorNotified,
  zapiError,
  respondErrorSent,
  respondErrorCooldown,
];

function conn(node, outIdx, target, inIdx = 0) {
  return { from: node.name, outIdx, to: target.name, inIdx };
}

const rawConnections = [
  conn(webhook, 0, normalize),
  conn(normalize, 0, rejectIf),
  conn(rejectIf, 0, respondRejected), // output0 = true (reject)
  conn(rejectIf, 1, claim), // output1 = false (segue)
  conn(claim, 0, decideRoute),
  conn(decideRoute, 0, actionSwitch),
  conn(actionSwitch, 0, respondDuplicate), // duplicate
  conn(actionSwitch, 1, zapiStatic), // send_static
  conn(actionSwitch, 2, typebotStart), // start_chat
  conn(actionSwitch, 3, typebotContinue), // continue_chat
  conn(zapiStatic, 0, respondStatic),
  conn(typebotStart, 0, interpretReply), // sucesso
  conn(typebotStart, 1, handleTypebotError), // erro (timeout/HTTP/créditos)
  conn(typebotContinue, 0, interpretReply), // sucesso
  conn(typebotContinue, 1, handleTypebotError), // erro
  conn(interpretReply, 0, upsertAfterReply),
  conn(upsertAfterReply, 0, hasReplyIf),
  conn(hasReplyIf, 0, zapiReply),
  conn(hasReplyIf, 1, respondNoReply),
  conn(zapiReply, 0, respondReplySent),
  conn(handleTypebotError, 0, shouldNotifyIf),
  conn(shouldNotifyIf, 0, markErrorNotified), // efeito colateral (sem RETURNING, ramo sem resposta)
  conn(shouldNotifyIf, 0, zapiError), // ramo em paralelo que efetivamente responde ao webhook
  conn(shouldNotifyIf, 1, respondErrorCooldown),
  conn(zapiError, 0, respondErrorSent),
];

function buildConnections(nodeList, connList) {
  const connections = {};
  for (const n of nodeList) connections[n.name] = { main: [] };

  for (const c of connList) {
    const bucket = connections[c.from].main;
    while (bucket.length <= c.outIdx) bucket.push([]);
    bucket[c.outIdx].push({ node: c.to, type: "main", index: c.inIdx });
  }
  return connections;
}

const mainWorkflow = {
  name: "NutriBot — WhatsApp Orchestrator",
  nodes,
  connections: buildConnections(nodes, rawConnections),
  active: false,
  settings: {
    executionOrder: "v1",
    saveDataErrorExecution: "all",
    saveDataSuccessExecution: "all",
    errorWorkflow: "NUTRIBOT_ERROR_WORKFLOW_ID",
  },
  pinData: {},
  versionId: id(),
};

writeFileSync(join(outDir, "nutribot.workflow.json"), JSON.stringify(mainWorkflow, null, 2) + "\n");

// ---------------------------------------------------------------------
// Error workflow (spec seção 2/20: "workflow de erro separado", "alertas
// para falhas repetidas"). Disparado automaticamente pelo n8n quando o
// workflow principal lança uma exceção não tratada (ex.: Z-API fora do ar
// mesmo após os retries do HTTP Request node).
// ---------------------------------------------------------------------

const errorTrigger = {
  id: id(),
  name: "Error Trigger",
  type: "n8n-nodes-base.errorTrigger",
  typeVersion: 1,
  position: [0, 0],
  parameters: {},
};

const REDACT_AND_LOG_CODE = `
// Redação básica antes de logar/alertar — nunca deixa token/e-mail em claro
// (mesma regra de src/redact.js).
const SECRET_KEY_PATTERN = /token|secret|password|senha|authorization|api[_-]?key/i;
const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function maskEmail(v) {
  if (typeof v !== 'string' || !EMAIL_PATTERN.test(v)) return v;
  const [user, domain] = v.split('@');
  return user.slice(0, 2) + '*'.repeat(Math.max(user.length - 2, 1)) + '@' + domain;
}

function redact(value, depth) {
  depth = depth || 0;
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) {
      if (SECRET_KEY_PATTERN.test(k)) out[k] = '***redacted***';
      else if (typeof value[k] === 'string' && EMAIL_PATTERN.test(value[k])) out[k] = maskEmail(value[k]);
      else out[k] = redact(value[k], depth + 1);
    }
    return out;
  }
  if (typeof value === 'string' && EMAIL_PATTERN.test(value)) return maskEmail(value);
  return value;
}

const err = $json;
const entry = {
  timestamp: new Date().toISOString(),
  level: 'error',
  event: 'workflow.failed',
  workflow: err.workflow ? err.workflow.name : null,
  node: err.execution && err.execution.lastNodeExecuted,
  message: err.execution && err.execution.error ? err.execution.error.message : String(err),
};
console.error(JSON.stringify(redact(entry)));
return { json: entry };
`.trim();

const redactAndLog = codeNode("Redact & Log Error", REDACT_AND_LOG_CODE, [260, 0]);

const alertNode = {
  id: id(),
  name: "Alert (configure Slack/Email aqui)",
  type: "n8n-nodes-base.noOp",
  typeVersion: 1,
  position: [520, 0],
  notes:
    "Placeholder deliberado: plugue aqui o node de Slack/Email/PagerDuty da sua organização. " +
    "Mantido como NoOp para não assumir credenciais que não existem neste repo. " +
    "Ver docs/production-checklist.md — alerta é obrigatório antes de ativar produção.",
  parameters: {},
};

const errorWorkflow = {
  name: "NutriBot — Error Workflow",
  nodes: [errorTrigger, redactAndLog, alertNode],
  connections: buildConnections(
    [errorTrigger, redactAndLog, alertNode],
    [conn(errorTrigger, 0, redactAndLog), conn(redactAndLog, 0, alertNode)],
  ),
  active: false,
  settings: { executionOrder: "v1" },
  pinData: {},
  versionId: id(),
};

writeFileSync(join(outDir, "nutribot-error.workflow.json"), JSON.stringify(errorWorkflow, null, 2) + "\n");

// ---------------------------------------------------------------------
// Sync workflow: o Typebot chama isto de volta quando captura idade_bebe
// (ver docs/typebot-flow-changes.md). Sem isso, n8n nunca saberia a idade
// para reutilizá-la em prefilledVariables num reinício/expiração.
// ---------------------------------------------------------------------

const syncWebhook = webhookNode("Webhook: Typebot Sync", "nutribot/typebot-sync", [0, 0]);

const syncCode = codeNode(
  "Validate Sync Payload",
  `
// Mesmo desembrulho de .body do Normalize Event (ver src/normalize.js) —
// o node Webhook também embrulha o corpo aqui.
const envelope = $input.item.json;
const raw = (envelope && typeof envelope.body === 'object' && envelope.body) ? envelope.body : envelope;
const phone = String(raw.telefone ?? raw.phone ?? '').trim();
const idadeBebe = String(raw.idade_bebe ?? '').trim();
if (!phone) { throw new Error('Sync do Typebot sem telefone — não é possível gravar idade_bebe.'); }
return { json: { phone, idadeBebe } };
`.trim(),
  [260, 0],
);

const syncUpsert = postgresQueryNode("Sync idade_bebe", SYNC_IDADE_FROM_TYPEBOT_SQL, [520, 0]);
syncUpsert.parameters.options.queryReplacement = "={{ [$json.phone, $json.idadeBebe] }}";

const syncRespond = respondNode("Respond: Sync OK", [780, 0], '={{ { ok: true } }}');

const syncWorkflow = {
  name: "NutriBot — Typebot Sync (idade_bebe)",
  nodes: [syncWebhook, syncCode, syncUpsert, syncRespond],
  connections: buildConnections(
    [syncWebhook, syncCode, syncUpsert, syncRespond],
    [conn(syncWebhook, 0, syncCode), conn(syncCode, 0, syncUpsert), conn(syncUpsert, 0, syncRespond)],
  ),
  active: false,
  settings: { executionOrder: "v1" },
  pinData: {},
  versionId: id(),
};

writeFileSync(join(outDir, "nutribot-typebot-sync.workflow.json"), JSON.stringify(syncWorkflow, null, 2) + "\n");

console.log("Gerados:");
console.log(" - workflow/nutribot.workflow.json (" + nodes.length + " nodes)");
console.log(" - workflow/nutribot-error.workflow.json");
console.log(" - workflow/nutribot-typebot-sync.workflow.json");
