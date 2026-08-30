import { requireAuth } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/metrics";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

const PERIODS = [7, 14, 30] as const;

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const int = (value: number) => value.toLocaleString("pt-BR");
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

/** Variação % vs período anterior; null quando não comparável (base zero). */
function deltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function Delta({ current, previous, tone }: { current: number; previous: number | null; tone: "money" | "neutral" }) {
  if (previous === null) return null;
  const percent = deltaPercent(current, previous);
  if (percent === null) return null;
  if (percent === 0) return <span className="delta flat num">= 0%</span>;
  const up = percent > 0;
  const cls = tone === "neutral" ? "flat" : up ? "up" : "down";
  return (
    <span className={`delta ${cls} num`}>
      <svg viewBox="0 0 8 8" width="7" height="7" aria-hidden="true">
        <path d={up ? "M4 1 7.2 6.4H0.8Z" : "M4 7 0.8 1.6H7.2Z"} fill="currentColor" />
      </svg>
      {Math.abs(percent)}%
      <span className="sr-only">vs período anterior</span>
    </span>
  );
}

function LowSampleBadge() {
  return <span className="badge-sample" title={`Menos de 30 vendas — ROAS ainda pode mudar bastante com poucos dados a mais.`}>amostra baixa</span>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAuth();

  const sp = await searchParams;
  const rawPeriod = Number(Array.isArray(sp.dias) ? sp.dias[0] : sp.dias);
  const periodDays = (PERIODS as readonly number[]).includes(rawPeriod) ? rawPeriod : 30;

  const m = await getDashboardMetrics(periodDays);
  const now = dateTime(new Date().toISOString());
  const maxDaily = Math.max(1, ...m.daily.map((d) => Math.max(d.revenueCents, d.spendCents)));
  const hasMoney = m.revenueCents > 0 || (m.spendCents ?? 0) > 0;
  const axisStep = Math.ceil(m.daily.length / 6);
  const funnelMax = Math.max(1, m.funnel.sessions, m.funnel.checkoutViewed, m.funnel.checkoutSubmitted, m.funnel.purchases);

  return (
    <main className="page">
      <header className="top">
        <div className="brand">
          <span className="mark" aria-hidden="true" />
          NutriMãe Track
        </div>
        <div className="top-right">
          <nav className="periods" aria-label="Período">
            {PERIODS.map((days) => (
              <a key={days} className={days === periodDays ? "active" : undefined} href={`/?dias=${days}`}>
                {days}d
              </a>
            ))}
          </nav>
          <form action={logout}>
            <button type="submit" className="logout-btn">Sair</button>
          </form>
        </div>
      </header>
      <p className="stamp muted">
        Últimos {m.periodDays} dias · atualizado {now}
      </p>

      {m.alerts.length > 0 ? (
        <section className="alerts" aria-label="Alertas">
          {m.alerts.map((alert, i) => (
            <div key={i} className={`alert alert-${alert.level}`}>
              <span className="alert-icon" aria-hidden="true">{alert.level === "critical" ? "!" : "•"}</span>
              {alert.message}
            </div>
          ))}
        </section>
      ) : null}

      {m.suggestions.length > 0 ? (
        <section className="panel suggestions-panel" aria-label="Sugestões">
          <div className="panel-head">
            <h2>Próxima ação sugerida</h2>
            <span className="sub muted" style={{ fontSize: "0.72rem" }}>regras automáticas, não é achismo</span>
          </div>
          <ul className="suggestions-list">
            {m.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="band" aria-label="Resumo do período">
        <div className="band-hero">
          <span className="metric-label">Faturamento</span>
          <strong className="num">{brl(m.revenueCents)}</strong>
          <Delta current={m.revenueCents} previous={m.prev.revenueCents} tone="money" />
        </div>
        <div className="band-grid">
          <div className="band-cell">
            <span className="metric-label">Vendas</span>
            <strong className="num">{int(m.purchases)}</strong>
            <Delta current={m.purchases} previous={m.prev.purchases} tone="money" />
          </div>
          <div className="band-cell">
            <span className="metric-label">Investimento</span>
            <strong className="num">{m.spendCents === null ? "—" : brl(m.spendCents)}</strong>
            {m.spendCents === null ? <span className="sub">gasto ainda não importado</span> : <Delta current={m.spendCents} previous={m.prev.spendCents} tone="neutral" />}
          </div>
          <div className="band-cell">
            <span className="metric-label">Lucro</span>
            <strong className={`num ${m.spendCents !== null ? (m.lucroCents < 0 ? "lucro-neg" : "lucro-pos") : ""}`}>{m.spendCents === null ? "—" : brl(m.lucroCents)}</strong>
            {m.spendCents === null ? <span className="sub">importe o gasto diário</span> : <Delta current={m.lucroCents} previous={m.prev.lucroCents} tone="money" />}
          </div>
          <div className="band-cell">
            <span className="metric-label">ROAS</span>
            <strong className="num">{m.roas === null ? "—" : `${m.roas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`}</strong>
            {m.roas !== null ? (
              <span className="sub">ponto de equilíbrio: {m.breakEvenRoas}× — {m.roas >= m.breakEvenRoas ? "acima" : "abaixo"}</span>
            ) : (
              <span className="sub">importe o gasto diário</span>
            )}
          </div>
        </div>
      </section>

      <section className="panel" aria-label="Ritmo diário">
        <div className="panel-head">
          <h2>Ritmo diário</h2>
          <div className="legend">
            <span><i className="dot dot-green" aria-hidden="true" />Faturamento</span>
            <span><i className="dot dot-red" aria-hidden="true" />Investimento</span>
          </div>
        </div>
        {hasMoney ? (
          <div className="chart">
            <div className="gridlines" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="bars">
              {m.daily.map((day) => (
                <div
                  className="day"
                  key={day.date}
                  title={`${day.label} — faturamento ${brl(day.revenueCents)} · investimento ${brl(day.spendCents)}`}
                >
                  {day.revenueCents > 0 ? (
                    <span className="bar bar-rev num" style={{ height: `${Math.max(2, (day.revenueCents / maxDaily) * 100)}%` }} />
                  ) : null}
                  {day.spendCents > 0 ? (
                    <span className="bar bar-spend num" style={{ height: `${Math.max(2, (day.spendCents / maxDaily) * 100)}%` }} />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="axis" aria-hidden="true">
              {m.daily.map((day, index) => (
                <span key={day.date}>{index % axisStep === 0 ? day.label : ""}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="chart-empty">
            <span>
              <strong style={{ display: "block", marginBottom: "0.2rem" }}>Sem faturamento no período</strong>
              Assim que a primeira venda for confirmada pelo webhook do Pagar.me, o ritmo aparece aqui.
            </span>
          </div>
        )}
      </section>

      <section className="panel" aria-label="Funil de conversão">
        <div className="panel-head">
          <h2>Funil</h2>
        </div>
        <div className="funnel">
          {[
            { label: "Sessões", value: m.funnel.sessions, pct: null },
            { label: "Viu o checkout", value: m.funnel.checkoutViewed, pct: m.funnel.sessionToViewedPct },
            { label: "Enviou o formulário", value: m.funnel.checkoutSubmitted, pct: m.funnel.viewedToSubmittedPct },
            { label: "Comprou", value: m.funnel.purchases, pct: m.funnel.submittedToPurchasePct },
          ].map((step) => (
            <div className="funnel-step" key={step.label}>
              <div className="funnel-bar-track">
                <div className="funnel-bar" style={{ width: `${Math.max(2, (step.value / funnelMax) * 100)}%` }} />
              </div>
              <div className="funnel-info">
                <span className="funnel-label">{step.label}</span>
                <span className="funnel-value num">{int(step.value)}</span>
                {step.pct !== null ? <span className="funnel-pct num">{step.pct}%</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" aria-label="Campanhas">
        <div className="panel-head">
          <h2>Campanhas</h2>
          {m.spendCents === null ? <span className="sub muted" style={{ fontSize: "0.78rem" }}>importe o gasto diário dos anúncios pra ver lucro e ROAS</span> : null}
        </div>
        {m.campaigns.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th className="num">Vendas</th>
                  <th className="num">Receita</th>
                  <th className="num">Investimento</th>
                  <th className="num">Lucro</th>
                  <th className="num">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {m.campaigns.map((row) => (
                  <tr key={`${row.campaign}|${row.source}`}>
                    <td>
                      <span className="campaign-name">{row.campaign}</span>
                      {row.source !== "—" ? <span className="campaign-source">{row.source}</span> : null}
                    </td>
                    <td className="num">{int(row.purchases)}</td>
                    <td className="num">{brl(row.revenueCents)}</td>
                    <td className="num">{row.spendCents > 0 ? brl(row.spendCents) : "—"}</td>
                    <td className={`num ${row.spendCents > 0 ? (row.lucroCents < 0 ? "lucro-neg" : "lucro-pos") : ""}`}>
                      {row.spendCents > 0 ? brl(row.lucroCents) : "—"}
                    </td>
                    <td className="num">
                      {row.spendCents > 0 ? (
                        <span className={`roas-chip ${row.revenueCents / row.spendCents >= m.breakEvenRoas ? "roas-good" : "roas-bad"}`}>
                          {(row.revenueCents / row.spendCents).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×
                        </span>
                      ) : (
                        "—"
                      )}
                      {row.purchases > 0 && row.lowSample ? <LowSampleBadge /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <span className="empty-title">Nenhuma campanha no período</span>
            Instale o padrão UTM nos links dos anúncios (<code>?utm_source=meta&amp;utm_campaign=nome</code>) para ver vendas, lucro e ROI por campanha.
          </div>
        )}
      </section>

      {m.creatives.length > 0 ? (
        <section className="panel" aria-label="Criativos">
          <div className="panel-head">
            <h2>Criativos</h2>
            <span className="sub muted" style={{ fontSize: "0.72rem" }}>qual peça específica converte — não só qual campanha</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Criativo</th>
                  <th>Ângulo</th>
                  <th className="num">Vendas</th>
                  <th className="num">Receita</th>
                  <th className="num">Investimento</th>
                  <th className="num">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {m.creatives.map((row) => (
                  <tr key={row.creativeId}>
                    <td>
                      <span className="campaign-name">{row.name}</span>
                      {row.format ? <span className="campaign-source">{row.format}</span> : null}
                    </td>
                    <td className="muted">{row.angle ?? row.hook ?? "—"}</td>
                    <td className="num">{int(row.purchases)}</td>
                    <td className="num">{brl(row.revenueCents)}</td>
                    <td className="num">{row.spendCents > 0 ? brl(row.spendCents) : "—"}</td>
                    <td className="num">
                      {row.roas !== null ? (
                        <span className={`roas-chip ${row.roas >= m.breakEvenRoas ? "roas-good" : "roas-bad"}`}>
                          {row.roas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×
                        </span>
                      ) : (
                        "—"
                      )}
                      {row.purchases > 0 && row.lowSample ? <LowSampleBadge /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="panel" aria-label="Ofertas">
        <div className="panel-head">
          <h2>Ofertas</h2>
          <span className="sub muted" style={{ fontSize: "0.72rem" }}>plano principal, bumps, upsells e downsells — todos os produtos deste painel</span>
        </div>
        {m.offers.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Oferta</th>
                  <th className="num">Vendas</th>
                  <th className="num">Receita</th>
                  <th className="num">Ticket médio</th>
                </tr>
              </thead>
              <tbody>
                {m.offers.map((row) => (
                  <tr key={row.offerId}>
                    <td>
                      <span className="campaign-name">{row.offerName}</span>
                      {row.isAddon ? <span className="campaign-source">bump/upsell/downsell</span> : null}
                    </td>
                    <td className="num">{int(row.purchases)}</td>
                    <td className="num">{brl(row.revenueCents)}</td>
                    <td className="num">{row.ticketMedioCents !== null ? brl(row.ticketMedioCents) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <span className="empty-title">Nenhuma venda no período</span>
          </div>
        )}
      </section>

      <section className="split-row">
        <div className="panel" aria-label="Forma de pagamento">
          <div className="panel-head"><h2>Forma de pagamento</h2></div>
          {m.paymentMethods.length > 0 ? (
            <div className="mini-table">
              {m.paymentMethods.map((row) => (
                <div className="mini-row" key={row.method}>
                  <span className="mini-label">{row.method === "pix" ? "Pix" : row.method === "credit_card" ? "Cartão" : row.method}</span>
                  <span className="num">{int(row.purchases)} vendas</span>
                  <span className="num mini-strong">{brl(row.revenueCents)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty"><span className="empty-title">Sem vendas no período</span></div>
          )}
        </div>

        <div className="panel" aria-label="Reembolsos e chargebacks">
          <div className="panel-head"><h2>Reembolsos &amp; chargebacks</h2></div>
          <div className="mini-table">
            <div className="mini-row">
              <span className="mini-label">Reembolsado</span>
              <span className="num">{int(m.refunds.refundCount)}×</span>
              <span className="num mini-strong">{brl(m.refunds.refundedCents)}</span>
            </div>
            <div className="mini-row">
              <span className="mini-label">Chargeback</span>
              <span className="num">{int(m.refunds.chargebackCount)}×</span>
              <span className="num mini-strong">{brl(m.refunds.chargebackCents)}</span>
            </div>
            <div className="mini-row">
              <span className="mini-label">Taxa de perda</span>
              <span />
              <span className={`num mini-strong ${m.refunds.lossRatePct !== null && m.refunds.lossRatePct > 10 ? "lucro-neg" : ""}`}>
                {m.refunds.lossRatePct !== null ? `${m.refunds.lossRatePct}%` : "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="traffic" aria-label="Tráfego">
        <div className="traffic-item">
          <span className="metric-label">Visitantes</span>
          <strong className="num">{int(m.visitors)}</strong>
        </div>
        <div className="traffic-item">
          <span className="metric-label">Sessões</span>
          <strong className="num">{int(m.sessions)}</strong>
        </div>
        <div className="traffic-item">
          <span className="metric-label">Conversão</span>
          <strong className="num">{m.conversionRate === null ? "—" : `${m.conversionRate.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}</strong>
        </div>
        <div className="traffic-item">
          <span className="metric-label">Ticket médio</span>
          <strong className="num">{m.ticketMedioCents === null ? "—" : brl(m.ticketMedioCents)}</strong>
        </div>
        <div className="traffic-item">
          <span className="metric-label">Custo por venda</span>
          <strong className="num">{m.cpaCents === null ? "—" : brl(m.cpaCents)}</strong>
        </div>
      </section>

      <footer className="foot">
        <span>Último evento: <strong>{m.health.lastEventAt ? dateTime(m.health.lastEventAt) : "—"}</strong></span>
        <span>Fila financeira: <strong>{int(m.health.outboxPending)} pendentes · {int(m.health.outboxErrors)} erros</strong></span>
        <span>Dados first-party, sem PII</span>
      </footer>
    </main>
  );
}
