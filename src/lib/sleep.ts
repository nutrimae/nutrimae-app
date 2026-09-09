import type { Locale } from "@/lib/i18n/locale";

export type SleepAgeBand = "0-3" | "4-6" | "7-12" | "13+";

export const SLEEP_AGE_BAND_LABEL: Record<SleepAgeBand, string> = {
  "0-3": "0 a 3 meses",
  "4-6": "4 a 6 meses",
  "7-12": "7 a 12 meses",
  "13+": "13 meses ou mais",
};

export const SLEEP_AGE_BAND_LABEL_ES: Record<SleepAgeBand, string> = {
  "0-3": "0 a 3 meses",
  "4-6": "4 a 6 meses",
  "7-12": "7 a 12 meses",
  "13+": "13 meses o más",
};

export function getSleepAgeBandLabel(locale: Locale = "pt-BR"): Record<SleepAgeBand, string> {
  return locale === "es" ? SLEEP_AGE_BAND_LABEL_ES : SLEEP_AGE_BAND_LABEL;
}

/** Janela de sono típica (tempo acordado até a próxima soneca), em minutos. */
export const WAKE_WINDOW_MIN: Record<SleepAgeBand, number> = {
  "0-3": 75,
  "4-6": 120,
  "7-12": 180,
  "13+": 300,
};

export const RITUAL_LEAD_MIN = 15;

export const RITUALS: Record<SleepAgeBand, string[]> = {
  "0-3": [
    "Ambiente com luz baixa alguns minutos antes da soneca",
    "Ruído branco suave para ajudar a desligar",
    "Colo tranquilo, sem estímulos visuais fortes",
  ],
  "4-6": [
    "Banho morno antes da soneca principal",
    "Música calma ou cantiga sempre na mesma ordem",
    "Quarto escurecido para sinalizar hora de dormir",
  ],
  "7-12": [
    "Ritual curto e previsível: banho, livro, música, soneca",
    "Evitar telas pelo menos 30 minutos antes",
    "Manter o mesmo horário todos os dias, mesmo no fim de semana",
  ],
  "13+": [
    "Ritual de 15-20 minutos com etapas sempre na mesma ordem",
    "Escolher um bichinho ou paninho de apego para a soneca",
    "Reduzir estímulos e agitação pelo menos 30 minutos antes",
  ],
};

export const RITUALS_ES: Record<SleepAgeBand, string[]> = {
  "0-3": [
    "Ambiente con poca luz unos minutos antes de la siesta",
    "Ruido blanco suave para ayudar a relajarse",
    "Upa tranquila, sin estímulos visuales fuertes",
  ],
  "4-6": [
    "Baño tibio antes de la siesta principal",
    "Música tranquila o canción siempre en el mismo orden",
    "Habitación oscurecida para indicar la hora de dormir",
  ],
  "7-12": [
    "Ritual corto y predecible: baño, libro, música, siesta",
    "Evitar pantallas al menos 30 minutos antes",
    "Mantener el mismo horario todos los días, incluso los fines de semana",
  ],
  "13+": [
    "Ritual de 15-20 minutos con pasos siempre en el mismo orden",
    "Elegir un peluche o mantita de apego para la siesta",
    "Reducir estímulos y agitación al menos 30 minutos antes",
  ],
};

export function getRituals(locale: Locale = "pt-BR"): Record<SleepAgeBand, string[]> {
  return locale === "es" ? RITUALS_ES : RITUALS;
}

export interface SleepResult {
  wakeTime: Date;
  napTime: Date;
  ritualStartTime: Date;
  windowMinutes: number;
}

export function computeSleepWindow(band: SleepAgeBand, wakeTimeStr: string, today: Date = new Date()): SleepResult {
  const [hours, minutes] = wakeTimeStr.split(":").map(Number);
  const wakeTime = new Date(today);
  wakeTime.setHours(hours, minutes, 0, 0);

  const windowMinutes = WAKE_WINDOW_MIN[band];
  const napTime = new Date(wakeTime.getTime() + windowMinutes * 60000);
  const ritualStartTime = new Date(napTime.getTime() - RITUAL_LEAD_MIN * 60000);

  return { wakeTime, napTime, ritualStartTime, windowMinutes };
}

