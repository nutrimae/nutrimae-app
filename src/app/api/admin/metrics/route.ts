import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";
import { refreshAdminMetricsCache } from "@/lib/admin/refresh";

export const runtime = "nodejs";
export const maxDuration = 60;

const STALE_AFTER_MS = 15 * 60 * 1000;

/**
 * Lê o cache mais recente — NUNCA calcula métrica aqui além de decidir se
 * o cache está velho demais e pedir um refresh (que por sua vez chama a
 * única função de cálculo real, em src/lib/admin/refresh.ts).
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: latest } = await admin
    .from("admin_metrics_cache")
    .select("metrics, suggestions, computed_at")
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isStale = !latest || Date.now() - new Date(latest.computed_at).getTime() > STALE_AFTER_MS;

  if (isStale) {
    try {
      const { metrics, suggestions } = await refreshAdminMetricsCache(admin);
      return NextResponse.json({ metrics, suggestions, computedAt: metrics.computedAt, refreshedNow: true });
    } catch (err) {
      console.error("[admin/metrics] falha ao atualizar cache", err);
      // Se o refresh falhar (ex.: Supabase fora do ar) mas existe um cache
      // antigo, mostra ele com o aviso de idade em vez de quebrar a tela.
      if (latest) {
        return NextResponse.json({ metrics: latest.metrics, suggestions: latest.suggestions, computedAt: latest.computed_at, refreshedNow: false, refreshFailed: true });
      }
      return NextResponse.json({ error: "metrics_unavailable" }, { status: 503 });
    }
  }

  return NextResponse.json({ metrics: latest.metrics, suggestions: latest.suggestions, computedAt: latest.computed_at, refreshedNow: false });
}
