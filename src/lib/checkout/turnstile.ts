import { logError, logInfo } from "../nutribot/logger";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifica o token do Cloudflare Turnstile no servidor (item 12 do checklist
 * de segurança — proteção contra bot no checkout). Enquanto
 * TURNSTILE_SECRET_KEY não estiver configurada (ex.: ainda não criamos a
 * conta Cloudflare), a verificação é pulada e o checkout continua liberado —
 * assim como o rate-limit tem fallback em memória quando o Upstash não está
 * configurado. Assim que a chave existir, a proteção liga sozinha, sem
 * precisar mudar código.
 */
export async function verifyTurnstileToken(token: string | null | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    logInfo("turnstile.not_configured", {});
    return true;
  }

  if (!token) {
    return false;
  }

  const params = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") params.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body: params });
    const data = (await res.json()) as { success?: boolean; ["error-codes"]?: string[] };
    if (!data.success) {
      logInfo("turnstile.rejected", { errorCodes: data["error-codes"] ?? [] });
    }
    return data.success === true;
  } catch (err) {
    logError("turnstile.verify_failed", { error: (err as Error)?.message });
    // Rede do Cloudflare fora do ar com a chave configurada -> falha fechada.
    return false;
  }
}
