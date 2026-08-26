"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { track } from "@/lib/tracking/client";

const MILESTONES = [25, 50, 75] as const;

export function TrackedVsl() {
  const videoUrl = process.env.NEXT_PUBLIC_VSL_URL;
  const fired = useRef(new Set<number>());
  const [placeholderStarted, setPlaceholderStarted] = useState(false);

  if (!videoUrl) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!placeholderStarted) track("vsl_started", { video_id: "offer-v1-placeholder" });
          setPlaceholderStarted(true);
        }}
        aria-label="Reproduzir vídeo de apresentação"
        className="relative flex aspect-video w-full items-center justify-center rounded-3xl bg-gradient-to-br from-brown-900 to-brown-700 shadow-lg transition-transform active:scale-[0.98]"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg">
          <Play className="ml-1 h-7 w-7 fill-current" strokeWidth={0} />
        </span>
      </button>
    );
  }

  return (
    <video
      src={videoUrl}
      controls
      playsInline
      preload="metadata"
      className="aspect-video w-full rounded-3xl bg-brown-900 object-cover shadow-lg"
      onPlay={(event) => track("vsl_started", { video_id: "offer-v1", duration_seconds: Math.round(event.currentTarget.duration || 0) })}
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        const progress = (video.currentTime / video.duration) * 100;
        for (const milestone of MILESTONES) {
          if (progress >= milestone && !fired.current.has(milestone)) {
            fired.current.add(milestone);
            track("vsl_progressed", { video_id: "offer-v1", percent: milestone });
          }
        }
      }}
      onEnded={() => track("vsl_completed", { video_id: "offer-v1" })}
    />
  );
}
