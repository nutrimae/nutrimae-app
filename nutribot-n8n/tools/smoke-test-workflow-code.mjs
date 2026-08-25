// Executa de fato os Code nodes embutidos em workflow/nutribot.workflow.json
// (com $input/$env/$() mockados) e compara contra src/normalize.js e
// src/router.js — não é um substituto para importar no n8n de verdade, mas
// pega erros de sintaxe/lógica na string de código embutida, que testes só
// em src/ não pegariam (já que o texto do node é gerado separadamente).
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { normalizeEvent } from "../src/normalize.js";
import { decideRoute } from "../src/router.js";
import { whatsappEvents, sessionFixtures, evolutionWebhookEvents } from "../fixtures/events.js";

const wf = JSON.parse(readFileSync(new URL("../workflow/nutribot.workflow.json", import.meta.url)));

function getCode(nodeName) {
  const node = wf.nodes.find((n) => n.name === nodeName);
  if (!node) throw new Error(`Node não encontrado: ${nodeName}`);
  return node.parameters.jsCode;
}

function runCodeNode(code, { input, refs = {}, env = {} }) {
  const sandbox = {
    $input: { item: { json: input }, all: () => [{ json: input }] },
    $env: env,
    $: (name) => {
      if (!(name in refs)) throw new Error(`referência não mockada: ${name}`);
      return { item: { json: refs[name] } };
    },
    console,
  };
  vm.createContext(sandbox);
  const wrapped = `(function () {\n${code}\n})()`;
  return vm.runInContext(wrapped, sandbox);
}

let failures = 0;
function check(label, cond) {
  if (!cond) {
    failures += 1;
    console.error("FALHOU:", label);
  } else {
    console.log("ok:", label);
  }
}

// --- Normalize Event ---
const normalizeCode = getCode("Normalize Event");
const allNormalizeFixtures = { ...whatsappEvents, ...evolutionWebhookEvents };
for (const [name, fixture] of Object.entries(allNormalizeFixtures)) {
  const result = runCodeNode(normalizeCode, { input: fixture });
  const expected = normalizeEvent(fixture);
  try {
    assert.deepEqual(
      { ...result.json, isRejected: undefined, debugError: undefined },
      { ...expected, isRejected: undefined, debugError: undefined },
    );
    check(`normalize:${name}`, true);
  } catch (err) {
    check(`normalize:${name} -> ${err.message}`, false);
  }
}

// --- Decide Route & Build Action ---
const decideCode = getCode("Decide Route & Build Action");

function runDecide(eventFixture, claimRow, env = {}) {
  const normalized = normalizeEvent(eventFixture);
  const result = runCodeNode(decideCode, {
    input: claimRow,
    refs: { "Normalize Event": normalized },
    env,
  });
  return result.json;
}

// caso 1: telefone novo (is_new_row true) -> initial_no_session
{
  const out = runDecide(whatsappEvents.oiSemSessao, { claimed: true, is_new_row: true });
  check("decide: telefone novo -> initial_no_session", out.route === "initial_no_session" && out.action === "send_static");
}

// caso 2: duplicado
{
  const out = runDecide(whatsappEvents.oiSemSessao, { claimed: false });
  check("decide: claimed=false -> duplicate_ignored", out.route === "duplicate_ignored" && out.action === "duplicate");
}

// caso 3: e-mail válido
{
  const out = runDecide(whatsappEvents.emailValidoAssinaturaAtiva, { claimed: true, is_new_row: true });
  check("decide: e-mail válido -> email_valid/start_chat", out.route === "email_valid" && out.action === "start_chat");
  check("decide: prefilledVariables usa o e-mail normalizado", out.prefilledVariables.email_cliente === "maria@gmail.com");
}

// caso 4: sessão ativa "6" -> continuation, comparando 1:1 com router.js
{
  const claimRow = { claimed: true, is_new_row: false, ...sessionFixtures.sessaoAtiva, last_message_id: null };
  const out = runDecide(whatsappEvents.sessaoAtivaMensagem6, claimRow, { SESSION_TTL_HOURS: "24" });
  const expected = decideRoute(normalizeEvent(whatsappEvents.sessaoAtivaMensagem6), sessionFixtures.sessaoAtiva, {
    now: new Date(),
    sessionTtlHours: 24,
  });
  check("decide: sessão ativa '6' bate com router.js", out.route === expected.route && out.route === "continuation");
  check("decide: continuation usa o session_id existente", out.sessionIdForContinue === sessionFixtures.sessaoAtiva.session_id);
}

// caso 5: session_id vazio -> fallback (nunca continuation)
{
  const claimRow = { claimed: true, is_new_row: false, ...sessionFixtures.sessionIdVazio, last_message_id: null };
  const out = runDecide(whatsappEvents.sessaoAtivaMensagem6, claimRow, { SESSION_TTL_HOURS: "24" });
  check("decide: session_id vazio -> fallback_expired_or_invalid", out.route === "fallback_expired_or_invalid");
  check("decide: fallback com e-mail salvo chama start_chat", out.action === "start_chat");
}

// caso 6: comando reiniciar tem prioridade sobre sessão ativa
{
  const claimRow = { claimed: true, is_new_row: false, ...sessionFixtures.sessaoAtiva, last_message_id: null };
  const out = runDecide(whatsappEvents.comandoReiniciar, claimRow, { SESSION_TTL_HOURS: "24" });
  check("decide: reset tem prioridade máxima", out.route === "reset");
}

// --- Interpret Typebot Reply ---
const interpretCode = getCode("Interpret Typebot Reply");
{
  const decision = { phone: "553182686499", messageId: "M1", route: "continuation", emailForSave: "a@b.com", idadeForSave: "10" };
  const typebotResult = {
    sessionId: "s1",
    messages: [
      { type: "text", content: { markdown: "Oi" } },
      { type: "text", content: { markdown: "" } },
      { type: "text", content: { markdown: "Tudo bem?" } },
    ],
    input: { type: "text input" },
  };
  const result = runCodeNode(interpretCode, { input: typebotResult, refs: { "Decide Route & Build Action": decision } });
  check("interpret: junta mensagens não vazias com \\n", result.json.replyText === "Oi\nTudo bem?");
  check("interpret: shouldKeepSession vem de input, não de messages.length", result.json.shouldKeepSession === true);
}

// --- Handle Typebot Error ---
const errorCode = getCode("Handle Typebot Error");
{
  const decision = { phone: "553182686499", lastErrorNotifiedAt: null };
  const result = runCodeNode(errorCode, { input: {}, refs: { "Decide Route & Build Action": decision }, env: {} });
  check("error: sem notificação anterior -> shouldNotify=true", result.json.shouldNotify === true);
}
{
  const decision = { phone: "553182686499", lastErrorNotifiedAt: new Date().toISOString() };
  const result = runCodeNode(errorCode, { input: {}, refs: { "Decide Route & Build Action": decision }, env: { ERROR_MESSAGE_COOLDOWN_MINUTES: "10" } });
  check("error: notificação recente -> shouldNotify=false (cooldown)", result.json.shouldNotify === false);
}

console.log(`\n${failures === 0 ? "TUDO OK" : failures + " FALHA(S)"}`);
process.exit(failures === 0 ? 0 : 1);
