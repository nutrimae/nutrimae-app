"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookHeart, Check, Download, ImagePlus, LockKeyhole, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useToast } from "@/components/toast-provider";
import { MIN_BOOK_DIARY_ENTRIES, type BookPageScript, type BookStatus } from "@/lib/illustrated-book";
import { useLocale } from "@/lib/use-locale";

interface BookRecord {
  id: string;
  status: BookStatus;
  script: BookPageScript[];
  use_reference_photo: boolean;
  failure_reason: string | null;
}

interface BookState {
  book: BookRecord | null;
  diaryCount: number;
  eligible: boolean;
  accountAgeDays: number;
  hasAccess: boolean;
}

export function LivroIlustradoContent() {
  const { activeBaby } = useActiveBaby();
  const { showToast } = useToast();
  const { locale } = useLocale();
  const es = locale === "es";
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<BookState | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);

  const load = useCallback(async () => {
    if (!activeBaby) return;
    const response = await fetch(`/api/illustrated-book?babyId=${activeBaby.id}`, { cache: "no-store" });
    if (response.ok) setState(await response.json());
  }, [activeBaby]);

  useEffect(() => { void load(); }, [load]);

  async function createDraft() {
    if (!activeBaby) return null;
    const response = await fetch("/api/illustrated-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ babyId: activeBaby.id }),
    });
    if (!response.ok) return null;
    const result = await response.json();
    setState((current) => current ? { ...current, book: result.book } : current);
    return result.book as BookRecord;
  }

  async function prepareBook() {
    setBusy(true);
    const book = state?.book ?? await createDraft();
    if (!book) {
      showToast(es ? "¡Ups! No pudimos preparar el libro. Intenta de nuevo." : "Ops! Nao conseguimos preparar o livro. Tente novamente.");
      setBusy(false);
      return;
    }
    if (photo) {
      if (!consent) {
        showToast(es ? "Confirma la autorización para usar la foto como referencia." : "Confirme a autorizacao para usar a foto como referencia.");
        setBusy(false);
        return;
      }
      const form = new FormData();
      form.set("photo", photo);
      form.set("consent", "true");
      const upload = await fetch(`/api/illustrated-book/${book.id}/reference`, { method: "POST", body: form });
      if (!upload.ok) {
        showToast(es ? "No fue posible enviar la foto. Usa JPG, PNG o WebP de hasta 5 MB." : "Nao foi possivel enviar a foto. Use JPG, PNG ou WebP de ate 5 MB.");
        setBusy(false);
        return;
      }
    }
    await load();
    setBusy(false);
    showToast(es ? "Guion personalizado listo para generar." : "Roteiro personalizado pronto para gerar.");
  }

  async function generate() {
    if (!state?.book) return;
    setBusy(true);
    setProgress(1);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await fetch(`/api/illustrated-book/${state.book.id}/generate-next`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        showToast(result.message ?? (es ? "La generación se pausó por seguridad. Intenta de nuevo más tarde." : "A geracao foi pausada com seguranca. Tente novamente mais tarde."));
        break;
      }
      setProgress(result.progress ?? 0);
      if (result.done) {
        showToast(es ? "¡Tu libro está listo!" : "Seu livro ficou pronto!");
        break;
      }
    }
    await load();
    setBusy(false);
  }

  async function deleteBook() {
    if (!state?.book || !window.confirm(es ? "¿Borrar foto, ilustraciones y PDF de este libro? Esta acción no se puede deshacer." : "Apagar foto, ilustracoes e PDF deste livro? Esta acao nao pode ser desfeita.")) return;
    setBusy(true);
    const response = await fetch(`/api/illustrated-book/${state.book.id}`, { method: "DELETE" });
    if (response.ok) {
      setState((current) => current ? { ...current, book: null } : current);
      setPhoto(null);
      setProgress(0);
      showToast(es ? "El libro y todos los archivos fueron borrados." : "Livro e todos os arquivos foram apagados.");
    }
    setBusy(false);
  }

  if (!activeBaby || !state) {
    return <main className="mx-auto w-full max-w-sm px-4 py-8 text-center text-brown-700">{es ? "Preparando una linda sorpresa..." : "Preparando uma surpresa bonita..."}</main>;
  }

  const remaining = Math.max(0, MIN_BOOK_DIARY_ENTRIES - state.diaryCount);
  const ready = state.book?.status === "ready";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-5 pb-28">
      <BackButton fallbackHref="/app/diario" />

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFE8F0] via-white to-[#FFF6E8] p-6 shadow-[0_18px_50px_rgba(255,107,157,0.14)]">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-200/40 blur-2xl" />
        <div className="relative">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <BookHeart className="h-7 w-7 text-primary-600" />
          </div>
          <p className="type-tiny font-semibold uppercase tracking-[0.16em] text-primary-600">{es ? "Un recuerdo hecho de los registros reales" : "Uma lembranca feita dos registros reais"}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-brown-800">
            {es ? `El Libro de la Introducción Alimentaria de ${activeBaby.name.split(" ")[0]}` : `O Livro da Introducao Alimentar de ${activeBaby.name.split(" ")[0]}`}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brown-700/92">
            {es ? "Sabores, descubrimientos e hitos del Diario se convierten en una historia ilustrada única para guardar." : "Sabores, descobertas e marcos do Diario viram uma historia ilustrada unica para guardar."}
          </p>
        </div>
      </section>

      <BookPreview name={activeBaby.name.split(" ")[0]} es={es} />

      {!state.eligible && (
        <section className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50"><Sparkles className="h-5 w-5 text-sage-600" /></div>
            <div><h2 className="font-heading font-bold text-brown-800">{es ? "La historia está tomando forma" : "A historia esta ganhando forma"}</h2><p className="text-xs text-brown-700/86">{es ? "La invitación aparece cuando haya material suficiente." : "O convite aparece quando houver material suficiente."}</p></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-100"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${Math.min(100, (state.diaryCount / MIN_BOOK_DIARY_ENTRIES) * 100)}%` }} /></div>
          <p className="mt-2 text-sm text-brown-700">{remaining > 0 ? (es ? `Registra ${remaining} ${remaining === 1 ? "sabor" : "sabores"} más en el Diario.` : `Registre mais ${remaining} ${remaining === 1 ? "sabor" : "sabores"} no Diario.`) : es ? "Disponible después de los primeros 7 días de la cuenta." : "Disponivel depois dos primeiros 7 dias da conta."}</p>
          <Link href="/app/diario" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary-600">{es ? "Continuar el Diario" : "Continuar o Diario"}</Link>
        </section>
      )}

      {state.eligible && !state.hasAccess && (
        <section className="rounded-3xl border border-primary-100 bg-white p-5 shadow-[0_10px_35px_rgba(255,107,157,0.10)]">
          <p className="type-tiny font-semibold text-primary-600">{es ? "EXPANSIÓN PERSONALIZADA" : "EXPANSAO PERSONALIZADA"}</p>
          <div className="mt-2 flex items-end justify-between"><div><p className="text-sm text-brown-700/86 line-through">R$ 149</p><p className="font-heading text-3xl font-bold text-brown-800">R$ 119</p></div><Chip color="sage">{es ? "pago único" : "pagamento unico"}</Chip></div>
          <ul className="mt-4 space-y-2 text-sm text-brown-700">{(es ? ["Guion basado en el Diario", "7 ilustraciones personalizadas", "PDF privado para descargar", "Eliminación total cuando quieras"] : ["Roteiro baseado no Diario", "7 ilustracoes personalizadas", "PDF privado para download", "Exclusao total quando quiser"]).map((item) => <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-sage-600" />{item}</li>)}</ul>
          <p className="mt-3 rounded-2xl bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700">{es ? "Los R$ 119 pagados quedan registrados como crédito para un futuro upgrade anual." : "Os R$ 119 pagos ficam registrados como credito para um futuro upgrade anual."}</p>
          <Link href="/checkout/livro-ilustrado" className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 font-heading font-semibold text-white shadow-[0_4px_16px_var(--color-primary-shadow)] transition-transform active:scale-[0.98]">{es ? `Crear el libro de ${activeBaby.name.split(" ")[0]}` : `Criar o livro de ${activeBaby.name.split(" ")[0]}`}</Link>
        </section>
      )}

      {state.eligible && state.hasAccess && !ready && (
        <section className="glass-card rounded-3xl p-5">
          <h2 className="font-heading text-xl font-bold text-brown-800">{es ? "Personaliza el personaje" : "Personalize o personagem"}</h2>
          <p className="mt-1 text-sm text-brown-700/88">{es ? "La foto es opcional. Sin ella, creamos un personaje ilustrado genérico." : "A foto e opcional. Sem ela, criamos um personagem ilustrado generico."}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-4 flex min-h-24 w-full items-center gap-3 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 px-4 text-left">
            <ImagePlus className="h-7 w-7 text-primary-500" /><span><strong className="block text-brown-800">{photo ? photo.name : es ? "Elegir una foto" : "Escolher uma foto"}</strong><span className="text-xs text-brown-700/84">{es ? "JPG, PNG o WebP, hasta 5 MB" : "JPG, PNG ou WebP, ate 5 MB"}</span></span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
          {photo && <label className="mt-3 flex min-h-12 items-start gap-3 rounded-2xl bg-sage-50 p-3 text-xs leading-relaxed text-brown-700"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5 accent-primary-500" /><span>{es ? "Autorizo el uso privado de esta foto solo para crear este libro. Puedo borrar todo cuando quiera." : "Autorizo o uso privado desta foto apenas para criar este livro. Posso apagar tudo quando quiser."}</span></label>}
          <div className="mt-3 flex items-center gap-2 text-xs text-brown-700/86"><LockKeyhole className="h-4 w-4 text-sage-600" />{es ? "Archivos privados y nunca publicados automáticamente." : "Arquivos privados e nunca publicados automaticamente."}</div>

          {!state.book && <Button variant="brand" size="lg" loading={busy} onClick={prepareBook} className="mt-5 w-full">{es ? "Preparar mi guion" : "Preparar meu roteiro"}</Button>}
          {state.book && photo && !state.book.use_reference_photo && <Button variant="secondary" size="md" loading={busy} onClick={prepareBook} className="mt-4 w-full">{es ? "Guardar foto de referencia" : "Salvar foto de referencia"}</Button>}
          {state.book && state.book.status !== "ready" && <Button variant="brand" size="lg" loading={busy} onClick={generate} className="mt-5 w-full">{busy ? (es ? `Creando... ${progress}%` : `Criando... ${progress}%`) : es ? "Generar ilustraciones con seguridad" : "Gerar ilustracoes com seguranca"}</Button>}
          {busy && <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-100"><div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all" style={{ width: `${progress}%` }} /></div>}
          {state.book?.failure_reason && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">{es ? `La generación se pausó: ${state.book.failure_reason}` : `A geracao foi pausada: ${state.book.failure_reason}`}</p>}
        </section>
      )}

      {ready && state.book && (
        <section className="rounded-3xl bg-gradient-to-br from-sage-50 to-white p-5 text-center shadow-[0_12px_40px_rgba(16,185,129,0.12)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-500 text-white"><ShieldCheck className="h-8 w-8" /></div>
          <h2 className="mt-3 font-heading text-2xl font-bold text-brown-800">{es ? "Una historia solo de ustedes" : "Uma historia so de voces"}</h2>
          <p className="mt-1 text-sm text-brown-700/88">{es ? "Las páginas pasaron por la revisión automática y están listas para guardar." : "As paginas passaram pela revisao automatica e estao prontas para guardar."}</p>
          <a href={`/api/illustrated-book/${state.book.id}/pdf`} className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 font-heading font-semibold text-white shadow-[0_4px_16px_var(--color-primary-shadow)] transition-transform active:scale-[0.98]"><Download className="mr-2 h-5 w-5" />{es ? "Descargar libro en PDF" : "Baixar livro em PDF"}</a>
        </section>
      )}

      {state.book && <button type="button" onClick={deleteBook} disabled={busy} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"><Trash2 className="h-4 w-4" />{es ? "Borrar libro y todos los archivos" : "Apagar livro e todos os arquivos"}</button>}

      <p className="px-3 text-center text-[11px] leading-relaxed text-brown-700/80">{es ? "Este es un recuerdo afectivo creado a partir de los registros informados por la responsable. No es orientación médica o nutricional." : "Esta e uma lembranca afetiva criada a partir dos registros informados pela responsavel. Nao e orientacao medica ou nutricional."}</p>
    </main>
  );
}

function BookPreview({ name, es }: { name: string; es: boolean }) {
  const pages = es
    ? [{ title: `El libro de ${name}`, color: "from-[#FFB5C9] to-[#FFDCC7]" }, { title: "Un nuevo sabor", color: "from-[#CDEAD8] to-[#FFF4C7]" }, { title: "La aventura continúa", color: "from-[#C9D9FF] to-[#E8D5FF]" }]
    : [{ title: `O livro de ${name}`, color: "from-[#FFB5C9] to-[#FFDCC7]" }, { title: "Um novo sabor", color: "from-[#CDEAD8] to-[#FFF4C7]" }, { title: "A aventura continua", color: "from-[#C9D9FF] to-[#E8D5FF]" }];
  return (
    <section className="rounded-3xl bg-[#2E2542] p-5 text-white shadow-xl">
      <div className="flex gap-3 overflow-hidden">
        {pages.map((page, index) => (
          <div key={page.title} className={`min-w-[128px] rounded-2xl bg-gradient-to-br ${page.color} p-3 text-[#4B3940] shadow-lg`} style={{ transform: `rotate(${index - 1}deg)` }}>
            <div className="mb-8 flex h-20 items-center justify-center rounded-xl bg-white/55"><span className="text-4xl">{index === 0 ? "📖" : index === 1 ? "🥭" : "✨"}</span></div>
            <p className="font-heading text-sm font-bold leading-tight">{page.title}</p>
            <div className="mt-2 h-1.5 w-16 rounded-full bg-white/60" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/65">{es ? "Vista previa ilustrativa. El libro final usa los momentos reales registrados en el Diario." : "Previa ilustrativa. O livro final usa os momentos reais registrados no Diario."}</p>
    </section>
  );
}
