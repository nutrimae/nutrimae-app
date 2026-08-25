import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("assistente nunca responde segurança alimentar sem consultar a base — regra explícita no system prompt", async () => {
  const src = await read("src/lib/nutribot/foodAssistant.ts");
  assert.match(src, /NUNCA inventa corte, idade mínima ou risco de engasgo/);
  assert.match(src, /chame a função buscar_alimento antes de responder/);
});

test("alimento não encontrado na base cai sempre no fallback fixo, nunca em resposta livre do modelo", async () => {
  const src = await read("src/lib/nutribot/foodAssistant.ts");
  assert.match(src, /FALLBACK_NOT_FOUND/);
  assert.match(src, /if \(!found\) reply = FALLBACK_NOT_FOUND;/);
});

test("alergênico conhecido é avisado ANTES de qualquer outra informação, de forma determinística (não confia só no modelo)", async () => {
  const src = await read("src/lib/nutribot/foodAssistant.ts");
  assert.match(src, /knownAllergenOverlap/);
  assert.match(src, /Atenção: \$\{found!\.name\} contém/);
});

test("pergunta fora de escopo (cobrança, bug, diagnóstico) encaminha pro fluxo normal em vez de tentar responder", async () => {
  const src = await read("src/lib/nutribot/foodAssistant.ts");
  assert.match(src, /fora_do_escopo/);
  assert.match(src, /return \{ handled: false \};/);
});

test("busca alimento sempre passa pela mesma revisão pública (searchFoods), nunca lê FOODS bruto", async () => {
  const src = await read("src/lib/nutribot/foodAssistant.ts");
  assert.match(src, /import \{ searchFoods \} from "@\/lib\/foods"/);
  assert.doesNotMatch(src, /\bFOODS\b/);
});

test("resolveBabyContext nunca inventa bebê: telefone sem conta vinculada retorna null (assistente cai pro Typebot)", async () => {
  const src = await read("src/lib/nutribot/babyContext.ts");
  assert.match(src, /if \(!profile\) return null;/);
  assert.match(src, /if \(!baby\) return null;/);
});

test("babyContext usa client admin (service role) — resolução acontece sem sessão de usuária autenticada", async () => {
  const src = await read("src/lib/nutribot/babyContext.ts");
  assert.match(src, /AdminClient/);
});

test("orchestrator tenta o assistente de alimento antes do Typebot, e só chama Typebot quando não for pergunta de comida", async () => {
  const src = await read("src/lib/nutribot/orchestrator.ts");
  assert.match(src, /resolveBabyContext\(deps\.db, event\.phone\)/);
  assert.match(src, /answerWithFoodAssistant\(babyContext, event\.text\)/);
  const foodAssistantIdx = src.indexOf("answerWithFoodAssistant(babyContext");
  const typebotIdx = src.indexOf("deps.typebot.continueChat");
  assert.ok(foodAssistantIdx > 0 && typebotIdx > 0 && foodAssistantIdx < typebotIdx, "assistente de alimento deve ser tentado antes do Typebot");
});

test("resposta do assistente de alimento preserva a sessão do Typebot (mesmo session_id) em vez de encerrar ou reiniciar", async () => {
  const src = await read("src/lib/nutribot/orchestrator.ts");
  assert.match(src, /sessionId: session\.session_id,[\s\S]{0,300}route: "food_assistant"/);
  assert.match(src, /keepSession: true,/);
});

test("toda conversa (pergunta e resposta) é logada com padrão best-effort, nunca trava o envio se falhar", async () => {
  const src = await read("src/lib/nutribot/conversationLog.ts");
  assert.match(src, /try \{/);
  assert.match(src, /catch \(err\) \{/);
  assert.match(src, /console\.error/);
});

test("checklist de alergênicos saiu do localStorage — agora é tabela do Supabase, por bebê", async () => {
  const src = await read("src/lib/allergen-checklist.ts");
  assert.doesNotMatch(src, /window\.localStorage/);
  assert.match(src, /from\("baby_allergens"\)/);
  assert.match(src, /babyId: string/);
});

test("schema tem baby_allergens e nutribot_conversation_log com RLS habilitada e cascade de exclusão", async () => {
  const schema = await read("supabase/schema.sql");
  assert.match(schema, /create table if not exists public\.baby_allergens/);
  assert.match(schema, /create table if not exists public\.nutribot_conversation_log/);
  const baby = schema.slice(schema.indexOf("public.baby_allergens"), schema.indexOf("public.baby_allergens") + 1200);
  assert.match(baby, /alter table public\.baby_allergens enable row level security/);
  assert.match(baby, /on delete cascade/);
});
