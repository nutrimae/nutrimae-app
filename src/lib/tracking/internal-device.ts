import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Marca um dispositivo (navegador) como "interno" (dono/equipe testando em
 * produção) sem exigir localhost nem o header de testes automatizados.
 * O cookie guarda um hash derivado do segredo, nunca o segredo em si — quem
 * inspecionar o cookie não descobre o valor que libera a marcação.
 */
export const INTERNAL_DEVICE_COOKIE = "nutrimae_internal_device";

export function computeInternalDeviceToken(secret: string): string {
  return createHash("sha256").update(`nutrimae-internal-device:${secret}`).digest("hex");
}

export function isValidInternalDeviceCookie(cookieValue: string | undefined): boolean {
  const secret = process.env.INTERNAL_DEVICE_SECRET;
  if (!secret || !cookieValue) return false;

  const expected = Buffer.from(computeInternalDeviceToken(secret));
  const received = Buffer.from(cookieValue);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
