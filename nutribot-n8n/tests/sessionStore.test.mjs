import { test } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb } from "./fakeDb.js";
import {
  claimMessage,
  upsertSessionAfterReply,
  getSession,
  shouldNotifyError,
  markErrorNotified,
} from "../src/sessionStore.js";

test("claimMessage cria linha nova para telefone inédito", async () => {
  const db = createFakeDb();
  const result = await claimMessage(db, { phone: "5511999", messageId: "M1" });
  assert.equal(result.claimed, true);
  assert.equal(result.isNewRow, true);
  assert.equal(result.session.session_id, null);
});

test("7. mesmo messageId chegando de novo -> claimed=false (duplicate_ignored)", async () => {
  const db = createFakeDb();
  await claimMessage(db, { phone: "5511999", messageId: "M1" });
  const second = await claimMessage(db, { phone: "5511999", messageId: "M1" });
  assert.equal(second.claimed, false);
});

test("27. duas mensagens diferentes para o mesmo telefone: ambas são reivindicadas, em sequência", async () => {
  const db = createFakeDb();
  const a = await claimMessage(db, { phone: "5511999", messageId: "A" });
  const b = await claimMessage(db, { phone: "5511999", messageId: "B" });
  assert.equal(a.claimed, true);
  assert.equal(b.claimed, true);
  const finalSession = await getSession(db, "5511999");
  assert.equal(finalSession.last_message_id, "B");
});

test("email_cliente e idade_bebe não são sobrescritos por valores vazios", async () => {
  const db = createFakeDb();
  db._seed("5511999", {
    phone: "5511999",
    session_id: "s1",
    updated_at: new Date(),
    last_message_id: "M1",
    email_cliente: "maria@gmail.com",
    idade_bebe: "10",
    status: "active",
  });

  await upsertSessionAfterReply(db, {
    phone: "5511999",
    sessionId: "s2",
    lastMessageId: "M2",
    emailCliente: "", // vazio -> não deve apagar o que já existia
    idadeBebe: "",
    keepSession: true,
    route: "continuation",
  });

  const session = await getSession(db, "5511999");
  assert.equal(session.email_cliente, "maria@gmail.com");
  assert.equal(session.idade_bebe, "10");
  assert.equal(session.session_id, "s2");
});

test("Typebot sem input -> status vira 'ended' e ended_at é preenchido, memória preservada", async () => {
  const db = createFakeDb();
  await upsertSessionAfterReply(db, {
    phone: "5511999",
    sessionId: "s1",
    lastMessageId: "M1",
    emailCliente: "maria@gmail.com",
    idadeBebe: "10",
    keepSession: false,
    route: "continuation",
  });

  const session = await getSession(db, "5511999");
  assert.equal(session.status, "ended");
  assert.ok(session.ended_at);
  assert.equal(session.email_cliente, "maria@gmail.com");
  assert.equal(session.idade_bebe, "10");
});

test("shouldNotifyError respeita cooldown", () => {
  const now = new Date();
  const recent = { last_error_notified_at: new Date(now.getTime() - 60 * 1000) };
  const old = { last_error_notified_at: new Date(now.getTime() - 20 * 60 * 1000) };

  assert.equal(shouldNotifyError(recent, now, 10), false);
  assert.equal(shouldNotifyError(old, now, 10), true);
  assert.equal(shouldNotifyError(null, now, 10), true);
});

test("markErrorNotified grava o timestamp usado depois pelo cooldown", async () => {
  const db = createFakeDb();
  db._seed("5511999", { phone: "5511999", status: "active", updated_at: new Date() });
  await markErrorNotified(db, "5511999");
  const session = await getSession(db, "5511999");
  assert.ok(session.last_error_notified_at);
});
