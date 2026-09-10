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
import { useLocale } from "@/lib/use-locale";
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
  const { locale } = useLocale();
  const es = locale === "es";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [history, setHistory] = useState<DownloadEntry[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState(0);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setHistory(getDownloadHistory());
    setRatings(getDownloadRatings());
    setShareCount(Number(window.localStorage.getItem("nutrimae:downloads:compartilhamentos") ?? 0));
    setOrigin(window.location.origin);
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
    const text = encodeURIComponent(
      es ? `📥 ${title} — descarga en NutriMama: ${url}` : `📥 ${title} — baixe no NutriMama: ${url}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    const next = shareCount + 1;
    setShareCount(next);
    window.localStorage.setItem("nutrimae:downloads:compartilhamentos", String(next));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          {es ? "📥 Descargas y Recursos Offline" : "📥 Downloads & Recursos Offline"}
        </h1>
        <p className="mt-1 text-sm text-brown-700/90">
          {es
            ? "Guías reales en PDF, generadas a partir del contenido de la app, listas para llevar contigo."
            : "Guias reais em PDF, gerados a partir do conteúdo do app, prontos para levar com você."}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage-400" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={es ? "Buscar recurso" : "Buscar recurso"}
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
            {f === "todos" ? (es ? "Todos" : "Todos") : f === "pdf" ? "PDFs" : "Audiobooks"}
          </button>
        ))}
      </div>

      {/* Seção 1 — Pacote completo */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <Package className="h-5 w-5 text-primary-600" strokeWidth={2} />
          {es ? "Paquete completo" : "Pacote completo"}
        </h2>
        <div className="rounded-2xl bg-primary-100 p-4">
          <p className="font-semibold text-brown-800">{es ? "Todo en 1 archivo (.zip)" : "Tudo em 1 arquivo (.zip)"}</p>
          <p className="mt-1 text-sm text-brown-700">
            {es
              ? `${PDF_GUIDES.length} PDFs + ${AUDIOBOOKS.length} audiolibros (.mp3, cuando disponible, + transcripción .txt) en un único ZIP.`
              : `${PDF_GUIDES.length} PDFs + ${AUDIOBOOKS.length} audiobooks (.mp3, quando disponível, + transcrição .txt) em um único ZIP.`}
          </p>
          <button
            type="button"
            onClick={() =>
              handleDownload(
                "/api/downloads/zip",
                "nutrimae-recursos.zip",
                "zip-tudo",
                es ? "Paquete completo" : "Pacote completo",
                "zip",
              )
            }
            disabled={loadingId === "zip-tudo"}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-bold text-white disabled:opacity-60"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            {loadingId === "zip-tudo" ? (es ? "Generando ZIP..." : "Gerando ZIP...") : es ? "DESCARGAR TODO AHORA" : "BAIXAR TUDO AGORA"}
          </button>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleDownload("/api/downloads/zip?only=pdfs", "nutrimae-pdfs.zip", "zip-pdfs", es ? "Solo PDFs" : "Só PDFs", "zip")
              }
              disabled={loadingId === "zip-pdfs"}
              className="min-h-10 flex-1 rounded-xl bg-white/70 text-xs font-semibold text-brown-700 disabled:opacity-60"
            >
              {loadingId === "zip-pdfs" ? (es ? "Generando..." : "Gerando...") : es ? "Solo PDFs" : "Só PDFs"}
            </button>
            <button
              type="button"
              onClick={() =>
                handleDownload(
                  "/api/downloads/zip?only=audiobooks",
                  "nutrimae-audiobooks.zip",
                  "zip-audio",
                  es ? "Solo Audiolibros" : "Só Audiobooks",
                  "zip",
                )
              }
              disabled={loadingId === "zip-audio"}
              className="min-h-10 flex-1 rounded-xl bg-white/70 text-xs font-semibold text-brown-700 disabled:opacity-60"
            >
              {loadingId === "zip-audio" ? (es ? "Generando..." : "Gerando...") : es ? "Solo Audiolibros" : "Só Audiobooks"}
            </button>
          </div>
          <p className="mt-2 text-xs text-brown-700/86">
            {es
              ? "Funciona en Windows, Mac, iOS y Android (cualquier lector de PDF). Para Kindle, mira la sección de dispositivos abajo."
              : "Funciona em Windows, Mac, iOS e Android (qualquer leitor de PDF). Para Kindle, veja a seção de dispositivos abaixo."}
          </p>
        </div>
      </section>

      {/* Seção 2 — PDFs individuais */}
      {filteredGuides.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">{es ? "Guías en PDF" : "Guias em PDF"}</h2>
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
                      <p className="mt-0.5 text-sm text-brown-700/90">{guide.description}</p>
                      <p className="mt-1 text-xs text-brown-700/82">
                        {count > 0
                          ? es
                            ? `Descargaste ${count}x`
                            : `Você baixou ${count}x`
                          : es
                            ? "Aún no descargado"
                            : "Ainda não baixado"}
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
                      {isLoading ? (es ? "Generando..." : "Gerando...") : es ? "Descargar" : "Baixar"}
                    </button>
                    <a
                      href={`/api/pdf/${guide.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-sage-50 text-xs font-semibold text-sage-700"
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                      {es ? "Vista previa" : "Preview"}
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
            {es ? "Audiolibros" : "Audiobooks"}
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {filteredAudiobooks.map((book) => {
              const count = downloadCountFor(book.id);
              const isLoading = loadingId === book.id;
              const isLoadingAudio = loadingId === `${book.id}-mp3`;
              return (
                <div key={book.id} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
                  <p className="font-semibold text-brown-800">{book.title}</p>
                  <p className="mt-0.5 text-sm text-brown-700/90">{book.subtitle}</p>
                  <p className="mt-1 text-xs text-brown-700/82">
                    {count > 0
                      ? es
                        ? `Descargaste ${count}x`
                        : `Você baixou ${count}x`
                      : es
                        ? "Aún no descargado"
                        : "Ainda não baixado"}
                  </p>
                  {!book.hasAudio && (
                    <p className="mt-1 rounded-xl bg-yellow-100 p-2 text-xs text-brown-800">
                      {es
                        ? "La narración en audio de este contenido todavía está en producción — descarga la transcripción para leer sin conexión."
                        : "A narração em áudio deste conteúdo ainda está em produção — baixe a transcrição para ler offline."}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {book.hasAudio && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            `/api/audio/${book.id}?download=1`,
                            `nutrimae-${book.id}.mp3`,
                            `${book.id}-mp3`,
                            book.title,
                            "mp3",
                          )
                        }
                        disabled={isLoadingAudio}
                        className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-primary-500 text-xs font-bold text-white disabled:opacity-60"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        {isLoadingAudio ? (es ? "Descargando..." : "Baixando...") : es ? "Descargar audio (.mp3)" : "Baixar áudio (.mp3)"}
                      </button>
                    )}
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
                      className={`flex min-h-10 items-center justify-center gap-1 rounded-xl text-xs font-bold disabled:opacity-60 ${
                        book.hasAudio
                          ? "bg-sage-50 px-3 text-sage-700"
                          : "flex-1 bg-primary-500 text-white"
                      }`}
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      {isLoading ? (es ? "Generando..." : "Gerando...") : es ? "Transcripción (.txt)" : "Transcrição (.txt)"}
                    </button>
                    <Link
                      href={`/app/audiobooks/${book.id}`}
                      className="flex min-h-10 items-center justify-center rounded-xl bg-sage-50 px-3 text-xs font-semibold text-sage-700"
                    >
                      {es ? "Leer en la app" : "Ler no app"}
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
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          {es ? "Acceso en otros dispositivos" : "Acesso em outros dispositivos"}
        </h2>
        <div className="flex flex-col gap-2">
          <DeviceGuide
            icon={<KindleIcon className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title="Kindle"
            text={
              es
                ? "Envía el PDF por correo a tu dirección @kindle.com (función oficial 'Send to Kindle' de Amazon) — se convierte automáticamente. Alternativa: usa la app gratuita Calibre en la computadora para convertir PDF a .mobi/.azw3 manualmente."
                : "Envie o PDF por e-mail para o seu endereço @kindle.com (recurso oficial 'Send to Kindle' da Amazon) — ele converte automaticamente. Alternativa: use o app gratuito Calibre no computador para converter PDF em .mobi/.azw3 manualmente."
            }
          />
          <DeviceGuide
            icon={<Smartphone className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title={es ? "Smartphone (iOS/Android)" : "Smartphone (iOS/Android)"}
            text={
              es
                ? "Abre el PDF descargado con Google Play Books, Apple Books, o cualquier lector de PDF del celular — la mayoría abre directamente desde la carpeta de Descargas."
                : "Abra o PDF baixado com o Google Play Books, Apple Books, ou qualquer leitor de PDF do celular — a maioria abre diretamente pela pasta de Downloads."
            }
          />
          <DeviceGuide
            icon={<Monitor className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title={es ? "Computadora (Windows/Mac/Linux)" : "Computador (Windows/Mac/Linux)"}
            text={
              es
                ? "Windows y Linux ya abren PDF en el navegador o en lectores gratuitos como Adobe Acrobat Reader. En Mac, la app Vista Previa ya viene instalada y abre PDFs de forma nativa."
                : "Windows e Linux já abrem PDF no navegador ou em leitores gratuitos como o Adobe Acrobat Reader. No Mac, o app Preview (Pré-visualização) já vem instalado e abre PDFs nativamente."
            }
          />
          <DeviceGuide
            icon={<Printer className="h-5 w-5 text-primary-600" strokeWidth={2} />}
            title={es ? "Impresión" : "Impressão"}
            text={
              es
                ? "En casa: imprime directo desde el lector de PDF (Ctrl+P o Cmd+P), a doble cara para ahorrar papel. En imprenta: lleva el PDF en un pendrive o envíalo por correo para encuadernación tipo folleto."
                : "Em casa: imprima direto do leitor de PDF (Ctrl+P ou Cmd+P), frente e verso para economizar papel. Em gráfica: leve o PDF em um pendrive ou envie por e-mail para encadernação tipo brochura."
            }
          />
        </div>
      </section>

      {/* Seção 5 — Gerenciar meus downloads */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <History className="h-5 w-5 text-primary-600" strokeWidth={2} />
          {es ? "Administrar mis descargas" : "Gerenciar meus downloads"}
        </h2>
        <div className="rounded-2xl bg-sage-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brown-700">{es ? "Total de descargas" : "Total de downloads"}</span>
            <span className="font-bold text-brown-800">{stats.count}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-brown-700">{es ? "Espacio usado (en este dispositivo)" : "Espaço usado (neste dispositivo)"}</span>
            <span className="font-bold text-brown-800">{formatBytes(stats.totalBytes)}</span>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="mt-3 text-center text-sm text-brown-700/86">
            {es ? "Ningún descarga registrada aún en este dispositivo." : "Nenhum download registrado ainda neste dispositivo."}
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {history.slice(0, 10).map((entry, i) => (
              <div key={`${entry.id}-${entry.downloadedAt}`} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-brown-800">{entry.title}</p>
                  <p className="text-xs text-brown-700/86">
                    {new Date(entry.downloadedAt).toLocaleDateString(es ? "es-ES" : "pt-BR")} · {formatBytes(entry.sizeBytes)}
                  </p>
                </div>
                <button type="button" onClick={() => setHistory(removeDownloadEntry(i))}>
                  <Trash2 className="h-4 w-4 text-brown-700/78" strokeWidth={2} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setHistory(clearDownloadHistory())}
              className="mt-1 min-h-10 rounded-xl bg-red-100 text-xs font-semibold text-red-700"
            >
              {es ? "Limpiar historial" : "Limpar histórico"}
            </button>
          </div>
        )}
      </section>

      {/* Seção 6 — Compartilhamento */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">{es ? "Compartir" : "Compartilhar"}</h2>
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <p className="text-sm text-brown-700">
            {es
              ? "Comparte estos recursos con otras mamás. Los enlaces requieren iniciar sesión en NutriMama — el contenido es para uso personal y familiar, no redistribuyas los archivos públicamente."
              : "Compartilhe esses recursos com outras mães. Os links exigem login no NutriMama — o conteúdo é para uso pessoal e familiar, não redistribua os arquivos publicamente."}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleShare(es ? "Recursos de NutriMama" : "Recursos do NutriMama", `${window.location.origin}/app/downloads`)
              }
              className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
              WhatsApp
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(
                es ? "Recursos de NutriMama" : "Recursos do NutriMama",
              )}&body=${encodeURIComponent(
                es
                  ? `Mira estas guías que encontré: ${origin}/app/downloads`
                  : `Olha esses guias que eu encontrei: ${origin}/app/downloads`,
              )}`}
              className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-sage-50 text-sm font-semibold text-sage-700"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              {es ? "Correo" : "E-mail"}
            </a>
          </div>
          {shareCount > 0 && (
            <p className="mt-2 text-center text-xs text-brown-700/82">
              {es ? `Compartiste ${shareCount}x en este dispositivo.` : `Você compartilhou ${shareCount}x neste dispositivo.`}
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
