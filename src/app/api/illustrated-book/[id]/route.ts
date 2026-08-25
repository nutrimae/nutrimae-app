import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Exclusao total: foto original, paginas, PDF e registro em um unico fluxo. */
export async function DELETE(_request: Request, context: RouteContext<"/api/illustrated-book/[id]">) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: book } = await supabase.from("illustrated_books").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!book) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const admin = createAdminClient();
  const folder = `${user.id}/${id}`;

  // Lista com paginacao (nao confia em "menos de 100 arquivos" pra sempre) e
  // trata falha de listagem como erro real — se nao sabemos o que existe na
  // pasta, NUNCA apagamos o registro, senao os arquivos ficam orfaos (sem
  // nenhuma linha no banco apontando pra eles, mas ainda ocupando a pasta
  // privada da usuaria, o que contraria o pedido de exclusao total).
  const allFiles: { name: string }[] = [];
  let offset = 0;
  while (true) {
    const { data: page, error: listError } = await admin.storage.from("illustrated-books").list(folder, { limit: 100, offset });
    if (listError) return NextResponse.json({ error: "storage_list_failed" }, { status: 500 });
    if (!page?.length) break;
    allFiles.push(...page);
    if (page.length < 100) break;
    offset += 100;
  }

  if (allFiles.length) {
    const paths = allFiles.map((file) => `${folder}/${file.name}`);
    const { error: storageError } = await admin.storage.from("illustrated-books").remove(paths);
    if (storageError) return NextResponse.json({ error: "storage_delete_failed" }, { status: 500 });

    // Confirma que a pasta ficou vazia antes de apagar o registro do banco —
    // sem essa checagem, uma falha silenciosa do remove() (sem "error", mas
    // sem remover tudo) deixaria arquivo orfao do mesmo jeito.
    const { data: remaining, error: verifyError } = await admin.storage.from("illustrated-books").list(folder, { limit: 1 });
    if (verifyError || remaining?.length) return NextResponse.json({ error: "storage_delete_incomplete" }, { status: 500 });
  }

  const { error } = await supabase.from("illustrated_books").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
