import { test } from "node:test";
import assert from "node:assert/strict";
import { composeReplyText, interpretTypebotResult } from "../src/typebotResponse.js";
import { typebotResponses } from "../fixtures/events.js";

test("21. messages=[] com input presente mantém a sessão (shouldKeepSession=true)", () => {
  const r = interpretTypebotResult(typebotResponses.messagesVazioComInput);
  assert.equal(r.shouldKeepSession, true);
  assert.equal(r.hasReply, false, "não deve inventar texto quando messages está vazio");
});

test("22. Typebot com input -> shouldKeepSession=true", () => {
  const r = interpretTypebotResult(typebotResponses.comInput);
  assert.equal(r.shouldKeepSession, true);
  assert.equal(r.hasReply, true);
  assert.match(r.replyText, /idade do bebê/);
});

test("23. Typebot sem input -> conversa encerrada (shouldKeepSession=false)", () => {
  const r = interpretTypebotResult(typebotResponses.semInput);
  assert.equal(r.shouldKeepSession, false);
  assert.equal(r.hasReply, true);
});

test("30. mensagens vazias são descartadas, o resto é unido com \\n, richText é achatado", () => {
  const text = composeReplyText(typebotResponses.respostaComposta.messages);
  assert.equal(text, "Oi, mamãe! 🤗\nComo posso te ajudar hoje?\nEstou aqui 🌷");
});

test("mensagens type != 'text' são ignoradas", () => {
  const text = composeReplyText([
    { type: "image", content: { url: "https://x/y.png" } },
    { type: "text", content: { markdown: "Só isto conta" } },
  ]);
  assert.equal(text, "Só isto conta");
});

test("interpretTypebotResult nunca deriva shouldKeepSession do tamanho de messages", () => {
  const semInputSemMessages = interpretTypebotResult({ sessionId: "s1", messages: [], input: undefined });
  assert.equal(semInputSemMessages.shouldKeepSession, false);

  const comInputSemMessages = interpretTypebotResult({ sessionId: "s1", messages: [], input: { type: "text input" } });
  assert.equal(comInputSemMessages.shouldKeepSession, true);
});
