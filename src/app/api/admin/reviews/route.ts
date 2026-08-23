import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = await isCurrentUserAdmin(supabase, user.id);
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pendente";
  const contentType = searchParams.get("content_type");

  let query = supabase
    .from("content_reviews")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (contentType) {
    query = query.eq("content_type", contentType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = await isCurrentUserAdmin(supabase, user.id);
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { content_type, content_id, status: newStatus, priority, notes } = body;

  if (!content_type || !content_id || !newStatus) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { data, error } = await supabase.from("content_reviews").upsert(
    {
      content_type,
      content_id,
      status: newStatus,
      priority: priority ?? "normal",
      reviewer_id: user.id,
      notes: notes ?? null,
      reviewed_at: newStatus !== "pendente" ? new Date().toISOString() : null,
    },
    { onConflict: "content_type,content_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