export function formatTime(date: Date, locale: Locale = "pt-BR"): string {
  return date.toLocaleTimeString(locale === "es" ? "es" : "pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Percentual da janela de sono já decorrido, 0-100, para o indicador circular. */
export function windowProgressPercent(result: SleepResult, now: Date = new Date()): number {
  const elapsed = now.getTime() - result.wakeTime.getTime();
  const total = result.windowMinutes * 60000;
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

// --- Rituais de sono por faixa etária mais granular -----------------------

export type RitualAgeBand = "6-8" | "9-12" | "13-18" | "19-24";

export const RITUAL_AGE_BAND_LABEL: Record<RitualAgeBand, string> = {
  "6-8": "6 a 8 meses",
  "9-12": "9 a 12 meses",
  "13-18": "13 a 18 meses",
  "19-24": "19 a 24 meses",
};

export const RITUAL_AGE_BAND_LABEL_ES: Record<RitualAgeBand, string> = {
  "6-8": "6 a 8 meses",
  "9-12": "9 a 12 meses",
  "13-18": "13 a 18 meses",
  "19-24": "19 a 24 meses",
};

export function getRitualAgeBandLabel(locale: Locale = "pt-BR"): Record<RitualAgeBand, string> {
  return locale === "es" ? RITUAL_AGE_BAND_LABEL_ES : RITUAL_AGE_BAND_LABEL;
}

export const RITUALS_BY_AGE: Record<RitualAgeBand, string[]> = {
  "6-8": [
    "Banho morno 30 minutos antes de dormir",
    "Massagem suave no bebê",
    "Música clássica ou cantiga baixinho",
    "Uma historinha bem curtinha",
    "Luz reduzida no quarto",
  ],
  "9-12": [
    "Banho seguido de uma brincadeira calma",
    "Leitura de 2 a 3 livrinhos",
    "Cantiga de ninar sempre igual",
    "Abraços reconfortantes antes do berço",
    "Rotina no mesmo horário, todos os dias",
  ],
  "13-18": [
    "Banho mais lúdico, sem agitar",
    "Livros com figuras grandes",
    "Alongamento suave antes de deitar",
    "Conversinha sobre como foi o dia",
    "Bichinho ou paninho de apego por perto",
  ],
  "19-24": [
    "Banho interativo, com participação da criança",
    "Contação de uma historinha completa",
    "Conversa sobre sentimentos do dia",
    "Escolha de um objeto de conforto",
    "Despedida com ritual fixo (beijo, luz apagada)",
  ],
};

export const RITUALS_BY_AGE_ES: Record<RitualAgeBand, string[]> = {
  "6-8": [
    "Baño tibio 30 minutos antes de dormir",
    "Masaje suave al bebé",
    "Música clásica o canción de cuna en voz baja",
    "Un cuento bien cortito",
    "Luz reducida en la habitación",
  ],
  "9-12": [
    "Baño seguido de un juego tranquilo",
    "Lectura de 2 a 3 libritos",
    "Canción de cuna siempre igual",
    "Abrazos reconfortantes antes de la cuna",
    "Rutina en el mismo horario, todos los días",
  ],
  "13-18": [
    "Baño más lúdico, sin agitar",
    "Libros con figuras grandes",
    "Estiramiento suave antes de acostarse",
    "Charla breve sobre cómo fue el día",
    "Peluche o mantita de apego cerca",
  ],
  "19-24": [
    "Baño interactivo, con participación del niño",
    "Contar un cuento completo",
    "Conversación sobre los sentimientos del día",
    "Elección de un objeto de consuelo",
    "Despedida con ritual fijo (beso, luz apagada)",
  ],
};

export function getRitualsByAge(locale: Locale = "pt-BR"): Record<RitualAgeBand, string[]> {
  return locale === "es" ? RITUALS_BY_AGE_ES : RITUALS_BY_AGE;
}

export interface SleepHelpTopic {
  title: string;
  text: string;
}

export const SLEEP_HELP_TOPICS: SleepHelpTopic[] = [
  {
    title: "O bebê não dorme à noite",
    text: "Revise a janela de sono e o horário do ritual — muitas vezes o bebê está passando do ponto de cansaço. Troque experiências na Comunidade das Mães.",
  },
  {
    title: "A soneca desapareceu",
    text: "É normal a quantidade de sonecas diminuir com a idade. Ajuste a janela de sono pra faixa etária atual antes de se preocupar.",
  },
  {
    title: "Pesadelos ou choro noturno",
    text: "Episódios ocasionais são comuns no desenvolvimento. Se forem muito frequentes ou intensos, vale conversar com o pediatra.",
  },
];

export const SLEEP_HELP_TOPICS_ES: SleepHelpTopic[] = [
  {
    title: "El bebé no duerme por la noche",
    text: "Revisa la ventana de sueño y el horario del ritual — muchas veces el bebé está pasado de cansancio. Comparte experiencias en la Comunidad de Mamás.",
  },
  {
    title: "La siesta desapareció",
    text: "Es normal que la cantidad de siestas disminuya con la edad. Ajusta la ventana de sueño a la franja etaria actual antes de preocuparte.",
  },
  {
    title: "Pesadillas o llanto nocturno",
    text: "Los episodios ocasionales son comunes en el desarrollo. Si son muy frecuentes o intensos, vale la pena hablar con el pediatra.",
  },
];

export function getSleepHelpTopics(locale: Locale = "pt-BR"): SleepHelpTopic[] {
  return locale === "es" ? SLEEP_HELP_TOPICS_ES : SLEEP_HELP_TOPICS;
}
