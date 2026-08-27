import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token de polling de status de pedido — garante que só quem criou o
 * pedido (e recebeu o token na resposta do checkout) consegue consultar
 * /api/checkout/status. Evita IDOR sem exigir sessão autenticada (a
 * usuária ainda não tem conta quando faz polling de Pix).
 *
 * Formato (base64url de): <orderId>.<expiresAt>.<hmac>
 * - orderId: UUID do pedido
 * - expiresAt: timestamp Unix em segundos (TTL 2h)
 * - hmac: HMAC-SHA256(secret, "orderId:expiresAt") em hex
 *
 * SEC-002: solução para IDOR em /api/checkout/status sem quebrar o fluxo
 * legítimo de polling de Pix (usuária anônima aguardando confirmação).
 */

const TOKEN_TTL_SECONDS = 2 * 60 * 60; // 2 horas

function getSecret(): string {
  const secret = process.env.PAGARME_WEBHOOK_PASSWORD;
  if (!secret) throw new Error("PAGARME_WEBHOOK_PASSWORD não configurado — necessário para tokens de status.");
  return secret;
}

function sign(orderId: string, expiresAt: number): string {
  return createHmac("sha256", getSecret())
    .update(`${orderId}:${expiresAt}`)
    .digest("hex");
}

/** Gera um token opaco para polling de status de um pedido específico. */
export function generateStatusToken(orderId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const hmac = sign(orderId, expiresAt);
  return Buffer.from(`${orderId}.${expiresAt}.${hmac}`).toString("base64url");
}

/** Valida o token e retorna o orderId se válido, null caso contrário. */
export function validateStatusToken(token: string): string | null {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const parts = decoded.split(".");
  if (parts.length !== 3) return null;
  const [orderId, expiresAtStr, receivedHmac] = parts;

  const expiresAt = Number(expiresAtStr);
  if (!orderId || !expiresAt || !receivedHmac || isNaN(expiresAt)) return null;

  if (Math.floor(Date.now() / 1000) > expiresAt) return null; // expirado

  const expectedHmac = sign(orderId, expiresAt);
  const expectedBuf = Buffer.from(expectedHmac, "hex");
  const receivedBuf = Buffer.from(receivedHmac, "hex");

  if (expectedBuf.length !== receivedBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, receivedBuf)) return null;

  return orderId;
}
