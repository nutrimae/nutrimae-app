import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";

type Action =
  | { type: "pin_post"; postId: string; pinned: boolean }
  | { type: "hide_post"; postId: string; hidden: boolean }
  | { type: "hide_reply"; replyId: string; hidden: boolean }
  | { type: "mark_official"; replyId: string; official: boolean }
  | { type: "upsert_faq"; id?: string; question: string; answer: string; position: number }
  | { type: "delete_faq"; id: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const isAdmin = await isCurrentUserAdmin(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const action = (await request.json()) as Action;
  const admin = createAdminClient();

  switch (action.type) {
    case "pin_post": {
      const { error } = await admin
        .from("community_posts")
        .update({ is_pinned: action.pinned })
        .eq("id", action.postId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    case "hide_post": {
      const { error } = await admin
        .from("community_posts")
        .update({ is_hidden: action.hidden })
        .eq("id", action.postId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    case "hide_reply": {
      const { error } = await admin
        .from("community_replies")
        .update({ is_hidden: action.hidden })
        .eq("id", action.replyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    case "mark_official": {
      const { error } = await admin
        .from("community_replies")
        .update({ is_official: action.official })
        .eq("id", action.replyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    case "upsert_faq": {
      const { error } = await admin.from("community_faqs").upsert({
        id: action.id,
        question: action.question,
        answer: action.answer,
        position: action.position,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    case "delete_faq": {
      const { error } = await admin.from("community_faqs").delete().eq("id", action.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const isAdmin = await isCurrentUserAdmin(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const [postsRes, reportsRes] = await Promise.all([
    admin
      .from("community_posts")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    admin.from("community_reports").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    posts: postsRes.data ?? [],
    reports: reportsRes.data ?? [],
  });
}
