import { test } from "node:test";
import assert from "node:assert/strict";
import { createZapiClient } from "../src/zapiClient.js";

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

test("sendText usa o telefone do evento, nunca um valor fixo", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return jsonResponse({ zaapId: "1" });
  };

  const client = createZapiClient({
    fetchImpl,
    instanceId: "INST",
    instanceToken: "TOKEN",
    clientToken: "CLIENT",
  });

  await client.sendText({ to: "553182686499", message: "Oi mamãe" });

  assert.equal(calls[0].url, "https://api.z-api.io/instances/INST/token/TOKEN/send-text");
  assert.equal(calls[0].init.headers["Client-Token"], "CLIENT");
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.phone, "553182686499");
  assert.equal(body.message, "Oi mamãe");
});

test("sendText rejeita telefone ausente sem tentar rede", async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    return jsonResponse({});
  };
  const client = createZapiClient({ fetchImpl, instanceId: "i", instanceToken: "t", clientToken: "c" });

  await assert.rejects(() => client.sendText({ to: "", message: "oi" }));
  assert.equal(called, false);
});

test("26. Z-API retornando erro HTTP propaga o erro para quem chamou", async () => {
  const fetchImpl = async () => jsonResponse({ error: "instance_disconnected" }, 500);
  const client = createZapiClient({
    fetchImpl,
    instanceId: "i",
    instanceToken: "t",
    clientToken: "c",
    maxAttempts: 1,
  });

  await assert.rejects(() => client.sendText({ to: "553182686499", message: "oi" }));
});
