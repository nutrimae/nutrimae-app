import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("login não oferece cadastro público", async () => {
  const login = await read("src/app/login/page.tsx");
  assert.doesNotMatch(login, /auth\.signUp\s*\(/);
  assert.doesNotMatch(login, /Criar minha conta|Criar conta/);
});

test("link mágico nunca cria usuário automaticamente", async () => {
  const login = await read("src/app/login/page.tsx");
  assert.match(login, /shouldCreateUser:\s*false/);
});

test("middleware bloqueia rotas privadas sem compra ativa", async () => {
  const middleware = await read("src/lib/supabase/middleware.ts");
  assert.match(middleware, /requiresPurchasedAccess/);
  assert.match(middleware, /product_id",\s*"nutrimae_assinatura"/);
  assert.match(middleware, /status\s*===\s*"active"/);
  assert.match(middleware, /acesso-pendente/);
});

test("app e onboarding repetem a autorização no servidor", async () => {
  const appLayout = await read("src/app/app/layout.tsx");
  const onboardingLayout = await read("src/app/onboarding/layout.tsx");
  assert.match(appLayout, /hasPurchasedAppAccess/);
  assert.match(onboardingLayout, /hasPurchasedAppAccess/);
});

test("webhook do Pagar.me continua sendo a porta de criação via convite administrativo", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  assert.match(webhook, /verifyBasicAuth/);
  assert.match(webhook, /findOrCreateUser/);
  assert.match(webhook, /user_products/);

  const findOrCreateUser = await read("src/lib/webhooks/find-or-create-user.ts");
  assert.match(findOrCreateUser, /inviteUserByEmail/);
});
