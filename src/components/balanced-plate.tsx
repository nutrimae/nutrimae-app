"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PLATE_GROUPS } from "@/lib/plate";

export function BalancedPlate({ triedFoodKeys }: { triedFoodKeys?: Set<string> }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-sm shadow-brown-900/5">
      <h2 className="font-heading text-lg font-bold text-brown-800">Prato balanceado</h2>
      <p className="mt-1 text-sm text-brown-700">
        Como equilibrar as refeições do dia a dia. Toque em cada grupo para ver exemplos.
      </p>

      {/* Prato: barra segmentada proporcional */}
      <div className="mt-4 flex h-10 w-full overflow-hidden rounded-full">
        {PLATE_GROUPS.map((group) => (
          <button
            key={group.key}
            type="button"
            onClick={() => setExpanded(expanded === group.key ? null : group.key)}
            style={{ width: `${group.percent}%`, backgroundColor: group.color }}
            className="flex items-center justify-center text-[10px] font-bold transition-opacity hover:opacity-80"
            title={group.label}
          >
            <span style={{ color: group.textColor }}>{group.percent}%</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {PLATE_GROUPS.map((group) => {
          const isOpen = expanded === group.key;
          return (
            <div key={group.key} className="overflow-hidden rounded-2xl bg-sage-50/60">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : group.key)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="flex-1 font-semibold text-brown-800">{group.label}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-brown-700/60 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
                  <p className="text-sm text-brown-700">{group.description}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {group.examples.map((example) => {
                      const tried = triedFoodKeys?.has(
                        example
                          .normalize("NFD")
                          .replace(/[̀-ͯ]/g, "")
                          .toLowerCase(),
                      );
                      return (
                        <li
                          key={example}
                          className={`rounded-full px-3 py-1 text-sm ${
                            tried ? "bg-sage-100 text-sage-700" : "bg-white text-brown-800"
                          }`}
                        >
                          {example}
                          {tried && " ✓"}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
