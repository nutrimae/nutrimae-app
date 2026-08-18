// Guarda estrutural da Regra 1 (PLANO.md): o Manual S.O.S. tem que continuar
// gratuito, público e sem login. Este teste falha se qualquer arquivo sob
// src/app/sos/** voltar a depender de paywall, oferta ou contexto autenticado,
// ou se a rota sumir do allowlist público do middleware.
//
// É um teste estático (lê o código-fonte como texto), não um teste de
// renderização — o projeto não tem framework de testes de componente
// instalado, e checar isso por texto já cobre o objetivo: impedir que
// alguém reintroduza o gate por acidente num PR futuro.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function readAll(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readAll(full));
    else out.push(full);
  }
  return out;
}

const FORBIDDEN_PATTERNS = [
  { pattern: /@\/components\/upgrade-screen/, label: "import de UpgradeScreen (tela de oferta/paywall)" },
  { pattern: /@\/lib\/products/, label: "import de PRODUCTS (dados de oferta/preço)" },
  { pattern: /redirect\(\s*["'`]\/login["'`]\s*\)/, label: "redirect(\"/login\") (login-gate)" },
  { pattern: /useActiveBaby/, label: "useActiveBaby() (exige ActiveBabyProvider, só disponível para usuárias logadas)" },
  { pattern: /checkoutUrl|priceNote|regularPrice|bundled\.map/, label: "referência a preço/checkout/oferta" },
];

test("rota /app/(paid)/sos não existe mais — S.O.S. saiu do grupo pago", () => {
  const legacyPath = path.join(ROOT, "src", "app", "app", "(paid)", "sos", "page.tsx");
  assert.equal(fs.existsSync(legacyPath), false, `${legacyPath} ainda existe — S.O.S. voltou para o grupo pago`);
});

test("rota pública /sos existe", () => {
  const publicPath = path.join(ROOT, "src", "app", "sos", "page.tsx");
  assert.equal(fs.existsSync(publicPath), true, "src/app/sos/page.tsx não encontrado");
});

test("nenhum arquivo sob src/app/sos/** referencia paywall, oferta ou contexto autenticado", () => {
  const dir = path.join(ROOT, "src", "app", "sos");
  const files = readAll(dir).filter((f) => /\.(tsx|ts)$/.test(f));
  assert.ok(files.length > 0, "nenhum arquivo .tsx/.ts encontrado em src/app/sos");

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const { pattern, label } of FORBIDDEN_PATTERNS) {
      assert.equal(
        pattern.test(content),
        false,
        `${path.relative(ROOT, file)} contém ${label} — proibido em /sos`,
      );
    }
  }
});

test("middleware libera /sos sem exigir login", () => {
  const middlewarePath = path.join(ROOT, "src", "lib", "supabase", "middleware.ts");
  const content = fs.readFileSync(middlewarePath, "utf8");
  const match = content.match(/const PUBLIC_PATHS = \[([\s\S]*?)\];/);
  assert.ok(match, "PUBLIC_PATHS não encontrado em middleware.ts");
  assert.match(match[1], /["'`]\/sos["'`]/, "\"/sos\" não está em PUBLIC_PATHS");
});

test("products.ts não lista o Manual S.O.S. como bônus/oferta paga", () => {
  const productsPath = path.join(ROOT, "src", "lib", "products.ts");
  const content = fs.readFileSync(productsPath, "utf8");
  assert.doesNotMatch(content, /label:\s*["'`]Manual S\.O\.S\.["'`]/, "S.O.S. ainda aparece como item bundled em products.ts");
});
