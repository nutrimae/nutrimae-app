import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyMetaSignature } from "../../src/lib/nutribot/webhook-auth.ts";

test("verifyMetaSignature", async (t) => {
  const mockSecret = "my_super_secret_app_secret";
  const rawBody = JSON.stringify({ test: "data" });

  await t.test("should return true for a valid signature", () => {
    process.env.META_WHATSAPP_APP_SECRET = mockSecret;
    const signature = createHmac("sha256", mockSecret).update(rawBody).digest("hex");
    const header = `sha256=${signature}`;
    
    assert.equal(verifyMetaSignature(rawBody, header), true);
  });

  await t.test("should return false for an invalid signature", () => {
    process.env.META_WHATSAPP_APP_SECRET = mockSecret;
    const header = `sha256=invalid_signature_string_here`;
    assert.equal(verifyMetaSignature(rawBody, header), false);
  });

  await t.test("should return false for missing header", () => {
    process.env.META_WHATSAPP_APP_SECRET = mockSecret;
    assert.equal(verifyMetaSignature(rawBody, null), false);
    assert.equal(verifyMetaSignature(rawBody, ""), false);
  });

  await t.test("should return false if META_WHATSAPP_APP_SECRET is missing (fail closed)", () => {
    delete process.env.META_WHATSAPP_APP_SECRET;
    const signature = createHmac("sha256", mockSecret).update(rawBody).digest("hex");
    const header = `sha256=${signature}`;
    
    assert.equal(verifyMetaSignature(rawBody, header), false);
  });
});
