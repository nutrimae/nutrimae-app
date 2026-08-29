// Guarda o fix de performance do checkout: /checkout, /upsell, /downsell
// (e as demais rotas públicas que nunca consultam `user`) precisam sair do
// middleware ANTES de chamar supabase.auth.getUser() — essa chamada é uma
// volta de rede inteira até o Auth do Supabase, desperdiçada em toda rota
// cuja lógica nunca usa o resultado. "/login" é a única rota pública que
// realmente precisa de `user` (pra redirecionar quem já tem acesso).
//
// Teste estático (lê o código-fonte como texto) — mesmo padrão de
// tests/sos-public.test.mjs — porque o projeto não tem loader de TS pro
// test runner nativo do Node.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const middlewarePath = path.join(__dirname, "..", "src", "lib", "supabase", "middleware.ts");
const src = readFileSync(middlewarePath, "utf8");

test("middleware: rotas públicas (exceto /login) retornam antes de criar o client do Supabase", () => {
  const apiGuardIdx = src.indexOf('pathname.startsWith("/api/")');
  const fastPathIdx = src.indexOf('isPublicPath(pathname) && pathname !== "/login"');
  const createClientIdx = src.indexOf("createServerClient(");
  const getUserIdx = src.indexOf("await supabase.auth.getUser()");

  assert.ok(apiGuardIdx > -1, "guarda de /api/ não encontrada");
  assert.ok(fastPathIdx > -1, "fast-path pra rotas públicas não encontrado");
  assert.ok(createClientIdx > -1, "createServerClient não encontrado");
  assert.ok(getUserIdx > -1, "supabase.auth.getUser() não encontrado");

  // Ordem no arquivo == ordem de execução (early returns sequenciais).
  assert.ok(apiGuardIdx < fastPathIdx, "guarda de /api/ deveria vir antes do fast-path público");
  assert.ok(fastPathIdx < createClientIdx, "fast-path público deveria vir antes de criar o client do Supabase");
  assert.ok(createClientIdx < getUserIdx, "createServerClient deveria vir antes de getUser()");
});

test("middleware: /checkout, /upsell e /downsell continuam em PUBLIC_PATHS", () => {
  const match = src.match(/const PUBLIC_PATHS = \[([\s\S]*?)\];/);
  assert.ok(match, "PUBLIC_PATHS não encontrado em middleware.ts");
  for (const p of ["/checkout", "/upsell", "/downsell"]) {
    assert.match(match[1], new RegExp(`["'\`]${p}["'\`]`), `"${p}" não está em PUBLIC_PATHS`);
  }
});

test("middleware: /login não entra no fast-path (continua exigindo checagem de user)", () => {
  // A condição do fast-path exclui "/login" explicitamente — isPublicPath("/login")
  // é true, mas ele precisa do `user` pra redirecionar quem já tem acesso comprado.
  assert.match(src, /isPublicPath\(pathname\)\s*&&\s*pathname\s*!==\s*["'`]\/login["'`]/);
});

test("middleware: lógica de user/hasPurchasedAccess não é acionada por nenhuma rota do fast-path", () => {
  // Nenhuma das rotas que passam pelo fast-path aparece em requiresPurchasedAccess.
  const fastPathRoutes = ["/checkout", "/upsell", "/downsell", "/manifest.json", "/sos", "/manual-sos", "/oferta", "/politica-privacidade", "/acesso-pendente"];
  const requiresMatch = src.match(/function requiresPurchasedAccess\(pathname: string\) \{([\s\S]*?)\}/);
  assert.ok(requiresMatch, "requiresPurchasedAccess não encontrada");
  for (const route of fastPathRoutes) {
    assert.doesNotMatch(
      requiresMatch[1],
      new RegExp(`["'\`]${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      `${route} não deveria aparecer em requiresPurchasedAccess (senão o fast-path quebraria essa checagem)`,
    );
  }
});
