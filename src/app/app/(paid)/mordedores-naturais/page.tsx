"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Share2, ShieldAlert, Thermometer } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import {
  TEETHER_CATEGORY_LABEL,
  TEETHERS,
  TEETHING_NORMAL_SIGNS,
  TEETHING_WARNING_SIGNS,
  teethersForActiveTeething,
  type Teether,
} from "@/lib/teethers";

export default function MordedoresNaturaisPage() {
  const [activeTeethingOnly, setActiveTeethingOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const list = useMemo(
    () => (activeTeethingOnly ? teethersForActiveTeething() : TEETHERS),
    [activeTeethingOnly],
  );

  function handleShare(teether: Teether) {
    const text = encodeURIComponent(
      `🦷 ${teether.name} como mordedor natural\n\n` +
        `Preparo: ${teether.prep}\n` +
        `Duração máxima: ${teether.maxDurationMinutes} min\n` +
        `Segurança: ${teether.safety}\n\n` +
        `Guia completo de mordedores no NutriMäe 💚`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Mordedores Naturais</h1>
        <p className="mt-1 text-brown-700">
          15 opções naturais e seguras para aliviar o desconforto da erupção dos dentinhos.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-terracotta-500/10 p-4">
        <ShieldAlert className="h-5 w-5 shrink-0 text-terracotta-600" strokeWidth={2} />
        <p className="text-sm text-brown-800">
          Sempre supervisione o bebê enquanto ele usa qualquer mordedor, do início ao fim —
          nunca deixe sozinho, mesmo por poucos segundos.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setActiveTeethingOnly((v) => !v)}
        className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-colors ${
          activeTeethingOnly ? "bg-primary-500 text-white" : "bg-primary-100 text-primary-700"
        }`}
      >
        <Thermometer className="h-5 w-5" strokeWidth={2} />
        {activeTeethingOnly ? "Mostrando só os melhores para agora" : "Meu bebê tem teething agora"}
      </button>

      <div className="flex flex-col gap-2">
        {list.map((teether) => {
          const isOpen = expandedId === teether.id;
          return (
            <div key={teether.id} className="rounded-2xl bg-white/80 shadow-sm shadow-brown-900/5">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : teether.id)}
                className="flex min-h-16 w-full items-center gap-3 px-4 text-left"
              >
                <span className="text-2xl">{teether.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-brown-800">{teether.name}</p>
                  <p className="text-xs text-brown-700/60">
                    {TEETHER_CATEGORY_LABEL[teether.category]} · a partir de {teether.minAgeMonths}m
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-brown-700/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                />
              </button>
              {isOpen && (
                <div className="flex flex-col gap-3 px-4 pb-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-sage-50 px-2 py-1 font-semibold text-sage-700">
                      🌡️ {teether.temperature}
                    </span>
                    <span className="rounded-full bg-sage-50 px-2 py-1 font-semibold text-sage-700">
                      ⏱️ até {teether.maxDurationMinutes} min por vez
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-sage-600">Preparo</p>
                    <p className="text-sm text-brown-800">{teether.prep}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-sage-600">Como oferecer</p>
                    <p className="text-sm text-brown-800">{teether.howToOffer}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-sage-600">Benefícios</p>
                    <p className="text-sm text-brown-800">{teether.benefits}</p>
                  </div>
                  <div className="flex gap-2 rounded-2xl bg-yellow-100 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-700" strokeWidth={2} />
                    <p className="text-sm text-brown-800">{teether.safety}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleShare(teether)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-sage-200 text-sm font-semibold text-sage-700"
                  >
                    <Share2 className="h-4 w-4" strokeWidth={2} />
                    Compartilhar no WhatsApp
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sage-50 text-sm font-semibold text-sage-700"
      >
        {showTable ? "Fechar tabela comparativa" : "Ver tabela comparativa: qual escolher?"}
      </button>

      {showTable && (
        <div className="overflow-x-auto rounded-2xl bg-white/80 p-3 shadow-sm shadow-brown-900/5">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="text-brown-700/60">
                <th className="p-2">Mordedor</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Idade mín.</th>
                <th className="p-2">Duração</th>
                <th className="p-2">Bom p/ crise ativa</th>
              </tr>
            </thead>
            <tbody>
              {TEETHERS.map((t) => (
                <tr key={t.id} className="border-t border-sage-50">
                  <td className="p-2 font-semibold text-brown-800">{t.emoji} {t.name}</td>
                  <td className="p-2 text-brown-700">{TEETHER_CATEGORY_LABEL[t.category]}</td>
                  <td className="p-2 text-brown-700">{t.minAgeMonths}m</td>
                  <td className="p-2 text-brown-700">{t.maxDurationMinutes} min</td>
                  <td className="p-2">
                    {t.goodForActiveTeething ? (
                      <CheckCircle2 className="h-4 w-4 text-sage-600" strokeWidth={2} />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <CheckCircle2 className="h-5 w-5 text-sage-600" strokeWidth={2} />
          Sinais normais de teething
        </h2>
        <div className="flex flex-col gap-2">
          {TEETHING_NORMAL_SIGNS.map((sign) => (
            <div key={sign} className="flex items-center gap-3 rounded-2xl bg-sage-50 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-500" strokeWidth={2} />
              <span className="text-brown-800">{sign}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-red-700">
          <AlertTriangle className="h-5 w-5" strokeWidth={2} />
          Quando NÃO é só teething
        </h2>
        <div className="flex flex-col gap-2">
          {TEETHING_WARNING_SIGNS.map((sign) => (
            <div key={sign} className="flex items-center gap-3 rounded-2xl bg-red-100 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
              <span className="text-brown-800">{sign}</span>
            </div>
          ))}
        </div>
      </section>

      <MedicalDisclaimerFooter />
    </main>
  );
}
