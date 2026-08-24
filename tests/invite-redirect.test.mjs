import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("convite via admin.inviteUserByEmail manda direto pro /auth/set-password, nunca pelo /auth/callback", async () => {
  const findOrCreateUser = await read("src/lib/webhooks/find-or-create-user.ts");
  assert.match(findOrCreateUser, /redirectTo:\s*`\$\{appUrl\}\/auth\/set-password`/);
  assert.doesNotMatch(findOrCreateUser, /redirectTo:\s*`\$\{appUrl\}\/auth\/callback/);
});

test("/auth/callback continua servindo o login por link mágico (fluxo PKCE, ?code=)", async () => {
  const callback = await read("src/app/auth/callback/route.ts");
  assert.match(callback, /searchParams\.get\("code"\)/);
  const login = await read("src/app/login/page.tsx");
  assert.match(login, /emailRedirectTo:\s*`\$\{window\.location\.origin\}\/auth\/callback`/);
});
