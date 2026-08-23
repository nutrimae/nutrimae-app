import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("bucket do livro ilustrado e privado", async () => {
  const schema = await read("supabase/schema.sql");
  assert.match(schema, /values \('illustrated-books', 'illustrated-books', false\)/);
  assert.doesNotMatch(schema, /illustrated-books[^\n]+true/);
});

test("arquivos do livro sao limitados a pasta do responsavel", async () => {
  const schema = await read("supabase/schema.sql");
  const policies = schema.slice(schema.indexOf("-- 15. Livro Ilustrado"));
  assert.match(policies, /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
});

test("geracao exige compra ativa e politica do provedor aprovada", async () => {
  const route = await read("src/app/api/illustrated-book/[id]/generate-next/route.ts");
  const provider = await read("src/lib/ai/illustrated-book-provider.ts");
  assert.match(route, /product_id", "livro_ilustrado"/);
  assert.match(route, /purchase_required/);
  assert.match(provider, /ILLUSTRATED_BOOK_PRIVACY_APPROVED/);
  assert.match(provider, /OPENAI_REFERENCE_PHOTO_APPROVED/);
});

test("fluxo de exclusao remove storage antes do registro", async () => {
  const route = await read("src/app/api/illustrated-book/[id]/route.ts");
  const removeIndex = route.indexOf(".remove(paths)");
  const deleteIndex = route.indexOf('.from("illustrated_books").delete()');
  assert.ok(removeIndex >= 0 && deleteIndex > removeIndex);
});

test("convite respeita dez registros e sete dias", async () => {
  const api = await read("src/app/api/illustrated-book/route.ts");
  const diary = await read("src/app/app/diario/diario-content.tsx");
  assert.match(api, /MIN_BOOK_DIARY_ENTRIES/);
  assert.match(api, /accountAgeDays >= 7/);
  assert.match(diary, /triedCount >= 10 && bookInviteAvailable/);
});
