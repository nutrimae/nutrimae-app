// Catálogo de conteúdo do "SOS Desmame Noturno" (order bump).
// Segue o mesmo padrão de src/lib/audiobooks.ts: `hasAudio` indica se já
// existe narração real gravada em assets/audio/desmame/<id>.mp3 — enquanto
// não existir, o player mostra "Em breve" em vez de quebrar.

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

export function getWeaningTrack(id: string): WeaningTrack | undefined {
  return WEANING_TRACKS.find((t) => t.id === id);
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

export const WEANING_PROGRESS_STORAGE_KEY = "nutrimae_desmame_progress_v1";

export type WeaningProgress = Record<string, boolean[]>;

export function emptyWeaningProgress(): WeaningProgress {
  const progress: WeaningProgress = {};
  for (const week of WEANING_WEEKS) {
    progress[week.key] = Array(7).fill(false);
  }
  return progress;
}
