// Regressão de segurança: /api/tts/:contentType/:contentId era um "oráculo"
// de texto-pra-fala aberto pro tipo "sos" (a única superfície sem login) —
// qualquer contentId inventado forçava cache miss e disparava uma chamada
// paga ao Google Cloud TTS, sem rate limit, sem validar o texto, e sem
// checar path traversal no nome do arquivo salvo no Storage. Um bot podia
// gerar áudio ilimitado às custas da conta do Google Cloud do projeto.
//
// Teste estático (lê o código-fonte como texto) — mesmo padrão dos outros
// testes de segurança do projeto — porque o projeto não tem framework de
// teste de rota/componente instalado.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routeSrc = readFileSync(
  path.join(__dirname, "..", "src", "app", "api", "tts", "[contentType]", "[contentId]", "route.ts"),
  "utf8",
);
const rateLimitSrc = readFileSync(path.join(__dirname, "..", "src", "lib", "tts", "rate-limit.ts"), "utf8");

test("tts: rate limit é checado antes de qualquer trabalho (cache/geração)", () => {
  const rateLimitIdx = routeSrc.indexOf("isTtsRateLimited(request)");
  const cacheCheckIdx = routeSrc.indexOf("tts_audio_cache");
  const synthesizeIdx = routeSrc.indexOf("synthesizeSpeech(");
  assert.ok(rateLimitIdx > -1, "isTtsRateLimited não encontrado");
  assert.ok(rateLimitIdx < cacheCheckIdx, "rate limit deveria vir antes da checagem de cache");
  assert.ok(rateLimitIdx < synthesizeIdx, "rate limit deveria vir antes de chamar synthesizeSpeech");
});

test("tts: contentType é validado contra uma allowlist fechada", () => {
  assert.match(routeSrc, /VALID_CONTENT_TYPES = new Set\(\["food", "recipe", "sos", "allergy"\]\)/);
  assert.match(routeSrc, /VALID_CONTENT_TYPES\.has\(contentType\)/);
});

test("tts: contentId é validado contra path traversal (charset seguro)", () => {
  assert.match(routeSrc, /SAFE_ID_PATTERN = \/\^\[a-z0-9-\]\+\$\//);
  assert.match(routeSrc, /SAFE_ID_PATTERN\.test\(contentId\)/);
});

test("tts: superfície pública 'sos' (sem login) exige allowlist de contentId", () => {
  assert.match(routeSrc, /SOS_ALLOWED_IDS = new Set\(/);
  assert.match(routeSrc, /isPublicSos[\s\S]{0,600}SOS_ALLOWED_IDS\.has\(contentId\)/);
});

test("tts: texto tem limite máximo de tamanho (evita payload gigante custando mais por request)", () => {
  assert.match(routeSrc, /MAX_TEXT_LENGTH = 2000/);
  assert.match(routeSrc, /text\.length > MAX_TEXT_LENGTH/);
});

test("tts: rate-limit.ts tem fallback em memória (fail-open só quando Redis não configurado, não quando falha)", () => {
  assert.match(rateLimitSrc, /checkInMemory/);
  assert.match(rateLimitSrc, /hasRedis = !!\(process\.env\.UPSTASH_REDIS_REST_URL/);
});
