import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeEvent, stripAccents } from "../src/normalize.js";
import { whatsappEvents, evolutionWebhookEvents } from "../fixtures/events.js";

test("normaliza phone/text/messageId e aceita fromMe boolean", () => {
  const e = normalizeEvent(whatsappEvents.oiSemSessao);
  assert.equal(e.phone, "553182686499");
  assert.equal(e.text, "Oi");
  assert.equal(e.textLower, "oi");
  assert.equal(e.fromMe, false);
  assert.equal(e.messageId, "MSG-001");
});

test("aceita fromMe como boolean true", () => {
  const e = normalizeEvent(whatsappEvents.fromMeBooleanTrue);
  assert.equal(e.fromMe, true);
});

test("aceita fromMe como string 'true'", () => {
  const e = normalizeEvent(whatsappEvents.fromMeStringTrue);
  assert.equal(e.fromMe, true);
});

test("e-mail válido: containsAt=true, isValidEmail=true, isInvalidEmail=false", () => {
  const e = normalizeEvent(whatsappEvents.emailValidoAssinaturaAtiva);
  assert.equal(e.containsAt, true);
  assert.equal(e.isValidEmail, true);
  assert.equal(e.isInvalidEmail, false);
  assert.equal(e.normalizedEmail, "maria@gmail.com");
});

test("e-mail 'teste@' é inválido mas contém @", () => {
  const e = normalizeEvent(whatsappEvents.emailInvalidoTesteArroba);
  assert.equal(e.containsAt, true);
  assert.equal(e.isValidEmail, false);
  assert.equal(e.isInvalidEmail, true);
  assert.equal(e.normalizedEmail, null);
});

test("comandos de reinício são reconhecidos com trim+lowercase", () => {
  assert.equal(normalizeEvent(whatsappEvents.comandoReiniciar).isReset, true);
  assert.equal(normalizeEvent(whatsappEvents.comandoReiniciarBot).isReset, true);
  assert.equal(normalizeEvent(whatsappEvents.comandoResetar).isReset, true);
  assert.equal(normalizeEvent(whatsappEvents.comandoComecarDeNovo).isReset, true);
  assert.equal(normalizeEvent(whatsappEvents.comandoMenu).isReset, true);
});

test("comando de reinício sem acento também é reconhecido", () => {
  const e = normalizeEvent({ ...whatsappEvents.comandoComecarDeNovo, text: { message: "comecar de novo" } });
  assert.equal(e.isReset, true);
});

test("mensagem comum não é confundida com comando de reinício", () => {
  const e = normalizeEvent(whatsappEvents.oiSemSessao);
  assert.equal(e.isReset, false);
});

test("ausência de telefone vira phone=''", () => {
  const e = normalizeEvent(whatsappEvents.ausenciaDeTelefone);
  assert.equal(e.phone, "");
});

test("ausência de texto vira text=''", () => {
  const e = normalizeEvent(whatsappEvents.ausenciaDeTexto);
  assert.equal(e.text, "");
});

test("payload REAL da Evolution API (embrulhado pelo node Webhook): texto simples", () => {
  const e = normalizeEvent(evolutionWebhookEvents.textoSimples);
  assert.equal(e.phone, "553182686499", "remoteJid precisa perder o sufixo @s.whatsapp.net");
  assert.equal(e.text, "Oi");
  assert.equal(e.messageId, "3EB06008D33CBB1626441B");
  assert.equal(e.senderName, "Victor");
  assert.equal(e.fromMe, false);
});

test("payload REAL da Evolution API: extendedTextMessage (ex.: e-mail colado)", () => {
  const e = normalizeEvent(evolutionWebhookEvents.textoEstendido);
  assert.equal(e.text, "maria@gmail.com");
  assert.equal(e.isValidEmail, true);
});

test("payload REAL da Evolution API: fromMe=true (a própria NutriBot) é rejeitado", () => {
  const e = normalizeEvent(evolutionWebhookEvents.fromMeTrue);
  assert.equal(e.fromMe, true);
});

test("stripAccents remove diacríticos preservando o resto", () => {
  assert.equal(stripAccents("começar de novo"), "comecar de novo");
  assert.equal(stripAccents("já é assim"), "ja e assim");
});
