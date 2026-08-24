import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("cancelamento de assinatura exige sessão e confere que a assinatura é da própria usuária", async () => {
  const route = await read("src/app/api/account/subscription/cancel/route.ts");
  assert.match(route, /auth\.getUser\(\)/);
  assert.match(route, /if \(!user\)/);
  assert.match(route, /ownerUserId !== user\.id/);
});

test("cancelamento nunca escreve status direto no banco — só chama a Pagar.me, webhook é quem revoga", async () => {
  const route = await read("src/app/api/account/subscription/cancel/route.ts");
  assert.doesNotMatch(route, /\.update\(/);
  assert.match(route, /provider\.cancelSubscription/);
});

test("perfil só mostra botão de cancelar pra quem tem assinatura recorrente ativa, com confirmação antes de cancelar", async () => {
  const perfil = await read("src/app/app/perfil/page.tsx");
  assert.match(perfil, /in\(\"status\", \[\"active\", \"past_due\"\]\)/);
  assert.match(perfil, /confirmingCancel/);
  assert.match(perfil, /Cancelar mesmo\?/);
});
