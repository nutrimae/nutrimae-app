import { requireAuth } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/metrics";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

const PERIODS = [7, 14, 30] as const;

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const int = (value: number) => value.toLocaleString("pt-BR");
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAuth();

  const sp = await searchParams;
  const rawPeriod = Number(Array.isArray(sp.dias) ? sp.dias[0] : sp.dias);
  const periodDays = (PERIODS as readonly number[]).includes(rawPeriod) ? rawPeriod : 30;

  const m = await getDashboardMetrics(periodDays);
  const funnelMax = Math.max(1, ...m.funnel.map((step) => step.count));
  const hasAnyEvent = m.funnel.some((step) => step.count > 0);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>NutriMãe Track</h1>
          <p className="muted">
            Últimos {m.periodDays} dias · atualizado agora
            {m.health.lastEventAt ? ` · último evento ${dateTime(m.health.lastEventAt)}` : ""}
          </p>
        </div>
        <nav className="period-nav" aria-label="Período">
          {PERIODS.map((days) => (
            <a key={days} className={days === periodDays ? "period active" : "period"} href={`/?dias=${days}`}>
              {days}d
            </a>
          ))}
          <form action={logout}>
            <button type="submit" className="period logout">Sair</button>
          </form>
        </nav>
      </header>

      <section className="cards" aria-label="Resumo">
        <div className="card"><span>Visitantes</span><strong>{int(m.visitors)}</strong></div>
        <div className="card"><span>Sessões</span><strong>{int(m.sessions)}</strong></div>
        <div className="card"><span>Compras</span><strong>{int(m.purchases)}</strong></div>
        <div className="card"><span>Receita</span><strong>{brl(m.revenueCents)}</strong></div>
        <div className="card">
          <span>Gasto em ads</span>
          <strong>{m.spendCents === null ? "—" : brl(m.spendCents)}</strong>
          {m.spendCents === null ? <small className="muted">gasto ainda não importado</small> : null}
        </div>
        <div className="card"><span>ROAS</span><strong>{m.roas === null ? "—" : `${m.roas.toFixed(2)}×`}</strong></div>
        <div className="card"><span>CPA</span><strong>{m.cpaCents === null ? "—" : brl(m.cpaCents)}</strong></div>
        <div className="card">
          <span>Cobertura atribuição</span>
          <strong>{m.health.attributionCoveragePercent === null ? "—" : `${m.health.attributionCoveragePercent}%`}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Funil</h2>
        {hasAnyEvent ? (
          <ul className="funnel">
            {m.funnel.map((step) => (
              <li key={step.name}>
                <span className="funnel-label">{step.label}</span>
                <span className="funnel-bar-wrap">
                  <span className="funnel-bar" style={{ width: `${Math.max(2, Math.round((step.count / funnelMax) * 100))}%` }} />
                </span>
                <span className="funnel-count">{int(step.count)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nenhum evento no período selecionado.</p>
        )}
      </section>

      <section className="panel">
        <h2>Campanhas</h2>
        {m.campaigns.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campanha</th><th>Fonte</th><th className="num">Sessões</th><th className="num">Compras</th>
                  <th className="num">Receita</th><th className="num">Gasto</th><th className="num">ROAS</th><th className="num">CPA</th>
                </tr>
              </thead>
              <tbody>
                {m.campaigns.map((row) => (
                  <tr key={`${row.campaign}|${row.source}`}>
                    <td>{row.campaign}</td>
                    <td>{row.source}</td>
                    <td className="num">{int(row.sessions)}</td>
                    <td className="num">{int(row.purchases)}</td>
                    <td className="num">{brl(row.revenueCents)}</td>
                    <td className="num">{row.spendCents > 0 ? brl(row.spendCents) : "—"}</td>
                    <td className="num">{row.spendCents > 0 ? `${(row.revenueCents / row.spendCents).toFixed(2)}×` : "—"}</td>
                    <td className="num">{row.spendCents > 0 && row.purchases > 0 ? brl(Math.round(row.spendCents / row.purchases)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Nenhuma campanha com atividade no período.</p>
        )}
      </section>

      <footer className="health muted">
        <span>Eventos 24h: <strong>{int(m.health.events24h)}</strong></span>
        <span>Outbox pendente: <strong>{int(m.health.outboxPending)}</strong></span>
        <span>Outbox com erro: <strong>{int(m.health.outboxErrors)}</strong></span>
        <span>Compras sem atribuição: <strong>{int(m.health.unattributedPurchases)}</strong></span>
      </footer>
    </main>
  );
}
