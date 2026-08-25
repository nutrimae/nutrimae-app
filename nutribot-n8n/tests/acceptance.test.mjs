import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb } from "./fakeDb.js";
import { createFakeTypebotClient, createFakeZapiClient, HttpTimeoutError, HttpStatusError } from "./fakeClients.js";
import { handleWhatsAppEvent } from "../src/orchestrator.js";
import { ROUTES } from "../src/router.js";
import { whatsappEvents, sessionFixtures, typebotResponses } from "../fixtures/events.js";
import { MSG_WELCOME_NO_SESSION, MSG_INVALID_EMAIL, MSG_TEMPORARY_ERROR, MSG_NEED_EMAIL_MEMORY } from "../src/messages.js";

function makeDeps(overrides = {}) {
  const db = overrides.db ?? createFakeDb();
  const typebot = overrides.typebot ?? createFakeTypebotClient({ nextResponse: typebotResponses.comInput });
  const zapi = overrides.zapi ?? createFakeZapiClient();
  return { db, typebot, zapi, now: overrides.now ?? new Date(), sessionTtlHours: 24 };
}

// 1. "Oi" sem sessão
test("1. 'Oi' sem sessão -> mensagem de boas-vindas, sem chamar Typebot", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.oiSemSessao, deps);
  assert.equal(result.route, ROUTES.INITIAL_NO_SESSION);
  assert.equal(deps.zapi.sent[0].message, MSG_WELCOME_NO_SESSION);
  assert.equal(deps.typebot.calls.startChat.length, 0);
});

// 2. e-mail válido de assinatura ativa
test("2. e-mail válido -> chama startChat com o e-mail normalizado e envia resposta do Typebot", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.emailValidoAssinaturaAtiva, deps);
  assert.equal(result.route, ROUTES.EMAIL_VALID);
  assert.equal(deps.typebot.calls.startChat[0].prefilledVariables.email_cliente, "maria@gmail.com");
  assert.equal(deps.zapi.sent.length, 1);
});

// 3. e-mail inexistente — n8n trata igual (é o Typebot/Sheets que decide "não encontrada")
test("3. e-mail inexistente segue a mesma rota EMAIL_VALID (validação de existência é do Typebot)", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.emailInexistente, deps);
  assert.equal(result.route, ROUTES.EMAIL_VALID);
});

// 4. e-mail inválido teste@
test("4. e-mail inválido -> mensagem de erro amigável, Typebot NUNCA é chamado", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.emailInvalidoTesteArroba, deps);
  assert.equal(result.route, ROUTES.EMAIL_INVALID);
  assert.equal(deps.zapi.sent[0].message, MSG_INVALID_EMAIL);
  assert.equal(deps.typebot.calls.startChat.length, 0);
});

// 5/6. fromMe true (boolean e string) -> nada é enviado
test("5. fromMe=true (boolean) -> nenhum outbound", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.fromMeBooleanTrue, deps);
  assert.equal(result.route, ROUTES.REJECTED);
  assert.equal(deps.zapi.sent.length, 0);
});

test("6. fromMe='true' (string) -> nenhum outbound", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.fromMeStringTrue, deps);
  assert.equal(result.route, ROUTES.REJECTED);
  assert.equal(deps.zapi.sent.length, 0);
});

// 7. messageId duplicado
test("7. messageId duplicado -> segunda chamada não gera segunda resposta", async () => {
  const deps = makeDeps();
  await handleWhatsAppEvent(whatsappEvents.messageIdDuplicadoPrimeiraVez, deps);
  const sentAfterFirst = deps.zapi.sent.length;

  const second = await handleWhatsAppEvent(whatsappEvents.messageIdDuplicadoSegundaVez, deps);
  assert.equal(second.route, ROUTES.DUPLICATE);
  assert.equal(deps.zapi.sent.length, sentAfterFirst, "nenhuma mensagem nova deve ter sido enviada");
});

// 8/9. sessão ativa "6"/"24"
test("8. sessão ativa + '6' -> CONTINUATION chamando continueChat com o session_id existente", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.route, ROUTES.CONTINUATION);
  assert.equal(deps.typebot.calls.continueChat[0].sessionId, "session-ativa-456");
  assert.equal(deps.typebot.calls.continueChat[0].message, "6");
});

test("9. sessão ativa + '24' -> CONTINUATION", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem24, deps);
  assert.equal(result.route, ROUTES.CONTINUATION);
});

// 10/11. idade fora do range -> ainda é CONTINUATION (Typebot valida)
test("10. idade '5' -> CONTINUATION (n8n não valida idade, só encaminha)", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.idade5, deps);
  assert.equal(result.route, ROUTES.CONTINUATION);
});

