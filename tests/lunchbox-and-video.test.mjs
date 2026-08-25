import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

test("Prompt B: foods.ts e recipes.ts possuem suporte a adequado_lancheira", () => {
  const foodsPath = path.join(ROOT, "src", "lib", "foods.ts");
  const recipesPath = path.join(ROOT, "src", "lib", "recipes.ts");

  const foodsContent = fs.readFileSync(foodsPath, "utf8");
  const recipesContent = fs.readFileSync(recipesPath, "utf8");

  assert.match(foodsContent, /adequado_lancheira\?:\s*boolean/, "FoodItem deve conter adequado_lancheira");
  assert.match(recipesContent, /adequado_lancheira\?:\s*boolean/, "Recipe deve conter adequado_lancheira");
  assert.match(foodsContent, /video_url\?:\s*string/, "FoodItem deve conter video_url");
  assert.match(foodsContent, /video_status\?:/, "FoodItem deve conter video_status");
});

test("Prompt B: lunchbox.ts define grupos, cálculo de equilíbrio e regras de segurança", () => {
  const lunchboxPath = path.join(ROOT, "src", "lib", "lunchbox.ts");
  assert.equal(fs.existsSync(lunchboxPath), true, "lunchbox.ts deve existir");

  const content = fs.readFileSync(lunchboxPath, "utf8");
  assert.match(content, /export type LunchboxGroup/, "deve exportar LunchboxGroup");
  assert.match(content, /calculateLunchboxBalance/, "deve exportar calculateLunchboxBalance");
  assert.match(content, /LUNCHBOX_SAFETY_GUIDELINES/, "deve exportar LUNCHBOX_SAFETY_GUIDELINES");
  assert.match(content, /getWeeklyLunchboxShoppingItems/, "deve exportar getWeeklyLunchboxShoppingItems");
});

test("Prompt B: Cardápio exibe lancheira apenas para bebês >= 24 meses", () => {
  const cardapioPath = path.join(ROOT, "src", "app", "app", "(paid)", "cardapio", "page.tsx");
  const content = fs.readFileSync(cardapioPath, "utf8");

  assert.match(content, /isPost24Months\s*=\s*months\s*>=\s*24/, "deve calcular isPost24Months com base em 24 meses");
  assert.match(content, /LunchboxPlanner/, "deve importar e renderizar LunchboxPlanner");
  assert.match(content, /isPost24Months\s*&&\s*activeTab\s*===\s*["']lancheira["']/, "deve condicionar lancheira a 24+ meses");
});

test("Prompt B: Lista de compras integra itens da lancheira", () => {
  const listaComprasPath = path.join(ROOT, "src", "app", "app", "(paid)", "lista-compras", "page.tsx");
  const content = fs.readFileSync(listaComprasPath, "utf8");

  assert.match(content, /getWeeklyLunchboxShoppingItems/, "deve importar getWeeklyLunchboxShoppingItems");
  assert.match(content, /lunchboxItems/, "deve mesclar lunchboxItems em displayGroups");
});

test("Prompt D: Infraestrutura de vídeo (Player, Modal, Admin, API e Schema)", () => {
  const playerPath = path.join(ROOT, "src", "components", "food-video-player.tsx");
  const modalPath = path.join(ROOT, "src", "components", "community-video-modal.tsx");
  const apiCommunityPath = path.join(ROOT, "src", "app", "api", "videos", "community", "route.ts");
  const apiAdminPath = path.join(ROOT, "src", "app", "api", "admin", "videos", "route.ts");
  const adminPagePath = path.join(ROOT, "src", "app", "app", "(paid)", "admin", "videos", "page.tsx");
  const adminPanelPath = path.join(ROOT, "src", "app", "app", "(paid)", "admin", "videos", "video-review-panel.tsx");
  const schemaPath = path.join(ROOT, "supabase", "schema.sql");

  assert.equal(fs.existsSync(playerPath), true, "food-video-player.tsx deve existir");
  assert.equal(fs.existsSync(modalPath), true, "community-video-modal.tsx deve existir");
  assert.equal(fs.existsSync(apiCommunityPath), true, "api/videos/community/route.ts deve existir");
  assert.equal(fs.existsSync(apiAdminPath), true, "api/admin/videos/route.ts deve existir");
  assert.equal(fs.existsSync(adminPagePath), true, "admin/videos/page.tsx deve existir");
  assert.equal(fs.existsSync(adminPanelPath), true, "admin/videos/video-review-panel.tsx deve existir");

  const modalContent = fs.readFileSync(modalPath, "utf8");
  assert.match(modalContent, /TERMO DE CESSÃO E AUTORIZAÇÃO DE USO DE IMAGEM/, "Modal deve conter texto explícito dos termos");
  assert.match(modalContent, /terms_accepted:\s*true/, "Modal deve validar terms_accepted");

  const schemaContent = fs.readFileSync(schemaPath, "utf8");
  assert.match(schemaContent, /create table if not exists public\.food_videos/, "schema.sql deve conter tabela food_videos");
  assert.match(schemaContent, /'food-videos'/, "schema.sql deve registrar bucket food-videos");
});

test("Prompt D: bucket de vídeos é privado, e remoção apaga o arquivo de verdade (não só a linha)", () => {
  const schemaPath = path.join(ROOT, "supabase", "schema.sql");
  const apiCommunityPath = path.join(ROOT, "src", "app", "api", "videos", "community", "route.ts");
  const apiAdminPath = path.join(ROOT, "src", "app", "api", "admin", "videos", "route.ts");
  const playbackRoutePath = path.join(ROOT, "src", "app", "api", "videos", "[id]", "route.ts");

  const schemaContent = fs.readFileSync(schemaPath, "utf8");
  assert.match(
    schemaContent,
    /values \('food-videos', 'food-videos', false\)/,
    "bucket food-videos precisa ser privado — um vídeo pendente de moderação não pode ter URL pública",
  );
  assert.doesNotMatch(
    schemaContent,
    /Leitura pública de vídeos de alimentos"\s*\n\s*create policy/,
    "não pode existir policy de leitura pública ativa pro bucket food-videos",
  );

  assert.equal(fs.existsSync(playbackRoutePath), true, "precisa existir uma rota que resolva URL assinada com checagem de autorização");

  const communityContent = fs.readFileSync(apiCommunityPath, "utf8");
  assert.match(
    communityContent,
    /storage\.from\("food-videos"\)\.remove\(/,
    "DELETE de /api/videos/community precisa remover o arquivo do Storage, não só a linha do banco",
  );

  const adminContent = fs.readFileSync(apiAdminPath, "utf8");
  assert.match(
    adminContent,
    /storage\.from\("food-videos"\)\.remove\(/,
    "ação 'excluir' do admin precisa remover o arquivo do Storage, não só a linha do banco",
  );
});
