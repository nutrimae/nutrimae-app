export type DiaperSize = "RN" | "P" | "M" | "G" | "XG";

export interface DiaperSizeInfo {
  key: DiaperSize;
  label: string;
  weightRange: string;
  maxWeightKg: number | null;
  durationMonths: number;
  changesPerDay: number;
}

export const DIAPER_SIZES: DiaperSizeInfo[] = [
  { key: "RN", label: "RN", weightRange: "até 4kg", maxWeightKg: 4, durationMonths: 1, changesPerDay: 10 },
  { key: "P", label: "P", weightRange: "4 a 6kg", maxWeightKg: 6, durationMonths: 3, changesPerDay: 9 },
  { key: "M", label: "M", weightRange: "6 a 9kg", maxWeightKg: 9, durationMonths: 4, changesPerDay: 7 },
  { key: "G", label: "G", weightRange: "9 a 12kg", maxWeightKg: 12, durationMonths: 6, changesPerDay: 6 },
  { key: "XG", label: "XG", weightRange: "acima de 12kg", maxWeightKg: null, durationMonths: 10, changesPerDay: 5 },
];

const DIAPERS_PER_PACK = 30;
const AVG_BIRTH_WEIGHT_KG = 3.2;

export function sizeForWeight(weightKg: number): DiaperSize {
  for (const size of DIAPER_SIZES) {
    if (size.maxWeightKg === null || weightKg <= size.maxWeightKg) return size.key;
  }
  return "XG";
}

export interface ScheduleRow extends DiaperSizeInfo {
  estimatedPacks: number;
}

export function buildSchedule(startingSize: DiaperSize): ScheduleRow[] {
  const startIndex = DIAPER_SIZES.findIndex((s) => s.key === startingSize);
  return DIAPER_SIZES.slice(startIndex).map((size) => ({
    ...size,
    estimatedPacks: Math.ceil((size.changesPerDay * size.durationMonths * 30) / DIAPERS_PER_PACK),
  }));
}

export function longestDurationSize(schedule: ScheduleRow[]): DiaperSize {
  return schedule.reduce((longest, row) => (row.durationMonths > longest.durationMonths ? row : longest))
    .key;
}

export interface DiaperEstimate {
  startingSize: DiaperSize;
  schedule: ScheduleRow[];
  highlightSize: DiaperSize;
  estimatedSavingsMin: number;
  estimatedSavingsMax: number;
}

export function estimateDiapers(status: "nascera" | "nasceu", weightKg: number): DiaperEstimate {
  const effectiveWeight = status === "nascera" ? AVG_BIRTH_WEIGHT_KG : weightKg;
  const startingSize = sizeForWeight(effectiveWeight);
  const schedule = buildSchedule(startingSize);
  const highlightSize = longestDurationSize(schedule);

  return {
    startingSize,
    schedule,
    highlightSize,
    estimatedSavingsMin: 350,
    estimatedSavingsMax: 600,
  };
}
