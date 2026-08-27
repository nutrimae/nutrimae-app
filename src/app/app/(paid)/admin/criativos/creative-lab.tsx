"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, Sparkles } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Creative { id: string; name: string; platform: string; concept: string | null; angle: string | null; hook: string | null; status: string }

export function CreativeLab() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [angle, setAngle] = useState("");
  const [hook, setHook] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spendCsv, setSpendCsv] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/creatives", { cache: "no-store" });
    if (res.ok) setCreatives((await res.json()).creatives ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    setSaving(true); setError(null);
    const res = await fetch("/api/admin/creatives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, concept, angle, hook, platform: "meta" }) });
    if (!res.ok) setError("Não foi possível salvar o criativo.");
    else { setName(""); setConcept(""); setAngle(""); setHook(""); await load(); }
    setSaving(false);
  }

  async function importSpend() {
    setError(null); setImportResult(null);
    try {
      const lines = spendCsv.trim().split(/\r?\n/).filter(Boolean);
      const headers = lines.shift()?.split(",").map((item) => item.trim()) ?? [];
      const rows = lines.map((line) => {
        const values = line.split(",").map((item) => item.trim());
        const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
        return { spend_date: row.spend_date, platform: row.platform || "meta", account_id: row.account_id || "", campaign_id: row.campaign_id || "", adset_id: row.adset_id || "", ad_id: row.ad_id || "", creative_id: row.creative_id || null, currency: row.currency || "BRL", spend_cents: Number(row.spend_cents), impressions: row.impressions ? Number(row.impressions) : null, clicks: row.clicks ? Number(row.clicks) : null };
      });
      const res = await fetch("/api/admin/spend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportResult(`${data.imported} linha(s) importada(s).`);
    } catch { setError("CSV inválido. Confira cabeçalho, datas, IDs e valores em centavos."); }
  }

  return <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 py-6 pb-16">
    <BackButton fallbackHref="/app/admin/metricas" />
    <div><h1 className="font-heading text-2xl font-bold text-brown-900">Creative Lab</h1><p className="mt-1 text-sm text-brown-700/70">Identidade estável para conceito, ângulo e hook. Sem automação de campanha.</p></div>
    <section className="rounded-3xl bg-white p-5 shadow-medium">
      <h2 className="flex items-center gap-2 font-bold text-brown-900"><Plus className="h-4 w-4" /> Novo criativo</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><Input placeholder="Nome interno" value={name} onChange={(e) => setName(e.target.value)} /><Input placeholder="Conceito" value={concept} onChange={(e) => setConcept(e.target.value)} /><Input placeholder="Ângulo" value={angle} onChange={(e) => setAngle(e.target.value)} /><Input placeholder="Hook" value={hook} onChange={(e) => setHook(e.target.value)} /></div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <Button className="mt-4" variant="brand" onClick={create} disabled={name.trim().length < 2} loading={saving}>Salvar criativo</Button>
    </section>
    <section className="grid gap-3 sm:grid-cols-2">{creatives.map((creative) => <article key={creative.id} className="rounded-3xl bg-white p-4 shadow-subtle"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-brown-900">{creative.name}</p><p className="text-xs text-brown-700/60">{creative.platform} · {creative.status}</p></div><button type="button" title="Copiar ID" onClick={() => navigator.clipboard.writeText(creative.id)} className="rounded-xl bg-primary-50 p-2 text-primary-600"><Copy className="h-4 w-4" /></button></div><div className="mt-3 space-y-1 text-xs text-brown-700"><p><b>Conceito:</b> {creative.concept || "—"}</p><p><b>Ângulo:</b> {creative.angle || "—"}</p><p><b>Hook:</b> {creative.hook || "—"}</p></div><code className="mt-3 block break-all rounded-xl bg-gray-50 p-2 text-[10px]">creative_id={creative.id}</code></article>)}</section>
    {creatives.length === 0 && <div className="rounded-3xl bg-primary-50 p-6 text-center"><Sparkles className="mx-auto h-7 w-7 text-primary-500" /><p className="mt-2 text-sm font-semibold text-brown-800">Cadastre o primeiro criativo para começar a atribuição estável.</p></div>}
    <section className="rounded-3xl bg-white p-5 shadow-medium">
      <h2 className="font-bold text-brown-900">Importar gasto de mídia</h2>
      <p className="mt-1 text-xs text-brown-700/70">CSV com: spend_date, platform, account_id, campaign_id, adset_id, ad_id, creative_id, currency, spend_cents, impressions, clicks.</p>
      <textarea value={spendCsv} onChange={(e) => setSpendCsv(e.target.value)} rows={5} className="mt-3 w-full rounded-2xl border border-sage-100 p-3 font-mono text-xs" placeholder="spend_date,platform,..." />
      <Button className="mt-3" variant="secondary" onClick={importSpend} disabled={!spendCsv.trim()}>Importar CSV</Button>
      {importResult && <p className="mt-2 text-sm font-semibold text-green-700">{importResult}</p>}
    </section>
  </main>;
}
