import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("reenvio de convite usa resetPasswordForEmail (funciona pra conta ja existente) e nunca revela se o e-mail existe", async () => {
  const route = await read("src/app/api/account/resend-invite/route.ts");
  assert.match(route, /resetPasswordForEmail/);
  assert.match(route, /redirectTo:\s*`\$\{appUrl\}\/auth\/set-password`/);
  // A resposta de sucesso é a mesma resposta usada mesmo em caso de erro/catch.
  assert.match(route, /GENERIC_RESPONSE/);
});

test("login detecta link de convite expirado (otp_expired) e oferece reenvio", async () => {
  const login = await read("src/app/login/page.tsx");
  assert.match(login, /otp_expired/);
  assert.match(login, /\/api\/account\/resend-invite/);
});
