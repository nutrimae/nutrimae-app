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
  const { data: files } = await admin.storage.from("illustrated-books").list(`${user.id}/${id}`, { limit: 100 });
  if (files?.length) {
    const paths = files.map((file) => `${user.id}/${id}/${file.name}`);
    const { error: storageError } = await admin.storage.from("illustrated-books").remove(paths);
    if (storageError) return NextResponse.json({ error: "storage_delete_failed" }, { status: 500 });
  }

  const { error } = await supabase.from("illustrated_books").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
