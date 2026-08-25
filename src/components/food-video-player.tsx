"use client";

import { useState } from "react";
import { Play, Sparkles, Users } from "lucide-react";

interface FoodVideoPlayerProps {
  videoUrl?: string | null;
  videoTipo?: "motion_graphic" | "comunidade" | null;
  babyAgeMonths?: number | null;
  foodName: string;
}

export function FoodVideoPlayer({
  videoUrl,
  videoTipo,
  babyAgeMonths,
  foodName,
}: FoodVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl) {
    return null;
  }

  const isMotion = videoTipo === "motion_graphic";

  return (
    <div className="mb-5 overflow-hidden rounded-2xl bg-brown-900/5 shadow-sm">
      {/* Video Badge Header */}
      <div className="flex items-center justify-between bg-brown-900 px-3.5 py-2 text-white">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {isMotion ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Animação do Corte Seguro</span>
            </>
          ) : (
            <>
              <Users className="h-3.5 w-3.5 text-sage-400" />
              <span>Vídeo da Comunidade</span>
            </>
          )}
        </div>
        {!isMotion && babyAgeMonths && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
            Bebê de {babyAgeMonths} meses
          </span>
        )}
      </div>

      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black">
        <video
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          className="h-full w-full object-contain"
        >
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      </div>

      {/* Footer Info */}
      <div className="bg-white/80 px-3.5 py-2 text-[11px] text-brown-700/80">
        {isMotion ? (
          <p>Mostrando a técnica de corte recomendada para {foodName}.</p>
        ) : (
          <p>
            Vídeo real compartilhado por uma família da comunidade NutriMãe sob termo de autorização.
          </p>
        )}
      </div>
    </div>
  );
}