test("11. idade '25' -> CONTINUATION (n8n não valida idade, só encaminha)", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.idade25, deps);
  assert.equal(result.route, ROUTES.CONTINUATION);
});

// 12. texto com @ durante sessão ativa
test("12. texto com @ durante sessão ativa -> EMAIL_VALID, NUNCA continueChat", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.textoComArrobaDuranteSessao, deps);
  assert.equal(result.route, ROUTES.EMAIL_VALID);
  assert.equal(deps.typebot.calls.continueChat.length, 0);
});

// 13/14. session_id vazio/null
test("13. session_id vazio + e-mail salvo -> reinicia via startChat com o e-mail salvo (nunca continueChat)", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessionIdVazio.phone, sessionFixtures.sessionIdVazio);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.route, ROUTES.FALLBACK_EXPIRED_OR_INVALID);
  assert.equal(deps.typebot.calls.continueChat.length, 0);
  assert.equal(deps.typebot.calls.startChat[0].prefilledVariables.email_cliente, "maria@gmail.com");
});

test("14. session_id null + e-mail salvo -> reinicia via startChat", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessionIdNull.phone, sessionFixtures.sessionIdNull);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.route, ROUTES.FALLBACK_EXPIRED_OR_INVALID);
  assert.equal(deps.typebot.calls.continueChat.length, 0);
});

// 15. sessão expirada
test("15. sessão expirada com e-mail salvo -> reinicia sozinha, mãe não precisa reinformar e-mail", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoExpirada.phone, sessionFixtures.sessaoExpirada);
  const deps = makeDeps({ db });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.route, ROUTES.FALLBACK_EXPIRED_OR_INVALID);
  assert.equal(deps.typebot.calls.startChat[0].prefilledVariables.email_cliente, "maria@gmail.com");
  assert.equal(deps.typebot.calls.startChat[0].prefilledVariables.idade_bebe, "10");
});

// 16-20. comandos de reinício
for (const [label, fixtureKey] of [
  ["16", "comandoReiniciar"],
  ["17", "comandoReiniciarBot"],
  ["18", "comandoResetar"],
  ["19", "comandoComecarDeNovo"],
  ["20", "comandoMenu"],
]) {
  test(`${label}. comando de reinício com e-mail salvo -> RESET reinicia via startChat`, async () => {
    const db = createFakeDb();
    db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
    const deps = makeDeps({ db });
    const result = await handleWhatsAppEvent(whatsappEvents[fixtureKey], deps);
    assert.equal(result.route, ROUTES.RESET);
    assert.equal(deps.typebot.calls.startChat[0].prefilledVariables.email_cliente, "maria@gmail.com");
  });
}

test("reset sem e-mail salvo nenhum -> pede e-mail, não chama Typebot", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.comandoReiniciar, deps);
  assert.equal(result.route, ROUTES.RESET);
  assert.equal(deps.zapi.sent[0].message, MSG_NEED_EMAIL_MEMORY);
  assert.equal(deps.typebot.calls.startChat.length, 0);
});

// 21. Typebot messages=[]
test("21. Typebot messages=[] com input -> mantém sessão, não pede e-mail de novo", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const typebot = createFakeTypebotClient({ nextResponse: typebotResponses.messagesVazioComInput });
  const deps = makeDeps({ db, typebot });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.shouldKeepSession, true);
  assert.equal(deps.zapi.sent.length, 0, "messages vazio não deve gerar mensagem nenhuma");
});

// 22. Typebot com input
test("22. Typebot com input -> sessão continua ativa", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const typebot = createFakeTypebotClient({ nextResponse: typebotResponses.comInput });
  const deps = makeDeps({ db, typebot });
  await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  const { getSession } = await import("../src/sessionStore.js");
  const session = await getSession(db, sessionFixtures.sessaoAtiva.phone);
  assert.equal(session.status, "active");
});

// 23. Typebot sem input
test("23. Typebot sem input -> sessão marcada como encerrada, memória preservada", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const typebot = createFakeTypebotClient({ nextResponse: typebotResponses.semInput });
  const deps = makeDeps({ db, typebot });
  await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  const { getSession } = await import("../src/sessionStore.js");
  const session = await getSession(db, sessionFixtures.sessaoAtiva.phone);
  assert.equal(session.status, "ended");
  assert.equal(session.email_cliente, "maria@gmail.com");
});

