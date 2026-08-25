import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";
import { refreshAdminMetricsCache } from "@/lib/admin/refresh";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Único gatilho HTTP que recalcula as métricas do painel — ver aviso em
 * src/lib/admin/metrics.ts. Chamado por dois caminhos:
 *  1) Vercel Cron 1x/dia (vercel.json), via GET com
 *     Authorization: Bearer CRON_SECRET (a Vercel injeta esse header
 *     sozinha em chamadas de cron — mesmo padrão de
 *     src/app/api/cron/abandoned-checkout/route.ts).
 *  2) Um admin logado clicando "Atualizar agora" no painel, ou automático
 *     quando o cache está com mais de 15 minutos, via POST com sessão —
 *     dá uma cadência mais próxima de "5-15min" sem precisar de cron pago
 *     mais frequente (Vercel Hobby só permite 1x/dia). Ver
 *     MÁQUINA_LOW_TICKET_BR.md.
 */
function verifyCronAuth(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

async function handleRefresh(request: Request, requireCronAuth: boolean) {
  if (requireCronAuth) {
    if (!verifyCronAuth(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  } else if (!verifyCronAuth(request)) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isCurrentUserAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  const { metrics, suggestions } = await refreshAdminMetricsCache(admin);

  return NextResponse.json({ ok: true, computedAt: metrics.computedAt, suggestions: suggestions.length });
}

/** Gatilho do Vercel Cron (1x/dia) — exige o segredo, nunca sessão de admin. */
export async function GET(request: Request) {
  return handleRefresh(request, true);
}

/** Gatilho manual/sob demanda a partir do painel — exige sessão de admin. */
export async function POST(request: Request) {
  return handleRefresh(request, false);
}
