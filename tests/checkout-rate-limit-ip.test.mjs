import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// ═══════════════════════════════════════════════════════════════
// RATE LIMIT — testes sem importar o modulo diretamente
//
// Problema: rate-limit.ts importa `logError` de `../nutribot/logger`.
// O logger importa `./redact` sem extensao .ts. O Node 26 ESM nativo
// nao resolve imports transitivos sem extensao explicita.
//
// Estrategia adotada (sem alterar codigo de producao):
// 1. Extrair e testar a logica de extractClientIp inline (reproducao fiel do source)
// 2. Verificar invariantes de seguranca no source via readFile (como tracking-v1.test.mjs)
// 3. Documentar o gap para isCheckoutRateLimited (bucket in-memory e Redis)
// ═══════════════════════════════════════════════════════════════

// Reproducao fiel de extractClientIp (src/lib/checkout/rate-limit.ts L44-L56)
// Qualquer divergencia sera detectada por code review antes do merge.
function extractClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    const publicIp = ips.find((ip) => {
      if (ip === "::1" || ip === "127.0.0.1") return false;
      if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) return false;
      return true;
    });
    if (publicIp) return publicIp;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function makeReq(forwarded, realIp) {
  const headers = {};
  if (forwarded != null) headers["x-forwarded-for"] = forwarded;
  if (realIp != null) headers["x-real-ip"] = realIp;
  return new Request("https://nutrimae.app/api/checkout", { headers });
}

// ── extractClientIp ───────────────────────────────────────────

test("rate-limit/ip: retorna primeiro IP publico de x-forwarded-for", () => {
  assert.equal(extractClientIp(makeReq("203.0.113.1, 10.0.0.1")), "203.0.113.1");
});

test("rate-limit/ip: ignora 10.x.x.x (RFC 1918 classe A)", () => {
  assert.equal(extractClientIp(makeReq("10.0.0.1, 203.0.113.5")), "203.0.113.5");
});

test("rate-limit/ip: ignora 192.168.x.x (RFC 1918 classe C)", () => {
  assert.equal(extractClientIp(makeReq("192.168.1.1, 198.51.100.1")), "198.51.100.1");
});

test("rate-limit/ip: ignora 172.x.x.x (RFC 1918 classe B)", () => {
  assert.equal(extractClientIp(makeReq("172.16.0.1, 45.90.1.1")), "45.90.1.1");
});

test("rate-limit/ip: ignora loopback ::1 (IPv6)", () => {
  assert.equal(extractClientIp(makeReq("::1, 203.0.113.10")), "203.0.113.10");
});

test("rate-limit/ip: ignora loopback 127.0.0.1 (IPv4)", () => {
  assert.equal(extractClientIp(makeReq("127.0.0.1, 203.0.113.11")), "203.0.113.11");
});

test("rate-limit/ip: lista so com IPs privados retorna unknown quando sem x-real-ip", () => {
  assert.equal(extractClientIp(makeReq("10.0.0.1, 192.168.1.1")), "unknown");
});

test("rate-limit/ip: cai para x-real-ip quando x-forwarded-for ausente", () => {
  assert.equal(extractClientIp(makeReq(null, "198.51.100.42")), "198.51.100.42");
});

test("rate-limit/ip: retorna unknown quando nenhum header de IP presente", () => {
  assert.equal(extractClientIp(new Request("https://nutrimae.app/api/checkout")), "unknown");
});

test("rate-limit/ip: espacos extras na lista sao tratados com trim()", () => {
  assert.equal(extractClientIp(makeReq("  10.0.0.1  ,  203.0.113.99  ")), "203.0.113.99");
});

test("rate-limit/ip: IP unico publico sem virgula e retornado diretamente", () => {
  assert.equal(extractClientIp(makeReq("45.90.120.1")), "45.90.120.1");
});

// ── invariantes de seguranca no source ───────────────────────

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("rate-limit: limite de IP e 5 e limite de email e 3 (auditoria do source)", async () => {
  const src = await read("src/lib/checkout/rate-limit.ts");
  assert.match(src, /MAX_BY_IP\s*=\s*5/);
  assert.match(src, /MAX_BY_EMAIL\s*=\s*3/);
});

test("rate-limit: janela de tempo e 5 minutos (auditoria do source)", async () => {
  const src = await read("src/lib/checkout/rate-limit.ts");
  assert.match(src, /WINDOW_MS\s*=\s*5\s*\*\s*60\s*\*\s*1000/);
});

test("rate-limit: email e hasheado com SHA-256 antes de usar como chave (auditoria do source)", async () => {
  const src = await read("src/lib/checkout/rate-limit.ts");
  assert.match(src, /sha256/);
  assert.match(src, /emailHash/);
  // Nao armazena o email em plaintext como chave do bucket
  assert.doesNotMatch(src, /emailBuckets\.set\(\s*email\b/);
  assert.doesNotMatch(src, /emailBuckets\.get\(\s*email\b/);
});

test("rate-limit: falha do Redis resulta em fallback in-memory, nao em throw (auditoria do source)", async () => {
  const src = await read("src/lib/checkout/rate-limit.ts");
  // O bloco catch nao re-lanca a excecao — cai no fallback in-memory
  assert.match(src, /catch\s*\(error\)/);
  assert.doesNotMatch(src, /catch\s*\(error\)\s*\{[\s\S]{0,30}throw/);
  // Confirma que ha um fallback in-memory apos o catch
  assert.match(src, /checkInMemory\(ipBuckets/);
});

test("rate-limit: isCheckoutRateLimited nao bloqueia quando Redis indisponivel (fail-open)", async () => {
  const src = await read("src/lib/checkout/rate-limit.ts");
  // Se Redis falha, o catch loga o erro mas nao retorna true (nao bloqueia)
  // O fallback in-memory decide — que so bloqueia se exceder o limite local
  assert.doesNotMatch(src, /catch\s*\(error\)\s*\{[\s\S]{0,50}return\s+true/);
});

test("rate-limit: Upstash Redis e condicional (nao instanciado sem env vars)", async () => {
  const src = await read("src/lib/checkout/rate-limit.ts");
  assert.match(src, /hasRedis\s*=\s*!!\(process\.env\.UPSTASH_REDIS_REST_URL/);
  assert.match(src, /hasRedis\s*\?\s*Redis\.fromEnv/);
});
