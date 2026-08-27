import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateStatusToken } from "@/lib/checkout/status-token";

/**
 * Polling de status para a tela de Pix. Lê "orders.status" do banco — nunca
 * assume sucesso sem o webhook ter confirmado (é o webhook que grava
 * "paid" aqui, não esta rota).
 *
 * SEC-002: requer um statusToken assinado com HMAC emitido pelo endpoint de
 * checkout no momento da criação do pedido. Sem o token, a rota rejeita a
 * requisição — impede enumeração de IDs de pedidos de terceiros por
 * unauthenticated callers. O token tem TTL de 2h (suficiente para qualquer
 * sessão de Pix real). Ver src/lib/checkout/status-token.ts.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 401 });
  }

  const orderId = validateStatusToken(token);
  if (!orderId) {
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin.from("orders").select("status").eq("id", orderId).maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}

