import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import { logError } from "../nutribot/logger";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_BY_IP = 5;
const MAX_BY_EMAIL = 3;

// --- IN-MEMORY FALLBACK (BASELINE_ONLY) ---
type Bucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, Bucket>();
const emailBuckets = new Map<string, Bucket>();

function checkInMemory(map: Map<string, Bucket>, key: string, max: number): boolean {
  const now = Date.now();
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}

// --- DISTRIBUTED (PRODUCTION_READY) ---
const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasRedis ? Redis.fromEnv() : (null as unknown as Redis);

const ipRateLimit = hasRedis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(MAX_BY_IP, "5 m"),
  analytics: false,
  prefix: "ratelimit:checkout:ip",
}) : null;

const emailRateLimit = hasRedis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(MAX_BY_EMAIL, "5 m"),
  analytics: false,
  prefix: "ratelimit:checkout:email",
}) : null;

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

export async function isCheckoutRateLimited(request: Request, email?: string): Promise<boolean> {
  const ip = extractClientIp(request);
  let emailHash: string | undefined;

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    emailHash = createHash("sha256").update(normalizedEmail).digest("hex");
  }

  if (hasRedis && ipRateLimit && emailRateLimit) {
    try {
      const ipResult = await ipRateLimit.limit(ip);
      if (!ipResult.success) return true;

      if (emailHash) {
        const emailResult = await emailRateLimit.limit(emailHash);
        if (!emailResult.success) return true;
      }
      return false;
    } catch (error) {
      logError("checkout.rate_limit_redis_failed", { errorMessage: error instanceof Error ? error.message : String(error) });
      // Fall through to in-memory fail-safe
    }
  }

  // Fallback: In-memory Map (fail-safe and baseline)
  if (checkInMemory(ipBuckets, ip, MAX_BY_IP)) return true;
  if (emailHash && checkInMemory(emailBuckets, emailHash, MAX_BY_EMAIL)) return true;

  return false;
}
