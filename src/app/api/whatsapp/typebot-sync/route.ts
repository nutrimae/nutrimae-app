import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncIdadeFromTypebot } from "@/lib/nutribot/sessionStore";

/**
 * Sincronização de `idade_bebe` vinda do próprio Typebot — substitui
 * nutribot-n8n/workflow/nutribot-typebot-sync.workflow.json.
 *
 * O Typebot chama isso logo depois de capturar a idade do bebê (bloco HTTP
 * Request dentro do próprio fluxo do Typebot). Só grava idade_bebe — nunca
 * toca session_id/status, então não interfere em mais nada.
 *
 * Depois do deploy, atualize a URL desse HTTP Request no builder do
 * Typebot pra: https://SEU-APP.vercel.app/api/whatsapp/typebot-sync
 */

interface SyncPayload {
  telefone?: unknown;
  idade_bebe?: unknown;
}

export async function POST(request: Request) {
  let body: SyncPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";
  const idadeBebe = typeof body.idade_bebe === "string" ? body.idade_bebe.trim() : "";

  if (!telefone) {
    return NextResponse.json({ error: "missing_telefone" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    await syncIdadeFromTypebot(admin, { phone: telefone, idadeBebe });
  } catch (err) {
    console.error("[typebot-sync] falha ao sincronizar idade_bebe", err);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