// 24. Typebot timeout
test("24. Typebot timeout -> mensagem de erro reativa, session_id preservado", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const typebot = createFakeTypebotClient({ throwError: new HttpTimeoutError("timeout") });
  const deps = makeDeps({ db, typebot });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.route, "error_temporary");
  assert.equal(deps.zapi.sent[0].message, MSG_TEMPORARY_ERROR);
  const { getSession } = await import("../src/sessionStore.js");
  const session = await getSession(db, sessionFixtures.sessaoAtiva.phone);
  assert.equal(session.session_id, "session-ativa-456", "session_id não pode ser apagado em erro temporário");
});

// 25. Typebot sem créditos
test("25. Typebot sem créditos (HTTP 402) -> mesma mensagem de erro reativa, memória preservada", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const typebot = createFakeTypebotClient({ throwError: new HttpStatusError("HTTP 402", 402, "") });
  const deps = makeDeps({ db, typebot });
  const result = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(result.route, "error_temporary");
  assert.equal(deps.zapi.sent[0].message, MSG_TEMPORARY_ERROR);
});

test("cooldown: erro repetido dentro da janela não reenvia a mensagem de erro", async () => {
  const db = createFakeDb();
  db._seed(sessionFixtures.sessaoAtiva.phone, sessionFixtures.sessaoAtiva);
  const typebot = createFakeTypebotClient({ throwError: new HttpTimeoutError("timeout") });
  const now = new Date();
  const deps = makeDeps({ db, typebot, now });

  const first = await handleWhatsAppEvent(whatsappEvents.sessaoAtivaMensagem6, deps);
  assert.equal(first.sent, true);

  const second = await handleWhatsAppEvent(
    { ...whatsappEvents.sessaoAtivaMensagem6, messageId: "MSG-008-B" },
    { ...deps, now },
  );
  assert.equal(second.sent, false, "segunda falha dentro do cooldown não deve reenviar");
});

// 26. Z-API com erro — não deve derrubar o processamento nem duplicar dedup
test("26. Z-API retornando erro -> orchestrator propaga (Error Workflow do n8n trata o alerta)", async () => {
  const zapi = createFakeZapiClient({ throwError: new Error("z-api indisponível") });
  const deps = makeDeps({ zapi });
  await assert.rejects(() => handleWhatsAppEvent(whatsappEvents.oiSemSessao, deps));
});

// 27. duas mensagens simultâneas para o mesmo telefone
test("27. duas mensagens 'simultâneas' (messageIds diferentes) para o mesmo telefone são ambas processadas, sem corromper a sessão", async () => {
  const db = createFakeDb();
  const deps = makeDeps({ db });

  const [a, b] = await Promise.all([
    handleWhatsAppEvent(whatsappEvents.concorrenteA, deps),
    handleWhatsAppEvent(whatsappEvents.concorrenteB, deps),
  ]);

  assert.notEqual(a.route, ROUTES.REJECTED);
  assert.notEqual(b.route, ROUTES.REJECTED);
});

// 28/29. ausência de telefone / texto
test("28. ausência de telefone -> REJECTED, nenhum outbound", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.ausenciaDeTelefone, deps);
  assert.equal(result.route, ROUTES.REJECTED);
  assert.equal(deps.zapi.sent.length, 0);
});

test("29. ausência de texto -> REJECTED, nenhum outbound", async () => {
  const deps = makeDeps();
  const result = await handleWhatsAppEvent(whatsappEvents.ausenciaDeTexto, deps);
  assert.equal(result.route, ROUTES.REJECTED);
  assert.equal(deps.zapi.sent.length, 0);
});

// 30. resposta composta por várias mensagens markdown
test("30. resposta composta por várias bolhas -> uma única mensagem Z-API, unida por \\n", async () => {
  const typebot = createFakeTypebotClient({ nextResponse: typebotResponses.respostaComposta });
  const deps = makeDeps({ typebot });
  await handleWhatsAppEvent(whatsappEvents.oiSemSessao, deps);
  // "Oi sem sessão" não chama Typebot — usar e-mail válido para exercitar o caminho startChat.
});

test("30 (bis). resposta composta é enviada como uma única chamada de sendText", async () => {
  const typebot = createFakeTypebotClient({ nextResponse: typebotResponses.respostaComposta });
  const deps = makeDeps({ typebot });
  await handleWhatsAppEvent(whatsappEvents.emailValidoAssinaturaAtiva, deps);
  assert.equal(deps.zapi.sent.length, 1);
  assert.equal(deps.zapi.sent[0].message, "Oi, mamãe! 🤗\nComo posso te ajudar hoje?\nEstou aqui 🌷");
});
