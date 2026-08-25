/**
 * Auditoria visual local (mobile-first) do checkout do NutriMãe.
 *
 * Roda contra um servidor Next.js já em execução (não sobe o servidor
 * sozinho) e produz um relatório JSON com métricas objetivas — tempo de
 * carregamento, posição do botão de checkout na dobra, tamanho de fonte e
 * altura de alvo de toque — inspiradas nos princípios de "Design with
 * Intent" (fricção deliberada só onde ajuda a decisão, nunca por acidente).
 *
 * Uso:
 *   node autonomous-growth.js [url]
 *
 * Padrão: http://localhost:3000/checkout/nutrimae-anual
 */
/* eslint-disable @typescript-eslint/no-require-imports -- script Node solto, fora do bundle da app, roda direto com `node`. */
const { chromium, devices } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const TARGET_URL = process.argv[2] || "http://localhost:3000/checkout/nutrimae-anual";
const MIN_FONT_PX = 16;
const MIN_TOUCH_TARGET_PX = 48;

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();

  const issues = [];
  const startedAt = Date.now();
  await page.goto(TARGET_URL, { waitUntil: "load", timeout: 30_000 });
  const loadTimeMs = Date.now() - startedAt;

  const viewport = page.viewportSize();

  // Botão de finalizar compra: pega o primeiro botão/link cujo texto contém
  // "finalizar" ou "comprar" — cobre tanto o checkout quanto páginas de
  // upsell/downsell sem precisar de um seletor fixo por página.
  const checkoutButton = page
    .locator('button, a[role="button"], a')
    .filter({ hasText: /finalizar|comprar|quero (adicionar|garantir|desbloquear)/i })
    .first();

  let checkoutReport = { found: false };
  if (await checkoutButton.count()) {
    const box = await checkoutButton.boundingBox();
    const fontSize = await checkoutButton.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    if (box) {
      const visibleWithoutScroll = box.y + box.height <= viewport.height;
      const touchTargetOk = box.height >= MIN_TOUCH_TARGET_PX;
      const fontOk = fontSize >= MIN_FONT_PX;

      checkoutReport = {
        found: true,
        text: (await checkoutButton.textContent())?.trim(),
        boundingBox: box,
        visibleWithoutScroll,
        heightPx: Math.round(box.height),
        fontSizePx: Math.round(fontSize),
      };

      if (!visibleWithoutScroll) issues.push("Botão de checkout exige rolagem pra aparecer (fora da dobra em mobile).");
      if (!touchTargetOk) issues.push(`Botão de checkout tem ${Math.round(box.height)}px de altura, abaixo do mínimo de ${MIN_TOUCH_TARGET_PX}px pra zona do polegar.`);
      if (!fontOk) issues.push(`Fonte do botão de checkout é ${Math.round(fontSize)}px, abaixo do mínimo de ${MIN_FONT_PX}px.`);
    }
  } else {
    issues.push("Nenhum botão de finalizar/comprar encontrado na página.");
  }

  // Varredura geral de fonte pequena demais em texto visível.
  const smallTextCount = await page.evaluate((minFont) => {
    const all = document.querySelectorAll("body *");
    let count = 0;
    for (const el of all) {
      if (el.children.length > 0) continue; // só nós-folha, evita contar contêineres
      const text = el.textContent?.trim();
      if (!text) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size > 0 && size < minFont) count += 1;
    }
    return count;
  }, MIN_FONT_PX);
  if (smallTextCount > 0) issues.push(`${smallTextCount} elemento(s) de texto abaixo de ${MIN_FONT_PX}px encontrados na página.`);

  if (loadTimeMs > 3000) issues.push(`Carregamento levou ${loadTimeMs}ms — acima do limite recomendado de 3000ms pra 3G brasileira.`);

  const report = {
    url: TARGET_URL,
    generatedAt: new Date().toISOString(),
    device: "iPhone 13 (Playwright)",
    viewport,
    loadTimeMs,
    checkoutButton: checkoutReport,
    smallTextElementCount: smallTextCount,
    issues,
    pass: issues.length === 0,
  };

  const outPath = path.join(__dirname, "autonomous-growth-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nRelatório salvo em ${outPath}`);
  console.log(report.pass ? "\n✅ Nenhum problema encontrado." : `\n⚠️  ${issues.length} problema(s) encontrado(s).`);

  await browser.close();
  process.exit(report.pass ? 0 : 1);
}

main().catch((error) => {
  console.error("Falha na auditoria:", error.message);
  process.exit(2);
});
