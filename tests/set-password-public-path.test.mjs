import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("/auth/set-password é público no middleware — sessão do convite/recuperação só existe no #hash, o servidor nunca vê", async () => {
  const middleware = await read("src/lib/supabase/middleware.ts");
  const publicPaths = middleware.slice(middleware.indexOf("PUBLIC_PATHS"), middleware.indexOf("];") + 2);
  assert.match(publicPaths, /"\/auth\/set-password"/);
});
