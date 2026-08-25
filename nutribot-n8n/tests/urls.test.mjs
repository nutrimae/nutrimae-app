import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStartChatUrl, buildContinueChatUrl } from "../src/urls.js";

test("buildStartChatUrl monta a URL esperada", () => {
  assert.equal(
    buildStartChatUrl("https://typebot.io", "my-typebot-1slh1qn"),
    "https://typebot.io/api/v1/typebots/my-typebot-1slh1qn/startChat",
  );
});

test("buildContinueChatUrl monta a URL esperada", () => {
  assert.equal(
    buildContinueChatUrl("https://typebot.io", "abc123"),
    "https://typebot.io/api/v1/sessions/abc123/continueChat",
  );
});

test("13. session_id vazio bloqueia a URL de continueChat (nunca gera /sessions//continueChat)", () => {
  assert.throws(() => buildContinueChatUrl("https://typebot.io", ""));
});

test("14. session_id null bloqueia a URL de continueChat", () => {
  assert.throws(() => buildContinueChatUrl("https://typebot.io", null));
});

test("session_id só com espaços também é bloqueado", () => {
  assert.throws(() => buildContinueChatUrl("https://typebot.io", "   "));
});

test("baseUrl com barra final não gera barra dupla", () => {
  assert.equal(
    buildContinueChatUrl("https://typebot.io/", "abc123"),
    "https://typebot.io/api/v1/sessions/abc123/continueChat",
  );
});
