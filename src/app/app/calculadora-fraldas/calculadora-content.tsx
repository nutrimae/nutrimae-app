"use client";

import { useState } from "react";
import { AlertTriangle, PiggyBank, Star, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { estimateDiapers, type DiaperEstimate } from "@/lib/diapers";
import { BackButton } from "@/components/back-button";

type Status = "nascera" | "nasceu";

export function CalculadoraFraldasContent() {
  const [status, setStatus] = useState<Status>("nasceu");
  const [weight, setWeight] = useState("3.5");
  const [result, setResult] = useState<DiaperEstimate | null>(null);

  const [packPrice, setPackPrice] = useState("");
  const [packCount, setPackCount] = useState("");
  const [usesPerDay, setUsesPerDay] = useState(8);

  function handleCalculate() {
    const weightNum = parseFloat(weight.replace(",", "."));
    if (Number.isNaN(weightNum) || weightNum <= 0) return;
    setResult(estimateDiapers(status, weightNum));
  }

  const price = parseFloat(packPrice.replace(",", "."));
  const count = parseFloat(packCount.replace(",", "."));
  const hasPriceInput = !Number.isNaN(price) && price > 0 && !Number.isNaN(count) && count > 0;

  const pricePerDiaper = hasPriceInput ? price / count : 0;
  const daysPerPack = hasPriceInput ? count / usesPerDay : 0;
  const monthlyCost = hasPriceInput ? pricePerDiaper * usesPerDay * 30 : 0;
  const yearlyCost = monthlyCost * 12;

  const priceLevel: "otimo" | "moderado" | "caro" =
    pricePerDiaper < 0.8 ? "otimo" : pricePerDiaper <= 1.5 ? "moderado" : "caro";

  const priceLevelCopy = {
    otimo: { label: "Ótimo preço! Aproveite 🎉", bg: "bg-sage-100", text: "text-sage-700" },
    moderado: { label: "Preço moderado, compare sempre", bg: "bg-yellow-100", text: "text-yellow-800" },
    caro: { label: "Está caro? Procure outras marcas", bg: "bg-red-100", text: "text-red-700" },
  }[priceLevel];

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Calculadora de Fraldas</h1>
        <p className="mt-1 text-brown-700">
          Uma estimativa para planejar as compras sem exagerar em nenhum tamanho.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brown-700">O bebê já nasceu?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("nascera")}
            className={`min-h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
              status === "nascera" ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
            }`}
          >
            Ainda vai nascer
          </button>
          <button
            type="button"
            onClick={() => setStatus("nasceu")}
            className={`min-h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
              status === "nasceu" ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
            }`}
          >
            Já nasceu
          </button>
        </div>
      </div>

      <Input
        id="weight"
        type="number"
        inputMode="decimal"
        label={status === "nascera" ? "Peso estimado ao nascer (kg)" : "Peso atual do bebê (kg)"}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        step="0.1"
        min="1"
        max="30"
      />

      <Button onClick={handleCalculate}>Calcular</Button>

      {result && (
        <>
          <div className="flex items-start gap-3 rounded-2xl bg-sage-50 p-4">
            <PiggyBank className="h-6 w-6 shrink-0 text-sage-600" strokeWidth={2} />
            <div>
              <p className="font-heading font-bold text-brown-800">
                Economia estimada no 1º ano: R$ {result.estimatedSavingsMin} a R$ {result.estimatedSavingsMax}
              </p>
              <p className="mt-1 text-sm text-brown-700">
                Estimativa ilustrativa, comprando no tamanho certo e evitando desperdício.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-red-100 p-4">
            <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" strokeWidth={2} />
            <div>
              <p className="font-heading font-bold text-red-700">Erro clássico</p>
              <p className="mt-1 text-sm text-brown-800">
                Comprar um estoque grande de um tamanho só (geralmente RN ou P) — o bebê cresce
                rápido nos primeiros meses e sobra fralda parada. Compre pouco dos tamanhos
                iniciais e mais do tamanho que dura mais tempo.
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">
              Cronograma estimado por tamanho
            </h2>
            <div className="flex flex-col gap-2">
              {result.schedule.map((row) => {
                const isHighlight = row.key === result.highlightSize;
                return (
                  <div
                    key={row.key}
                    className={`rounded-2xl p-4 ${
                      isHighlight
                        ? "bg-terracotta-500 text-white"
                        : "bg-white/80 text-brown-800 shadow-sm shadow-brown-900/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-heading text-lg font-bold">
                        Tamanho {row.label}
                        {isHighlight && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold">
                            <Star className="h-3.5 w-3.5" strokeWidth={2} fill="currentColor" />
                            foque aqui
                          </span>
                        )}
                      </p>
                      <span className={`text-sm ${isHighlight ? "text-white/80" : "text-brown-700/60"}`}>
                        {row.weightRange}
                      </span>
                    </div>
                    <div
                      className={`mt-2 grid grid-cols-3 gap-2 text-sm ${
                        isHighlight ? "text-white/90" : "text-brown-700"
                      }`}
                    >
                      <div>
                        <p className="font-bold">{row.durationMonths} meses</p>
                        <p className="text-xs opacity-80">duração</p>
                      </div>
                      <div>
                        <p className="font-bold">{row.changesPerDay}/dia</p>
                        <p className="text-xs opacity-80">trocas</p>
                      </div>
                      <div>
                        <p className="font-bold">{row.estimatedPacks} pacotes</p>
                        <p className="text-xs opacity-80">estimado</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="border-t border-sage-100 pt-6">
        <h2 className="mb-1 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <Calculator className="h-5 w-5 text-sage-600" strokeWidth={2} />
          Vale a pena esse pacote?
        </h2>
        <p className="mb-4 text-sm text-brown-700">
          Preencha os dados do pacote que você está de olho e compare o preço por fralda.
        </p>

        <div className="flex flex-col gap-4">
          <Input
            id="pack-price"
            type="number"
            inputMode="decimal"
            label="Preço do pacote (R$)"
            placeholder="Ex.: 45,90"
            value={packPrice}
            onChange={(e) => setPackPrice(e.target.value)}
          />
          <Input
            id="pack-count"
            type="number"
            inputMode="numeric"
            label="Quantas fraldas vêm no pacote"
            placeholder="Ex.: 40"
            value={packCount}
            onChange={(e) => setPackCount(e.target.value)}
          />
          <div>
            <label htmlFor="uses-per-day" className="mb-2 block text-base font-semibold text-brown-700">
              Trocas por dia: {usesPerDay}
            </label>
            <input
              id="uses-per-day"
              type="range"
              min={6}
              max={12}
              value={usesPerDay}
              onChange={(e) => setUsesPerDay(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        {hasPriceInput && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-3xl bg-white/80 p-5 shadow-sm shadow-brown-900/5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-brown-700/60">Preço por fralda</p>
                  <p className="font-heading text-xl font-bold text-brown-800">
                    R$ {pricePerDiaper.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brown-700/60">Um pacote dura</p>
                  <p className="font-heading text-xl font-bold text-brown-800">
                    {Math.round(daysPerPack)} dias
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brown-700/60">Custo mensal</p>
                  <p className="font-heading text-xl font-bold text-brown-800">
                    R$ {monthlyCost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brown-700/60">Custo no 1º ano</p>
                  <p className="font-heading text-xl font-bold text-brown-800">
                    R$ {yearlyCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl ${priceLevelCopy.bg} p-4 text-center`}>
              <p className={`font-heading font-bold ${priceLevelCopy.text}`}>
                {priceLevelCopy.label}
              </p>
            </div>
          </div>
        )}
      </div>

      <MedicalDisclaimerFooter />
    </main>
  );
}
