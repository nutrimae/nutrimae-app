"use client";

import Link from "next/link";
import { ArrowRight, Crown, Lock, Moon, Salad, Snowflake } from "lucide-react";
import { useVipAccess } from "@/lib/use-vip-access";

export function VipContent() {
  const { loading, hasWeaning, hasIntestino, hasBatchCooking } = useVipAccess();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_8px_20px_rgba(217,164,6,0.3)]">
          <Crown className="h-7 w-7 text-white" strokeWidth={2} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Área VIP</h1>
        <p className="max-w-[26ch] text-sm text-brown-700/90">
          Seus apoios extras, prontos para quando você mais precisar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Módulo A: SOS Desmame Noturno */}
        <Link
          href="/app/sos-desmame"
          className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl p-5 transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(145deg, #1a2440, #121a2f)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-400/15">
              <Moon className="h-5 w-5 text-purple-300" strokeWidth={1.75} />
            </div>
            {!loading && !hasWeaning && (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                <Lock className="h-3 w-3" strokeWidth={2} />
                Ainda não incluso
              </span>
            )}
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-white">SOS Desmame Noturno</p>
            <p className="mt-1 text-sm text-white/60">
              Modo Madrugada: botão de pânico, pílulas de áudio e rastreador de vitórias.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-300">
            Abrir
            <ArrowRight className="h-4 w-4 transition-transform group-active:translate-x-0.5" strokeWidth={2} />
          </div>
        </Link>

        {/* Módulo B: Protocolo Intestino Livre */}
        <Link
          href="/app/protocolo-intestino"
          className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-sage-50 to-white p-5 shadow-sm shadow-brown-900/5 transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100">
              <Salad className="h-5 w-5 text-sage-600" strokeWidth={1.75} />
            </div>
            {!loading && !hasIntestino && (
              <span className="flex items-center gap-1 rounded-full bg-brown-900/5 px-2.5 py-1 text-[11px] font-semibold text-brown-700/86">
                <Lock className="h-3 w-3" strokeWidth={2} />
                Ainda não incluso
              </span>
            )}
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-brown-800">Protocolo Intestino Livre</p>
            <p className="mt-1 text-sm text-brown-700/86">
              Semáforo do cocô e 5 receitas laxativas para alívio rápido e natural.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-sage-600">
            Abrir
            <ArrowRight className="h-4 w-4 transition-transform group-active:translate-x-0.5" strokeWidth={2} />
          </div>
        </Link>

        {/* Módulo C: Batch Cooking & Congelamento */}
        <Link
          href="/app/batch-cooking"
          className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm shadow-brown-900/5 transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50">
              <Snowflake className="h-5 w-5 text-primary-500" strokeWidth={1.75} />
            </div>
            {!loading && !hasBatchCooking && (
              <span className="flex items-center gap-1 rounded-full bg-brown-900/5 px-2.5 py-1 text-[11px] font-semibold text-brown-700/86">
                <Lock className="h-3 w-3" strokeWidth={2} />
                Ainda não incluso
              </span>
            )}
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-brown-800">Batch Cooking & Congelamento</p>
            <p className="mt-1 text-sm text-brown-700/86">
              Método de porcionamento, tabela de validade e etiquetas prontas para imprimir.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-500">
            Abrir
            <ArrowRight className="h-4 w-4 transition-transform group-active:translate-x-0.5" strokeWidth={2} />
          </div>
        </Link>
      </div>
    </main>
  );
}
