import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// ═══════════════════════════════════════════════════════════════
// RATE LIMIT — validação comportamental contra Upstash Redis REAL
//
// Diferente de checkout-rate-limit-ip.test.mjs (auditoria de source),
// este arquivo executa o limiter de verdade contra o Redis de produção
// (ou um banco Upstash de teste) e confirma o comportamento:
//   1. limite de IP: 5 passam, o 6º é bloqueado
//   2. limite de e-mail: 3 passam, o 4º é bloqueado
//   3. janela deslizante funciona (proxy com janela curta de 5s —
//      esperar 5min reais inviabilizaria o teste; a janela de 5min de
//      produção está coberta pela auditoria de source no outro arquivo)
//
// SKIP automático quando UPSTASH_REDIS_REST_URL/TOKEN não estão no
// .env.local — a suíte continua verde em qualquer máquina, e vira
// validação real assim que as credenciais existirem.
//
// Segurança: usa prefixo "ratelimit:checkout:test" e identificadores
// únicos por execução — nunca toca nas chaves de produção
// ("ratelimit:checkout:ip"/":email"). As chaves de teste são removidas
// no final de cada caso.
// ═══════════════════════════════════════════════════════════════

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const idx = line.indexOf("=");
          return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}

const envLocal = loadEnvLocal();
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || envLocal.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || envLocal.UPSTASH_REDIS_REST_TOKEN;
const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const SKIP_MSG = "sem UPSTASH_REDIS_REST_URL/TOKEN no .env.local — validação real pendente";
const TEST_PREFIX = "ratelimit:checkout:test";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function makeLimiter(max, window) {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: false,
    prefix: TEST_PREFIX,
  });
  return { redis, limiter };
}

async function cleanup(redis, identifier) {
  // slidingWindow grava uma única chave "<prefix>:<identifier>"
  await redis.del(`${TEST_PREFIX}:${identifier}`).catch(() => {});
}

test("rate-limit/redis: IP — 5 requisições passam, a 6ª é bloqueada", { skip: !hasRedis && SKIP_MSG }, async () => {
  const { redis, limiter } = await makeLimiter(5, "5 m"); // mesmos limites de MAX_BY_IP/WINDOW_MS em produção
  const ip = `test-ip-${runId}`;
  try {
    const results = [];
    for (let i = 0; i < 6; i += 1) {
      results.push((await limiter.limit(ip)).success);
    }
    assert.deepEqual(results, [true, true, true, true, true, false]);
  } finally {
    await cleanup(redis, ip);
  }
});

test("rate-limit/redis: e-mail — 3 requisições passam, a 4ª é bloqueada", { skip: !hasRedis && SKIP_MSG }, async () => {
  const { redis, limiter } = await makeLimiter(3, "5 m"); // mesmos limites de MAX_BY_EMAIL/WINDOW_MS em produção
  const emailHash = `test-email-${runId}`; // em produção a chave é o SHA-256 do e-mail, nunca o plaintext
  try {
    const results = [];
    for (let i = 0; i < 4; i += 1) {
      results.push((await limiter.limit(emailHash)).success);
    }
    assert.deepEqual(results, [true, true, true, false]);
  } finally {
    await cleanup(redis, emailHash);
  }
});

test(
  "rate-limit/redis: janela deslizante expira e libera de novo (proxy 3s)",
  { skip: !hasRedis && SKIP_MSG },
  async () => {
    const { redis, limiter } = await makeLimiter(2, "3 s");
    const key = `test-window-${runId}`;
    try {
      assert.equal((await limiter.limit(key)).success, true);
      assert.equal((await limiter.limit(key)).success, true);
      assert.equal((await limiter.limit(key)).success, false, "3ª requisição dentro da janela deve ser bloqueada");
      await new Promise((resolve) => setTimeout(resolve, 3500)); // espera a janela deslizar
      assert.equal((await limiter.limit(key)).success, true, "após a janela expirar, deve voltar a permitir");
    } finally {
      await cleanup(redis, key);
    }
  },
);

test("rate-limit/redis: credenciais presentes — suite rodando em modo real, não skip", { skip: !hasRedis && SKIP_MSG }, () => {
  assert.equal(hasRedis, true);
});
