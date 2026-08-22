import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Polling de status pra tela de Pix. Lê "orders.status" do banco — nunca
 * assume sucesso sem o webhook ter confirmado (é o webhook que grava
 * "paid" aqui, não esta rota).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "missing_order_id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data } = await admin.from("orders").select("status").eq("id", orderId).maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}
