import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Autenticação do painel: senha única (dono) + cookie de sessão assinado
 * com HMAC-SHA256. Sem RBAC/MFA — decisão de escopo: ferramenta enxuta
 * estilo Utmify, uso exclusivo do dono.
 *
 * Fail-closed: sem TRACKING_DASHBOARD_PASSWORD configurada, nenhum login
 * é possível e nenhum cookie é válido.
 */

export const SESSION_COOKIE = "nt_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getPassword(): string | null {
  return process.env.TRACKING_DASHBOARD_PASSWORD || null;
}

function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(`nt:${expiresAt}`).digest("hex");
}

/** Compara a senha candidata em tempo constante. Sem senha configurada: false. */
export function isValidPassword(candidate: string): boolean {
  const password = getPassword();
  if (!password || !candidate) return false;
  const expected = Buffer.from(password, "utf8");
  const received = Buffer.from(candidate, "utf8");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

/** Gera o valor do cookie de sessão (ou null se não houver senha configurada). */
export function createSessionValue(): string | null {
  const password = getPassword();
  if (!password) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  const password = getPassword();
  if (!password || !value) return false;

  const [expiresAtStr, receivedHmac] = value.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !receivedHmac || isNaN(expiresAt)) return false;
  if (Math.floor(Date.now() / 1000) > expiresAt) return false;

  const expected = Buffer.from(sign(expiresAt, password), "hex");
  const received = Buffer.from(receivedHmac, "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(SESSION_COOKIE)?.value);
}

/** Guarda de rota para Server Components: redireciona pro login se não autenticado. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
