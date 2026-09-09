"use client";

import { useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

export function LanguageSwitcher({
  locale,
  onChange,
  className = "",
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.key === locale) ?? LOCALES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cambiar idioma / Mudar idioma"
        className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-brown-800 shadow-sm shadow-brown-900/10 backdrop-blur"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.key === "pt-BR" ? "PT" : "ES"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-white shadow-lg shadow-brown-900/15">
            {LOCALES.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => {
                  onChange(l.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                  l.key === locale ? "bg-primary-50 text-primary-700" : "text-brown-800 hover:bg-cream"
                }`}
              >
                <span className="text-lg leading-none">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
