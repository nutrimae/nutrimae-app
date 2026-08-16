"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Play, Pause, Download, Share2, Star, Gauge, Volume2 } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { useToast } from "@/components/toast-provider";
import { getAudiobook } from "@/lib/audiobooks";
import { getAudiobookRatings, setAudiobookRating } from "@/lib/audiobook-ratings";

const SPEEDS = [0.8, 1, 1.25, 1.5, 2];

export default function AudiobookDetailPage() {
  const params = useParams<{ id: string }>();
  const book = getAudiobook(params.id);
  const { showToast } = useToast();

  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!book) return;
    const rating = getAudiobookRatings()[book.id];
    if (rating) {
      setStars(rating.stars);
      setComment(rating.comment);
    }
  }, [book]);

  if (!book) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <BackButton fallbackHref="/app/audiobooks" />
        <p>Audiobook não encontrado.</p>
      </main>
    );
  }

  function handleAudioAction() {
    showToast("A narração em áudio ainda está em produção — leia o conteúdo abaixo por enquanto.");
  }

  function handleShare() {
    if (!book) return;
    const text = encodeURIComponent(
      `🎧 ${book.title} — ${book.subtitle}\n\nOuça (em breve) ou leia agora no NutriMäe.`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleSaveRating() {
    if (!book) return;
    setAudiobookRating(book.id, { stars, comment });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton fallbackHref="/app/audiobooks" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">{book.title}</h1>
        <p className="mt-1 text-brown-700">{book.subtitle}</p>
      </div>

      {/* Player — infraestrutura pronta, sem áudio real ainda */}
      <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAudioAction}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-200 text-primary-700 opacity-60"
          >
            <Play className="h-6 w-6" strokeWidth={2} fill="currentColor" />
          </button>
          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-sage-100">
              <div className="h-2 w-0 rounded-full bg-primary-400" />
            </div>
            <p className="mt-1 text-xs text-brown-700/60">Narração em produção</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 opacity-60">
          <button type="button" onClick={handleAudioAction} className="flex items-center gap-1 text-sm font-semibold text-brown-700">
            <Gauge className="h-4 w-4" strokeWidth={2} />
            {speed}x
          </button>
          <div className="flex flex-1 items-center gap-2">
            <Volume2 className="h-4 w-4 shrink-0 text-brown-700" strokeWidth={2} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              onClick={handleAudioAction}
              disabled
              className="w-full accent-primary-400"
            />
          </div>
          <button type="button" onClick={handleAudioAction} className="text-brown-700">
            <Download className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-3 flex gap-2 opacity-60">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSpeed(s);
                handleAudioAction();
              }}
              className={`min-h-8 rounded-full px-3 text-xs font-semibold ${
                s === speed ? "bg-primary-500 text-white" : "bg-primary-100 text-brown-700"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
      >
        <Share2 className="h-5 w-5" strokeWidth={2} />
        Compartilhar no WhatsApp
      </button>

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">Transcrição completa</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          {book.transcript.map((segment) => (
            <p key={segment.startSeconds} className="text-brown-800">
              {segment.text}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">Avalie este audiobook</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setStars(value)} className="p-1">
                <Star
                  className={`h-7 w-7 ${value <= stars ? "text-yellow-500" : "text-brown-700/20"}`}
                  strokeWidth={1.75}
                  fill={value <= stars ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário opcional..."
            className="w-full rounded-2xl border-2 border-sage-100 bg-white p-3 text-base text-brown-800 outline-none focus:border-sage-400"
          />
          <button
            type="button"
            onClick={handleSaveRating}
            disabled={stars === 0}
            className="min-h-12 rounded-2xl bg-primary-500 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saved ? "Avaliação salva!" : "Salvar avaliação"}
          </button>
        </div>
      </section>
    </main>
  );
}
