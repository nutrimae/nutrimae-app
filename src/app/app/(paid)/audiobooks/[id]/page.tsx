"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Play, Pause, Download, Share2, Star, Gauge, Volume2 } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { useToast } from "@/components/toast-provider";
import { getAudiobook } from "@/lib/audiobooks";
import { getAudiobookRatings, setAudiobookRating } from "@/lib/audiobook-ratings";

const SPEEDS = [0.8, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudiobookDetailPage() {
  const params = useParams<{ id: string }>();
  const book = getAudiobook(params.id);
  const { showToast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrentTime(audio.currentTime);
  }

  function handleSpeed(s: number) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  function handleVolume(v: number) {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  function handleDownload() {
    if (!book) return;
    const a = document.createElement("a");
    a.href = `/api/audio/${book.id}?download=1`;
    a.download = `nutrimae-${book.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Baixando áudio...");
  }

  function handleShare() {
    if (!book) return;
    const text = encodeURIComponent(
      `🎧 ${book.title} — ${book.subtitle}\n\nOuça agora no NutriMãe.`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleSaveRating() {
    if (!book) return;
    setAudiobookRating(book.id, { stars, comment });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton fallbackHref="/app/audiobooks" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">{book.title}</h1>
        <p className="mt-1 text-brown-700">{book.subtitle}</p>
      </div>

      {book.hasAudio ? (
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <audio
            ref={audioRef}
            src={`/api/audio/${book.id}`}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar" : "Tocar"}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white active:bg-primary-600"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" strokeWidth={2} fill="currentColor" />
              ) : (
                <Play className="h-6 w-6" strokeWidth={2} fill="currentColor" />
              )}
            </button>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-primary-500"
              />
              <p className="mt-1 text-xs text-brown-700/86">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-sm font-semibold text-brown-700">
              <Gauge className="h-4 w-4" strokeWidth={2} />
              {speed}x
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Volume2 className="h-4 w-4 shrink-0 text-brown-700" strokeWidth={2} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => handleVolume(Number(e.target.value))}
                className="w-full accent-primary-400"
              />
            </div>
            <button type="button" onClick={handleDownload} aria-label="Baixar áudio" className="text-brown-700">
              <Download className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeed(s)}
                className={`min-h-8 rounded-full px-3 text-xs font-semibold ${
                  s === speed ? "bg-primary-500 text-white" : "bg-primary-100 text-brown-700"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-yellow-100 p-4 text-sm text-brown-800">
          A narração em áudio deste conteúdo ainda está em produção — leia a transcrição
          completa abaixo por enquanto.
        </div>
      )}

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
