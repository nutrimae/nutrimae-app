"use client";

import { useCallback, useRef, useState } from "react";
import { Volume2, Pause, Loader2 } from "lucide-react";

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

  const handleClick = useCallback(async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }

    if (state === "paused" && audioRef.current) {
      await audioRef.current.play();
      setState("playing");
      return;
    }

    // Idle ou first play
    setState("loading");

    try {
      const url = `/api/tts/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}?text=${encodeURIComponent(text)}`;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener("ended", () => setState("idle"));
        audioRef.current.addEventListener("error", () => setState("idle"));
      }

      audioRef.current.src = url;
      await audioRef.current.play();
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
