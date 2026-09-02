import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { INTERNAL_DEVICE_COOKIE, computeInternalDeviceToken } from "@/lib/tracking/internal-device";

/**
 * Visite esta URL uma vez, no navegador/celular que você usa pra testar o
 * site em produção: /api/internal/mark-device?secret=SEU_INTERNAL_DEVICE_SECRET
 * Isso grava um cookie de 1 ano que exclui esse dispositivo do rastreamento
 * (Meta e analytics próprio) dali pra frente — sem precisar de localhost.
 */
export async function GET(request: Request) {
  const secret = process.env.INTERNAL_DEVICE_SECRET;
  const received = new URL(request.url).searchParams.get("secret");

  if (!secret || !received) {
    return NextResponse.json({ error: "missing_secret" }, { status: 400 });
  }

  const expectedBuffer = Buffer.from(secret);
  const receivedBuffer = Buffer.from(received);
  const matches = expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!matches) {
    return NextResponse.json({ error: "invalid_secret" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true, message: "Dispositivo marcado como interno. Pode testar o site normalmente — não vai mais contar como visita real." });
  response.cookies.set(INTERNAL_DEVICE_COOKIE, computeInternalDeviceToken(secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
