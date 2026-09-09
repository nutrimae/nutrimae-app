// Catálogo de conteúdo do "SOS Desmame Noturno" (order bump).
// Segue o mesmo padrão de src/lib/audiobooks.ts: `hasAudio` indica se já
// existe narração real gravada em assets/audio/desmame/<id>.mp3 — enquanto
// não existir, o player mostra "Em breve" em vez de quebrar.

import type { Locale } from "@/lib/i18n/locale";

export interface WeaningTrack {
  id: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  hasAudio: boolean;
}

// Primeira faixa: instrução curta tocada pelo "Botão de Pânico" (madrugada,
// bebê chorando agora). As demais compõem o mini-podcast da playlist normal.
export const PANIC_TRACK_ID = "instrucao-imediata";

export const WEANING_TRACKS: WeaningTrack[] = [
  {
    id: PANIC_TRACK_ID,
    title: "Respire — o passo a passo de agora",
    subtitle: "2 minutos de instrução direta para o choro desta madrugada",
    durationLabel: "2 min",
    hasAudio: true,
  },
  {
    id: "tecnica-da-reducao",
    title: "A técnica da redução gradual",
    subtitle: "Como diminuir o tempo de mamada aos poucos, sem trauma",
    durationLabel: "4 min",
    hasAudio: true,
  },
  {
    id: "acalmar-sem-peito",
    title: "Como acalmar sem o peito",
    subtitle: "Alternativas de colo, embalo e voz para substituir a mamada",
    durationLabel: "3 min",
    hasAudio: true,
  },
  {
    id: "recaidas-de-madrugada",
    title: "Recaídas de madrugada são normais",
    subtitle: "O que fazer quando uma noite foge do plano",
    durationLabel: "3 min",
    hasAudio: true,
  },
  {
    id: "papel-do-parceiro",
    title: "O papel do parceiro nessa fase",
    subtitle: "Como dividir a madrugada sem depender só de você",
    durationLabel: "2 min",
    hasAudio: true,
  },
];

export const WEANING_TRACKS_ES: WeaningTrack[] = [
  {
    id: PANIC_TRACK_ID,
    title: "Respira — los pasos a seguir ahora",
    subtitle: "2 minutos de instrucción directa para el llanto de esta madrugada",
    durationLabel: "2 min",
    hasAudio: true,
  },
  {
    id: "tecnica-da-reducao",
    title: "La técnica de la reducción gradual",
    subtitle: "Cómo disminuir el tiempo de mamada poco a poco, sin trauma",
    durationLabel: "4 min",
    hasAudio: true,
  },
  {
    id: "acalmar-sem-peito",
    title: "Cómo calmar sin el pecho",
    subtitle: "Alternativas de upa, arrullo y voz para reemplazar la mamada",
    durationLabel: "3 min",
    hasAudio: true,
  },
  {
    id: "recaidas-de-madrugada",
    title: "Las recaídas de madrugada son normales",
    subtitle: "Qué hacer cuando una noche se escapa del plan",
    durationLabel: "3 min",
    hasAudio: true,
  },
  {
    id: "papel-do-parceiro",
    title: "El rol de la pareja en esta etapa",
    subtitle: "Cómo repartir la madrugada sin depender solo de ti",
    durationLabel: "2 min",
    hasAudio: true,
  },
];

export function getWeaningTracks(locale: Locale = "pt-BR"): WeaningTrack[] {
  return locale === "es" ? WEANING_TRACKS_ES : WEANING_TRACKS;
}

export function getWeaningTrack(id: string, locale: Locale = "pt-BR"): WeaningTrack | undefined {
  return getWeaningTracks(locale).find((t) => t.id === id);
}

export interface WeaningWeek {
  key: string;
  title: string;
  subtitle: string;
}

// 3 blocos semanais em vez de uma timeline de 21 dias corridos — menos
// ansiedade visual, mesma cobertura (3 × 7 = 21 dias).
export const WEANING_WEEKS: WeaningWeek[] = [
  { key: "week-1", title: "Semana 1: A Preparação", subtitle: "Observar rotina e escolher a primeira mamada a reduzir" },
  { key: "week-2", title: "Semana 2: A Redução", subtitle: "Diminuir o tempo de mamada noturna, um pouco por dia" },
  { key: "week-3", title: "Semana 3: A Consolidação", subtitle: "Firmar a nova rotina de sono sem o peito" },
];

export const WEANING_WEEKS_ES: WeaningWeek[] = [
  { key: "week-1", title: "Semana 1: La Preparación", subtitle: "Observar la rutina y elegir la primera mamada a reducir" },
  { key: "week-2", title: "Semana 2: La Reducción", subtitle: "Disminuir el tiempo de mamada nocturna, un poco cada día" },
  { key: "week-3", title: "Semana 3: La Consolidación", subtitle: "Afirmar la nueva rutina de sueño sin el pecho" },
];

export function getWeaningWeeks(locale: Locale = "pt-BR"): WeaningWeek[] {
  return locale === "es" ? WEANING_WEEKS_ES : WEANING_WEEKS;
}

export const WEANING_PROGRESS_STORAGE_KEY = "nutrimae_desmame_progress_v1";

export type WeaningProgress = Record<string, boolean[]>;

export function emptyWeaningProgress(locale: Locale = "pt-BR"): WeaningProgress {
  const progress: WeaningProgress = {};
  for (const week of getWeaningWeeks(locale)) {
    progress[week.key] = Array(7).fill(false);
  }
  return progress;
}
