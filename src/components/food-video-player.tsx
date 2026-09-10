"use client";

import { useState } from "react";
import { Play, Sparkles, Users } from "lucide-react";
import { useLocale } from "@/lib/use-locale";

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
  const { locale } = useLocale();
  const es = locale === "es";

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
              <span>{es ? "Animación del Corte Seguro" : "Animação do Corte Seguro"}</span>
            </>
          ) : (
            <>
              <Users className="h-3.5 w-3.5 text-sage-400" />
              <span>{es ? "Video de la Comunidad" : "Vídeo da Comunidade"}</span>
            </>
          )}
        </div>
        {!isMotion && babyAgeMonths && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
            {es ? `Bebé de ${babyAgeMonths} meses` : `Bebê de ${babyAgeMonths} meses`}
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
          {es ? "Tu navegador no admite la reproducción de video." : "Seu navegador não suporta a reprodução de vídeo."}
        </video>
      </div>

      {/* Footer Info */}
      <div className="bg-white/80 px-3.5 py-2 text-[11px] text-brown-700/80">
        {isMotion ? (
          <p>{es ? `Mostrando la técnica de corte recomendada para ${foodName}.` : `Mostrando a técnica de corte recomendada para ${foodName}.`}</p>
        ) : (
          <p>
            {es
              ? "Video real compartido por una familia de la comunidad NutriMama bajo término de autorización."
              : "Vídeo real compartilhado por uma família da comunidade NutriMama sob termo de autorização."}
          </p>
        )}
      </div>
    </div>
  );
}
