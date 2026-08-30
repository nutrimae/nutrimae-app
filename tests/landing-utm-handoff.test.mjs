// Regressão crítica de atribuição: a landing (nutrimae.app) e o app
// (app.nutrimae.app) são domínios DIFERENTES. localStorage não é
// compartilhado entre eles, e src/lib/tracking/client.ts só captura
// utm_source/utm_campaign/fbclid/etc. lendo window.location.search da
// própria página onde roda — ou seja, do CHECKOUT, não da landing.
//
// Sem repassar a query string da landing pro checkout, TODA venda vinda do
// funil padrão (anúncio -> landing -> checkout) perderia a atribuição de
// campanha, caindo em "não atribuído" no painel de tracking — inutilizando
// o ROAS/CPA por campanha bem no dia do lançamento.
//
// Teste estático (lê o código-fonte como texto) — mesmo padrão dos outros
// testes de segurança do projeto, porque landing-nutrimae é JS vanilla sem
// framework de teste de DOM instalado.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "landing-nutrimae");
const src = readFileSync(path.join(root, "script.js"), "utf8");
const minified = readFileSync(path.join(root, "script.min.js"), "utf8");

test("landing: goToCheckout repassa window.location.search pra URL do app", () => {
  const fnMatch = src.match(/function goToCheckout\(\) \{[\s\S]*?\n  \}/);
  assert.ok(fnMatch, "função goToCheckout não encontrada em script.js");
  assert.match(fnMatch[0], /APP_URL \+ '\/checkout\/nutrimae-' \+ selectedPlan \+ window\.location\.search/);
});

test("landing: a correção está presente no script.min.js publicado (não só no source)", () => {
  // index.html carrega script.min.js, não script.js — checa o arquivo real servido.
  assert.match(minified, /\/checkout\/nutrimae-["']?\s*\+\s*\w+\s*\+\s*window\.location\.search/);
});

test("landing: index.html referencia script.min.js (garante que o teste acima cobre o arquivo certo)", () => {
  const html = readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /<script src="script\.min\.js">/);
});
