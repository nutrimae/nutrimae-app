"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Clock, LifeBuoy } from "lucide-react";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { BackButton } from "@/components/back-button";
import {
  SLEEP_AGE_BAND_LABEL,
  computeSleepWindow,
  formatTime,
  windowProgressPercent,
  RITUAL_AGE_BAND_LABEL,
  RITUALS_BY_AGE,
  SLEEP_HELP_TOPICS,
  type SleepAgeBand,
  type RitualAgeBand,
} from "@/lib/sleep";

const BANDS: SleepAgeBand[] = ["0-3", "4-6", "7-12", "13+"];
const RITUAL_BANDS: RitualAgeBand[] = ["6-8", "9-12", "13-18", "19-24"];

function CircularProgress({ percent }: { percent: number }) {
  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size} className="mx-auto -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--color-sage-100)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--color-terracotta-500)"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{ transformOrigin: "center", fontSize: 28, fontWeight: 700, fill: "var(--color-brown-800)" }}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export function RotinaSonoContent() {
  const [band, setBand] = useState<SleepAgeBand>("4-6");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [now, setNow] = useState(() => new Date());
  const [ritualBand, setRitualBand] = useState<RitualAgeBand>("9-12");

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const result = computeSleepWindow(band, wakeTime);
  const percent = windowProgressPercent(result, now);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Rotina do Sono & Calma</h1>
        <p className="mt-1 text-brown-700">
          Calcule a janela de sono ideal e o melhor horário para a próxima soneca.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brown-700">Faixa etária</p>
        <div className="grid grid-cols-2 gap-2">
          {BANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBand(b)}
              className={`min-h-12 rounded-2xl text-sm font-semibold transition-colors ${
                band === b ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
              }`}
            >
              {SLEEP_AGE_BAND_LABEL[b]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="wake-time" className="mb-2 block text-sm font-semibold text-brown-700">
          Hora que o bebê acordou
        </label>
        <input
          id="wake-time"
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="min-h-14 w-full rounded-2xl border-2 border-sage-100 bg-white px-5 text-lg text-brown-800 outline-none focus:border-sage-400"
        />
      </div>

      <div className="rounded-3xl bg-white/80 p-6 text-center shadow-sm shadow-brown-900/5">
        <CircularProgress percent={percent} />
        <p className="mt-3 text-sm text-brown-700">
          da janela de sono atual já passou
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl bg-sage-50 p-4">
          <Clock className="h-6 w-6 shrink-0 text-sage-600" strokeWidth={2} />
          <div>
            <p className="text-sm text-brown-700/90">Iniciar o ritual às</p>
            <p className="font-heading text-lg font-bold text-brown-800">
              {formatTime(result.ritualStartTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-peach-100 p-4">
          <Moon className="h-6 w-6 shrink-0 text-terracotta-600" strokeWidth={2} />
          <div>
            <p className="text-sm text-brown-700/90">Próxima soneca por volta de</p>
            <p className="font-heading text-lg font-bold text-brown-800">
              {formatTime(result.napTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-sage-100 pt-6">
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">
          Rituais de sono por idade
        </h2>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {RITUAL_BANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setRitualBand(b)}
              className={`min-h-11 rounded-2xl text-sm font-semibold transition-colors ${
                ritualBand === b ? "bg-primary-500 text-white" : "bg-primary-100 text-brown-700"
              }`}
            >
              {RITUAL_AGE_BAND_LABEL[b]}
            </button>
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {RITUALS_BY_AGE[ritualBand].map((r) => (
            <li key={r} className="flex gap-3 rounded-2xl bg-white/80 p-3 text-brown-800 shadow-sm shadow-brown-900/5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sage-500" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-sage-100 pt-6">
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">
          Problema? Procure ajuda
        </h2>
        <div className="flex flex-col gap-2">
          {SLEEP_HELP_TOPICS.map((topic) => (
            <div key={topic.title} className="rounded-2xl bg-sage-50 p-4">
              <p className="font-semibold text-brown-800">{topic.title}</p>
              <p className="mt-1 text-sm text-brown-700">{topic.text}</p>
            </div>
          ))}
        </div>
        <Link href="/app/suporte" className="mt-3 block">
          <div className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-semibold text-white">
            <LifeBuoy className="h-4 w-4" strokeWidth={2} />
            Fale com a nossa equipe
          </div>
        </Link>
      </div>

      <MedicalDisclaimerFooter />
    </main>
  );
}
