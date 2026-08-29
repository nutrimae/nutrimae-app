"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Pause, Loader2 } from "lucide-react";

// Compartilhado entre TODAS as instâncias de ListenButton na página — garante
// que só um áudio toca por vez (clicar em "Ouvir" num outro cartão pausa o
// anterior) e serve de referência única pra saber qual instância parar.
let currentlyPlaying: HTMLAudioElement | null = null;

interface ListenButtonProps {
  /** Tipo de conteúdo (food, recipe, sos, allergy). */
  contentType: "food" | "recipe" | "sos" | "allergy";
  /** ID único do conteúdo. */
  contentId: string;
  /** Texto EXATO a ser narrado — deve ser idêntico ao exibido na tela. */
  text: string;
  /** Classes CSS adicionais. */
  className?: string;
}

type PlayState = "idle" | "loading" | "playing" | "paused";

/**
 * Botão "Ouvir" reutilizável. Toca o áudio TTS do conteúdo.
 *
 * O texto passado via prop `text` é EXATAMENTE o mesmo texto
 * revisado exibido na tela — nunca uma paráfrase.
 */
export function ListenButton({ contentType, contentId, text, className = "" }: ListenButtonProps) {
  const [state, setState] = useState<PlayState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ao desmontar (ex.: usuária clica em "voltar" e a tela muda), para o
  // áudio em vez de deixá-lo tocando "fantasma" em segundo plano — era isso
  // que causava duas vozes sobrepostas ao clicar em "Ouvir" de novo depois.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (currentlyPlaying === audioRef.current) {
        currentlyPlaying = null;
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }

    if (state === "paused" && audioRef.current) {
      if (currentlyPlaying && currentlyPlaying !== audioRef.current) currentlyPlaying.pause();
      await audioRef.current.play();
      currentlyPlaying = audioRef.current;
      setState("playing");
      return;
    }

    // Idle ou first play
    setState("loading");

    try {
      const url = `/api/tts/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}?text=${encodeURIComponent(text)}`;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener("ended", () => {
          setState("idle");
          if (currentlyPlaying === audioRef.current) currentlyPlaying = null;
        });
        audioRef.current.addEventListener("error", () => {
          setState("idle");
          if (currentlyPlaying === audioRef.current) currentlyPlaying = null;
        });
      }

      if (currentlyPlaying && currentlyPlaying !== audioRef.current) currentlyPlaying.pause();

      audioRef.current.src = url;
      await audioRef.current.play();
      currentlyPlaying = audioRef.current;
      setState("playing");
    } catch {
      setState("idle");
    }
  }, [state, contentType, contentId, text]);

  const Icon = state === "loading" ? Loader2 : state === "playing" ? Pause : Volume2;
  const label =
    state === "loading"
      ? "Carregando áudio..."
      : state === "playing"
        ? "Pausar"
        : state === "paused"
          ? "Continuar ouvindo"
          : "Ouvir";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-xl bg-primary-100 px-3 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-200 active:bg-primary-300 disabled:opacity-60 ${className}`}
    >
      <Icon
        className={`h-4 w-4 ${state === "loading" ? "animate-spin" : ""}`}
        strokeWidth={2}
      />
      <span>{state === "idle" ? "Ouvir" : state === "loading" ? "Carregando..." : state === "playing" ? "Pausar" : "Continuar"}</span>
    </button>
  );
}
