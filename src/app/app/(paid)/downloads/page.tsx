"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  Share2,
  Star,
  Package,
  Headphones,
  Smartphone,
  Monitor,
  Printer,
  BookOpen as KindleIcon,
  History,
  Trash2,
  Mail,
  Search,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { PDF_GUIDES } from "@/lib/pdf-guides";
import { AUDIOBOOKS } from "@/lib/audiobooks";
import {
  clearDownloadHistory,
  downloadCountFor,
  formatBytes,
  getDownloadHistory,
  getDownloadRatings,
  recordDownload,
  removeDownloadEntry,
  setDownloadRating,
  type DownloadEntry,
} from "@/lib/downloads-history";

type FilterType = "todos" | "pdf" | "audiobook";

export default function DownloadsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [history, setHistory] = useState<DownloadEntry[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    setHistory(getDownloadHistory());
    setRatings(getDownloadRatings());
    setShareCount(Number(window.localStorage.getItem("nutrimae:downloads:compartilhamentos") ?? 0));
  }, []);

  const stats = useMemo(() => {
    const totalBytes = history.reduce((sum, e) => sum + e.sizeBytes, 0);
    return { count: history.length, totalBytes };
  }, [history]);

  const filteredGuides = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PDF_GUIDES.filter((g) => {
      if (filter === "audiobook") return false;
      if (q && !g.title.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

  const filteredAudiobooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIOBOOKS.filter((a) => {
      if (filter === "pdf") return false;
      if (q && !a.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

  async function handleDownload(url: string, filename: string, id: string, title: string, type: DownloadEntry["type"]) {
    setLoadingId(id);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("download_failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setHistory(recordDownload({ id, title, type, sizeBytes: blob.size }));
    } catch {
      // silencioso — o botão volta ao estado normal e a pessoa pode tentar de novo
    } finally {
      setLoadingId(null);
    }
  }

  function handleRate(id: string, value: number) {
    setRatings(setDownloadRating(id, value));
  }

  function handleShare(title: string, url: string) {
    const text = encodeURIComponent(`📥 ${title} — baixe no NutriMäe: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    const next = shareCount + 1;
    setShareCount(next);
    window.localStorage.setItem("nutrimae:downloads:compartilhamentos", String(next));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">📥 Downloads & Recursos Offline</h1>
        <p className="mt-1 text-sm text-brown-700/70">
          Guias reais em PDF, gerados a partir do conteúdo do app, prontos para levar com você.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage-400" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recurso"
          className="min-h-12 w-full rounded-xl border-2 border-sage-100 bg-white pl-11 pr-4 text-base text-brown-800 outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_var(--color-primary-glow)]"
        />
      </div>
      <div className="flex gap-2">
        {(["todos", "pdf", "audiobook"] as FilterType[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-10 flex-1 rounded-full text-sm font-semibold transition-colors ${
              filter === f ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
            }`}
          >
            {f === "todos" ? "Todos" : f === "pdf" ? "PDFs" : "Audiobooks"}
          </button>
        ))}
      </div>

      {/* Seção 1 — Pacote completo */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <Package className="h-5 w-5 text-primary-600" strokeWidth={2} />
          Pacote completo
        </h2>
        <div className="rounded-2xl bg-primary-100 p-4">
          <p className="font-semibold text-brown-800">Tudo em 1 arquivo (.zip)</p>
          <p className="mt-1 text-sm text-brown-700">
            {PDF_GUIDES.length} PDFs + {AUDIOBOOKS.length} transcrições de audiobook (.txt) em um único ZIP.
          </p>
          <button
            type="button"
            onClick={() => handleDownload("/api/downloads/zip", "nutrimae-recursos.zip", "zip-tudo", "Pacote completo", "zip")}
            disabled={loadingId === "zip-tudo"}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-bold text-white disabled:opacity-60"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            {loadingId === "zip-tudo" ? "Gerando ZIP..." : "BAIXAR TUDO AGORA"}
          </button>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleDownload("/api/downloads/zip?only=pdfs", "nutrimae-pdfs.zip", "zip-pdfs", "Só PDFs", "zip")}
              disabled={loadingId === "zip-pdfs"}
              className="min-h-10 flex-1 rounded-xl bg-white/70 text-xs font-semibold text-brown-700 disabled:opacity-60"
            >
              {loadingId === "zip-pdfs" ? "Gerando..." : "Só PDFs"}
            </button>
            <button
              type="button"
              onClick={() => handleDownload("/api/downloads/zip?only=audiobooks", "nutrimae-audiobooks.zip", "zip-audio", "Só Audiobooks", "zip")}
              disabled={loadingId === "zip-audio"}
              className="min-h-10 flex-1 rounded-xl bg-white/70 text-xs font-semibold text-brown-700 disabled:opacity-60"
            >
              {loadingId === "zip-audio" ? "Gerando..." : "Só Audiobooks"}
            </button>
          </div>
          <p className="mt-2 text-xs text-brown-700/60">
            Funciona em Windows, Mac, iOS e Android (qualquer leitor de PDF). Para Kindle, veja a
            seção de dispositivos abaixo.
          </p>
        </div>
      </section>

      {/* Seção 2 — PDFs individuais */}
      {filteredGuides.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Guias em PDF</h2>
          <div className="flex flex-col gap-2">
            {filteredGuides.map((guide) => {
              const rating = ratings[guide.slug] ?? 0;
              const count = downloadCountFor(guide.slug);
              const isLoading = loadingId === guide.slug;
              return (
                <div key={guide.slug} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{guide.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-brown-800">{guide.title}</p>
                      <p className="mt-0.5 text-sm text-brown-700/70">{guide.description}</p>
                      <p className="mt-1 text-xs text-brown-700/50">
                        {count > 0 ? `Você baixou ${count}x` : "Ainda não baixado"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} type="button" onClick={() => handleRate(guide.slug, v)}>
                        <Star
                          className={`h-4 w-4 ${v <= rating ? "text-yellow-500" : "text-brown-700/20"}`}
                          strokeWidth={1.75}
                          fill={v <= rating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(`/api/pdf/${guide.slug}`, `nutrimae-${guide.slug}.pdf`, guide.slug, guide.title, "pdf")
                      }
                      disabled={isLoading}
                      className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-primary-500 text-xs font-bold text-white disabled:opacity-60"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      {isLoading ? "Gerando..." : "Baixar"}
                    </button>
                    <a
                      href={`/api/pdf/${guide.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-sage-50 text-xs font-semibold text-sage-700"
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                      Preview
                    </a>
                    <button
                      type="button"
                      onClick={() => handleShare(guide.title, `${window.location.origin}/api/pdf/${guide.slug}`)}
                      className="flex min-h-10 items-center justify-center rounded-xl bg-sage-50 px-3 text-sage-700"
                    >
                      <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção 3 — Audiobooks (transcrição) */}
      {filteredAudiobooks.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
            <Headphones className="h-5 w-5 text-primary-600" strokeWidth={2} />
            Audiobooks
          </h2>
          <div className="rounded-2xl bg-yellow-100 p-3 text-sm text-brown-800">
            A narração em áudio (MP3) ainda está em produção — por enquanto, baixe a transcrição
            completa em .txt para ler offline.
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {filteredAudiobooks.map((book) => {
              const count = downloadCountFor(book.id);
              const isLoading = loadingId === book.id;
              return (
                <div key={book.id} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
                  <p className="font-semibold text-brown-800">{book.title}</p>
                  <p className="mt-0.5 text-sm text-brown-700/70">{book.subtitle}</p>
                  <p className="mt-1 text-xs text-brown-700/50">
                    {count > 0 ? `Você baixou ${count}x` : "Ainda não baixado"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          `/api/downloads/transcript/${book.id}`,
                          `nutrimae-${book.id}-transcricao.txt`,
                          book.id,
                          book.title,
                          "txt",
                        )
                      }
                      disabled={isLoading}
                      className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-primary-500 text-xs font-bold text-white disabled:opacity-60"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      {isLoading ? "Gerando..." : "Baixar transcrição (.txt)"}
                    </button>
                    <Link
                      href={`/app/audiobooks/${book.id}`}
                      className="flex min-h-10 items-center justify-center rounded-xl bg-sage-50 px-3 text-xs font-semibold text-sage-700"
                    >
                      Ler no app
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção 4 — Acesso em outros dispositivos */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Acesso em outros dispositivos</h2>
        <div className="flex flex-col gap-2">
          <DeviceGuide
            icon={<KindleIcon className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title="Kindle"
            text="Envie o PDF por e-mail para o seu endereço @kindle.com (recurso oficial 'Send to Kindle' da Amazon) — ele converte automaticamente. Alternativa: use o app gratuito Calibre no computador para converter PDF em .mobi/.azw3 manualmente."
          />
          <DeviceGuide
            icon={<Smartphone className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title="Smartphone (iOS/Android)"
            text="Abra o PDF baixado com o Google Play Books, Apple Books, ou qualquer leitor de PDF do celular — a maioria abre diretamente pela pasta de Downloads."
          />
          <DeviceGuide
            icon={<Monitor className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title="Computador (Windows/Mac/Linux)"
            text="Windows e Linux já abrem PDF no navegador ou em leitores gratuitos como o Adobe Acrobat Reader. No Mac, o app Preview (Pré-visualização) já vem instalado e abre PDFs nativamente."
          />
          <DeviceGuide
            icon={<Printer className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title="Impressão"
            text="Em casa: imprima direto do leitor de PDF (Ctrl+P ou Cmd+P), frente e verso para economizar papel. Em gráfica: leve o PDF em um pendrive ou envie por e-mail para encadernação tipo brochura."
          />
        </div>
      </section>

      {/* Seção 5 — Gerenciar meus downloads */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <History className="h-5 w-5 text-primary-600" strokeWidth={2} />
          Gerenciar meus downloads
        </h2>
        <div className="rounded-2xl bg-sage-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brown-700">Total de downloads</span>
            <span className="font-bold text-brown-800">{stats.count}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-brown-700">Espaço usado (neste dispositivo)</span>
            <span className="font-bold text-brown-800">{formatBytes(stats.totalBytes)}</span>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="mt-3 text-center text-sm text-brown-700/60">
            Nenhum download registrado ainda neste dispositivo.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {history.slice(0, 10).map((entry, i) => (
              <div key={`${entry.id}-${entry.downloadedAt}`} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-brown-800">{entry.title}</p>
                  <p className="text-xs text-brown-700/60">
                    {new Date(entry.downloadedAt).toLocaleDateString("pt-BR")} · {formatBytes(entry.sizeBytes)}
                  </p>
                </div>
                <button type="button" onClick={() => setHistory(removeDownloadEntry(i))}>
                  <Trash2 className="h-4 w-4 text-brown-700/40" strokeWidth={2} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setHistory(clearDownloadHistory())}
              className="mt-1 min-h-10 rounded-xl bg-red-100 text-xs font-semibold text-red-700"
            >
              Limpar histórico
            </button>
          </div>
        )}
      </section>

      {/* Seção 6 — Compartilhamento */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Compartilhar</h2>
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <p className="text-sm text-brown-700">
            Compartilhe esses recursos com outras mães. Os links exigem login no NutriMäe — o
            conteúdo é para uso pessoal e familiar, não redistribua os arquivos publicamente.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleShare("Recursos do NutriMäe", `${window.location.origin}/app/downloads`)}
              className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
              WhatsApp
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent("Recursos do NutriMäe")}&body=${encodeURIComponent(
                `Olha esses guias que eu encontrei: ${typeof window !== "undefined" ? window.location.origin : ""}/app/downloads`,
              )}`}
              className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-sage-50 text-sm font-semibold text-sage-700"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              E-mail
            </a>
          </div>
          {shareCount > 0 && (
            <p className="mt-2 text-center text-xs text-brown-700/50">
              Você compartilhou {shareCount}x neste dispositivo.
            </p>
          )}
        </div>
      </section>

      <MedicalDisclaimerFooter />
    </main>
  );
}

function DeviceGuide({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">{icon}</div>
      <div>
        <p className="font-semibold text-brown-800">{title}</p>
        <p className="mt-0.5 text-sm text-brown-700">{text}</p>
      </div>
    </div>
  );
}
