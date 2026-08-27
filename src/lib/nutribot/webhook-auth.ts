import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const secret = process.env.META_WHATSAPP_APP_SECRET;
  if (!secret) return false;

  const expectedSignature = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(`sha256=${expectedSignature}`, "utf8");
  const receivedBuf = Buffer.from(signatureHeader, "utf8");

  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}
