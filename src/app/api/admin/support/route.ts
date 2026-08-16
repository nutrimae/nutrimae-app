import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const isAdmin = await isCurrentUserAdmin(supabase, user.id);
  if (!isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const ticketId = new URL(request.url).searchParams.get("ticketId");

  if (ticketId) {
    const [ticketRes, messagesRes] = await Promise.all([
      admin.from("support_tickets").select("*").eq("id", ticketId).single(),
      admin
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true }),
    ]);
    return NextResponse.json({ ticket: ticketRes.data, messages: messagesRes.data ?? [] });
  }

  const { data: tickets } = await admin
    .from("support_tickets")
    .select("*")
    .order("last_message_at", { ascending: false });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const usersRes = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    cache: "no-store",
  });
  const usersBody = usersRes.ok ? await usersRes.json() : { users: [] };
  const emailById = new Map<string, string>(
    (usersBody.users ?? []).map((u: { id: string; email?: string }) => [u.id, u.email ?? ""]),
  );

  const ticketsWithEmail = (tickets ?? []).map((t) => ({
    ...t,
    user_email: emailById.get(t.user_id) ?? "desconhecido",
  }));

  return NextResponse.json({ tickets: ticketsWithEmail });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const isAdmin = await isCurrentUserAdmin(supabase, user.id);
  if (!isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await request.json()) as {
    ticketId: string;
    message: string;
    close?: boolean;
  };

  const admin = createAdminClient();

  const { error: msgError } = await admin.from("support_messages").insert({
    ticket_id: body.ticketId,
    sender: "admin",
    body: body.message,
    read_by_user: false,
  });
  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  if (body.close) {
    await admin.from("support_tickets").update({ status: "closed" }).eq("id", body.ticketId);
  }

  return NextResponse.json({ ok: true });
}
