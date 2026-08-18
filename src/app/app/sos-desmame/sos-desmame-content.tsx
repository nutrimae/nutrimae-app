"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pause, Play, Lock, Check, Moon, X } from "lucide-react";
import {
  WEANING_TRACKS,
  WEANING_WEEKS,
  PANIC_TRACK_ID,
  WEANING_PROGRESS_STORAGE_KEY,
  emptyWeaningProgress,
  type WeaningProgress,
} from "@/lib/weaning";

// Faixas do mini-podcast (playlist normal) — a primeira do catálogo é
// reservada para o Botão de Pânico e não aparece de novo aqui embaixo.
const PLAYLIST_TRACKS = WEANING_TRACKS.filter((t) => t.id !== PANIC_TRACK_ID);
const PANIC_TRACK = WEANING_TRACKS.find((t) => t.id === PANIC_TRACK_ID)!;

function audioSrc(id: string) {
  return `/api/audio/desmame/${id}`;
}

/**
 * Player de uma única faixa ("Pílula de Áudio"). Recebe do componente pai
 * qual faixa está tocando agora — assim só uma toca por vez em toda a tela
 * (playlist e modal de pânico incluídos).
 */
function AudioPill({
  id,
  title,
  subtitle,
  durationLabel,
  hasAudio,
  isPlaying,
  progress,
  onRequestPlay,
  onRegisterAudio,
}: {
  id: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  hasAudio: boolean;
  isPlaying: boolean;
  progress: number;
  onRequestPlay: (id: string) => void;
  onRegisterAudio: (id: string, el: HTMLAudioElement | null) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3.5"
      style={{ background: "var(--midnight-bg-elevated)", border: "1px solid var(--midnight-border)" }}
    >
      <button
        type="button"
        onClick={() => hasAudio && onRequestPlay(id)}
        disabled={!hasAudio}
        aria-label={isPlaying ? `Pausar ${title}` : `Tocar ${title}`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
          hasAudio ? "cursor-pointer" : "cursor-not-allowed opacity-40"
        }`}
        style={{
          background: hasAudio
            ? "linear-gradient(135deg, var(--midnight-accent-2), var(--midnight-accent))"
            : "rgba(226, 232, 240, 0.12)",
        }}
      >
        {!hasAudio ? (
          <Lock className="h-4 w-4 text-[#E2E8F0]" strokeWidth={2} />
        ) : isPlaying ? (
          <Pause className="h-5 w-5 fill-white text-white" strokeWidth={2} />
        ) : (
          <Play className="ml-0.5 h-5 w-5 fill-white text-white" strokeWidth={2} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ color: "var(--midnight-text)" }}>
          {title}
        </p>
        <p className="truncate text-xs" style={{ color: "var(--midnight-text-dim)" }}>
          {hasAudio ? subtitle : "Em breve — narração sendo gravada"}
        </p>
        <div className="audio-progress-track mt-2 h-1 w-full overflow-hidden rounded-full">
          <div className="audio-progress-fill h-full rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <span className="shrink-0 text-[11px] font-medium" style={{ color: "var(--midnight-text-dim)" }}>
        {durationLabel}
      </span>

      {hasAudio && (
        <audio
          ref={(el) => onRegisterAudio(id, el)}
          src={audioSrc(id)}
          preload="none"
          onEnded={() => onRequestPlay("")}
        />
      )}
    </div>
  );
}

function DayCircle({
  checked,
  celebrating,
  onToggle,
  label,
}: {
  checked: boolean;
  celebrating: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-pressed={checked}
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90 ${
          celebrating ? "animate-confetti-pop" : ""
        }`}
        style={{
          borderColor: checked ? "var(--midnight-accent-2)" : "rgba(226, 232, 240, 0.25)",
          background: checked
            ? "linear-gradient(135deg, var(--midnight-accent-2), var(--midnight-accent))"
            : "transparent",
        }}
      >
        {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </button>

      {celebrating && (
        <span aria-hidden className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2">
          <span className="animate-confetti-fly absolute h-1.5 w-1.5 rounded-full bg-pink-400" style={{ "--fly-x": "-14px", "--fly-y": "-18px" } as React.CSSProperties} />
          <span className="animate-confetti-fly absolute h-1.5 w-1.5 rounded-full bg-purple-300" style={{ "--fly-x": "14px", "--fly-y": "-16px" } as React.CSSProperties} />
          <span className="animate-confetti-fly absolute h-1 w-1 rounded-full bg-amber-300" style={{ "--fly-x": "0px", "--fly-y": "-22px" } as React.CSSProperties} />
        </span>
      )}
    </div>
  );
}

