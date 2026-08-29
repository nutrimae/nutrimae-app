import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limit do endpoint de TTS (SEC — proteção contra abuso de custo de
 * API). Sem isso, /api/tts/sos/* era um "oráculo" de texto-pra-fala aberto,
 * sem login, sem limite — qualquer bot podia gerar áudio (Google Cloud TTS,
 * cobrado por caractere) infinitamente. Mesmo padrão de fallback do
 * src/lib/checkout/rate-limit.ts: Upstash Redis se configurado, memória se
 * não (funciona, só não é compartilhado entre instâncias serverless).
 */
const WINDOW = "5 m";
const MAX_BY_IP = 15;

const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function checkInMemory(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_BY_IP;
}

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasRedis ? Redis.fromEnv() : (null as unknown as Redis);

const ttsRateLimit = hasRedis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_BY_IP, WINDOW),
      analytics: false,
      prefix: "ratelimit:tts:ip",
    })
  : null;

export function extractClientIp(request: Request): string {
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

export async function isTtsRateLimited(request: Request): Promise<boolean> {
  const ip = extractClientIp(request);

  if (ttsRateLimit) {
    try {
      const { success } = await ttsRateLimit.limit(ip);
      return !success;
    } catch {
      // Upstash fora do ar -> cai no fallback em memória, não bloqueia geral.
    }
  }

  return checkInMemory(ip);
}
