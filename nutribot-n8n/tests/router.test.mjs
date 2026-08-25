import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeEvent } from "../src/normalize.js";
import { decideRoute, ROUTES, isSessionActive } from "../src/router.js";
import { whatsappEvents, sessionFixtures } from "../fixtures/events.js";

const NOW = new Date();

function route(eventFixture, session) {
  return decideRoute(normalizeEvent(eventFixture), session, { now: NOW, sessionTtlHours: 24 }).route;
}

test("1. fromMe boolean true -> REJECTED", () => {
  assert.equal(route(whatsappEvents.fromMeBooleanTrue, null), ROUTES.REJECTED);
});

test("1. fromMe string 'true' -> REJECTED", () => {
  assert.equal(route(whatsappEvents.fromMeStringTrue, null), ROUTES.REJECTED);
});

test("1. payload sem telefone -> REJECTED", () => {
  assert.equal(route(whatsappEvents.ausenciaDeTelefone, null), ROUTES.REJECTED);
});

test("1. payload sem texto -> REJECTED", () => {
  assert.equal(route(whatsappEvents.ausenciaDeTexto, null), ROUTES.REJECTED);
});

test("2. comando de reinício tem prioridade sobre tudo (mesmo com sessão ativa)", () => {
  assert.equal(route(whatsappEvents.comandoReiniciar, sessionFixtures.sessaoAtiva), ROUTES.RESET);
});

test("2. reset nunca cai na rota de e-mail mesmo que pareça texto comum", () => {
  const r = route(whatsappEvents.comandoMenu, null);
  assert.notEqual(r, ROUTES.EMAIL_VALID);
  assert.notEqual(r, ROUTES.EMAIL_INVALID);
  assert.equal(r, ROUTES.RESET);
});

test("3. e-mail válido -> EMAIL_VALID mesmo com sessão ativa (nunca cai em continuation)", () => {
  assert.equal(route(whatsappEvents.textoComArrobaDuranteSessao, sessionFixtures.sessaoAtiva), ROUTES.EMAIL_VALID);
});

test("3. e-mail válido sem sessão nenhuma -> EMAIL_VALID", () => {
  assert.equal(route(whatsappEvents.emailValidoAssinaturaAtiva, null), ROUTES.EMAIL_VALID);
});

test("4. e-mail com @ mas inválido -> EMAIL_INVALID", () => {
  assert.equal(route(whatsappEvents.emailInvalidoTesteArroba, null), ROUTES.EMAIL_INVALID);
});

test("5. continuação: sessão ativa, texto sem @, não é reset -> CONTINUATION", () => {
  assert.equal(route(whatsappEvents.sessaoAtivaMensagem6, sessionFixtures.sessaoAtiva), ROUTES.CONTINUATION);
  assert.equal(route(whatsappEvents.sessaoAtivaMensagem24, sessionFixtures.sessaoAtiva), ROUTES.CONTINUATION);
});

test("5. idade fora do range (5 ou 25) ainda é CONTINUATION — validação é do Typebot", () => {
  assert.equal(route(whatsappEvents.idade5, sessionFixtures.sessaoAtiva), ROUTES.CONTINUATION);
  assert.equal(route(whatsappEvents.idade25, sessionFixtures.sessaoAtiva), ROUTES.CONTINUATION);
});

test("6. session_id vazio -> FALLBACK_EXPIRED_OR_INVALID (nunca CONTINUATION)", () => {
  assert.equal(route(whatsappEvents.sessaoAtivaMensagem6, sessionFixtures.sessionIdVazio), ROUTES.FALLBACK_EXPIRED_OR_INVALID);
});

test("6. session_id null -> FALLBACK_EXPIRED_OR_INVALID (nunca CONTINUATION)", () => {
  assert.equal(route(whatsappEvents.sessaoAtivaMensagem6, sessionFixtures.sessionIdNull), ROUTES.FALLBACK_EXPIRED_OR_INVALID);
});

test("6. sessão com mais de 24h -> FALLBACK_EXPIRED_OR_INVALID", () => {
  assert.equal(route(whatsappEvents.sessaoAtivaMensagem6, sessionFixtures.sessaoExpirada), ROUTES.FALLBACK_EXPIRED_OR_INVALID);
});

test("6. fallback expirado expõe hasEmail para decidir se reinicia Typebot ou pede e-mail", () => {
  const decision = decideRoute(
    normalizeEvent(whatsappEvents.sessaoAtivaMensagem6),
    sessionFixtures.sessaoExpirada,
    { now: NOW },
  );
  assert.equal(decision.hasEmail, true);
});

test("7. sem sessão nenhuma, texto comum -> INITIAL_NO_SESSION", () => {
  assert.equal(route(whatsappEvents.oiSemSessao, null), ROUTES.INITIAL_NO_SESSION);
});

test("duplicado: last_message_id igual ao messageId recebido -> DUPLICATE", () => {
  const session = { ...sessionFixtures.sessaoAtiva, last_message_id: whatsappEvents.sessaoAtivaMensagem6.messageId };
  assert.equal(route(whatsappEvents.sessaoAtivaMensagem6, session), ROUTES.DUPLICATE);
});

test("isSessionActive: exatamente no limite de 24h é considerada expirada", () => {
  const boundary = { session_id: "s1", status: "active", updated_at: new Date(NOW.getTime() - 24 * 60 * 60 * 1000) };
  assert.equal(isSessionActive(boundary, NOW, 24), false);
});

test("isSessionActive: status diferente de active nunca conta como ativa", () => {
  const ended = { session_id: "s1", status: "ended", updated_at: NOW };
  assert.equal(isSessionActive(ended, NOW, 24), false);
});