export function SosDesmameContent() {
  const [panicOpen, setPanicOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string>("");
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [weekProgress, setWeekProgress] = useState<WeaningProgress>(emptyWeaningProgress());
  const [celebratingKey, setCelebratingKey] = useState<string | null>(null);

  // Carrega o progresso salvo assim que a tela monta (só existe no navegador).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WEANING_PROGRESS_STORAGE_KEY);
      if (raw) setWeekProgress({ ...emptyWeaningProgress(), ...JSON.parse(raw) });
    } catch {
      // localStorage indisponível (modo privado, etc.) — segue com estado vazio.
    }
  }, []);

  function registerAudio(id: string, el: HTMLAudioElement | null) {
    if (el) audioRefs.current.set(id, el);
    else audioRefs.current.delete(id);
  }

  // Garante que só uma faixa toca por vez: ao pedir play em uma, pausa
  // qualquer outra que já esteja tocando (playlist e modal de pânico juntos).
  function requestPlay(id: string) {
    const current = audioRefs.current.get(playingId);
    if (current && playingId !== id) current.pause();

    if (!id) {
      setPlayingId("");
      return;
    }

    const target = audioRefs.current.get(id);
    if (!target) return;

    if (playingId === id) {
      target.pause();
      setPlayingId("");
      return;
    }

    target
      .play()
      .then(() => setPlayingId(id))
      .catch(() => setPlayingId(""));
  }

  useEffect(() => {
    const audio = audioRefs.current.get(playingId);
    if (!audio) return;
    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setProgressById((prev) => ({ ...prev, [playingId]: audio.currentTime / audio.duration }));
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [playingId]);

  function persistProgress(next: WeaningProgress) {
    setWeekProgress(next);
    try {
      window.localStorage.setItem(WEANING_PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sem localStorage: a marcação ainda funciona na sessão atual.
    }
  }

  function toggleDay(weekKey: string, dayIndex: number) {
    const willCheck = !weekProgress[weekKey][dayIndex];
    const nextDays = [...weekProgress[weekKey]];
    nextDays[dayIndex] = willCheck;
    persistProgress({ ...weekProgress, [weekKey]: nextDays });

    if (willCheck) {
      const key = `${weekKey}-${dayIndex}`;
      setCelebratingKey(key);
      window.setTimeout(() => setCelebratingKey((k) => (k === key ? null : k)), 550);
    }
  }

  function closePanicModal() {
    if (playingId === PANIC_TRACK_ID) requestPlay(PANIC_TRACK_ID);
    setPanicOpen(false);
  }

  return (
    // -mb-4 cobre o pb-4 do wrapper em src/app/app/layout.tsx: sem isso, uma
    // faixa clara do fundo do app apareceria embaixo do Modo Madrugada.
    <div className="midnight-theme -mb-4">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-4 pb-16 pt-5">
        <Link
          href="/app/vip"
          className="flex min-h-10 w-fit items-center gap-1.5 text-sm font-semibold"
          style={{ color: "var(--midnight-text-dim)" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Voltar
        </Link>

        {/* Hero — saudação calmante + botão de pânico */}
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(192, 132, 252, 0.15)" }}
          >
            <Moon className="h-7 w-7" style={{ color: "var(--midnight-accent)" }} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold" style={{ color: "var(--midnight-text)" }}>
              Respira. Você não está sozinha nessa madrugada.
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--midnight-text-dim)" }}>
              Um passo de cada vez — sem pressa, sem culpa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPanicOpen(true)}
            className="animate-panic-pulse flex min-h-16 w-full items-center justify-center gap-2 rounded-3xl px-6 text-base font-bold text-white transition-transform active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, var(--midnight-accent-2), var(--midnight-accent))" }}
          >
            Bebê acordou chorando agora? Toque aqui
          </button>
        </div>

        {/* Seção 1 — Mini-podcast / playlist de Pílulas de Áudio */}
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-base font-bold" style={{ color: "var(--midnight-text)" }}>
            Pílulas de áudio para essa fase
          </h2>
          <div className="flex flex-col gap-2.5">
            {PLAYLIST_TRACKS.map((track) => (
              <AudioPill
                key={track.id}
                id={track.id}
                title={track.title}
                subtitle={track.subtitle}
                durationLabel={track.durationLabel}
                hasAudio={track.hasAudio}
                isPlaying={playingId === track.id}
                progress={progressById[track.id] ?? 0}
                onRequestPlay={requestPlay}
                onRegisterAudio={registerAudio}
              />
            ))}
          </div>
        </section>

        {/* Seção 2 — Rastreador de pequenas vitórias (gamificação leve) */}
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-base font-bold" style={{ color: "var(--midnight-text)" }}>
            Suas pequenas vitórias
          </h2>
          <div className="flex flex-col gap-3">
            {WEANING_WEEKS.map((week) => {
              const daysChecked = weekProgress[week.key]?.filter(Boolean).length ?? 0;
              return (
                <div
                  key={week.key}
                  className="rounded-2xl p-4"
                  style={{ background: "var(--midnight-bg-elevated)", border: "1px solid var(--midnight-border)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-heading text-sm font-bold" style={{ color: "var(--midnight-text)" }}>
                        {week.title}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--midnight-text-dim)" }}>
                        {week.subtitle}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                      style={{ background: "rgba(192, 132, 252, 0.15)", color: "var(--midnight-accent)" }}
                    >
                      {daysChecked}/7
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <DayCircle
                        key={dayIndex}
                        checked={weekProgress[week.key]?.[dayIndex] ?? false}
                        celebrating={celebratingKey === `${week.key}-${dayIndex}`}
                        onToggle={() => toggleDay(week.key, dayIndex)}
                        label={`${week.title} — dia ${dayIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-center text-[11px] leading-relaxed" style={{ color: "var(--midnight-text-dim)" }}>
          Este conteúdo é um apoio emocional e educativo, não substitui orientação de um pediatra
          ou consultora de amamentação.
        </p>
      </div>

      {/* Modal do Botão de Pânico */}
      {panicOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6 backdrop-blur-sm"
          onClick={closePanicModal}
        >
          <div
            className="animate-scale-in w-full max-w-sm rounded-3xl p-5"
            style={{ background: "var(--midnight-bg-elevated)", border: "1px solid var(--midnight-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--midnight-accent)" }}>
                Agora, com você
              </span>
              <button
                type="button"
                onClick={closePanicModal}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "rgba(226, 232, 240, 0.1)" }}
              >
                <X className="h-4 w-4" style={{ color: "var(--midnight-text)" }} strokeWidth={2} />
              </button>
            </div>

            <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--midnight-text)" }}>
              Toque em play e siga a instrução com o bebê no colo. Você não precisa fazer nada
              além de ouvir agora.
            </p>

            <AudioPill
              id={PANIC_TRACK.id}
              title={PANIC_TRACK.title}
              subtitle={PANIC_TRACK.subtitle}
              durationLabel={PANIC_TRACK.durationLabel}
              hasAudio={PANIC_TRACK.hasAudio}
              isPlaying={playingId === PANIC_TRACK.id}
              progress={progressById[PANIC_TRACK.id] ?? 0}
              onRequestPlay={requestPlay}
              onRegisterAudio={registerAudio}
            />
          </div>
        </div>
      )}
    </div>
  );
}
