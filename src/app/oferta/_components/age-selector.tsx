"use client";

import { AGE_OPTIONS, getAgeOption, type AgeKey } from "./data";
import { trackEvent } from "./track";
import { scrollToSection } from "./scroll";

export function AgeSelector({
  selected,
  onSelect,
}: {
  selected: AgeKey;
  onSelect: (key: AgeKey) => void;
}) {
  const selectedOption = getAgeOption(selected);

  function handleSelect(key: AgeKey) {
    onSelect(key);
    trackEvent("AgeSelected", { age: key });
  }

  return (
    <section id="fase" className="mx-auto w-full max-w-sm px-5 py-8">
      <h2 className="text-center font-heading text-xl font-bold text-brown-800">
        Em que fase vocês estão?
      </h2>
      <p className="mt-1 text-center text-sm text-brown-700/70">
        O card logo abaixo muda de acordo com a fase escolhida.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {AGE_OPTIONS.map((option) => {
          const isSelected = option.key === selected;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleSelect(option.key)}
              aria-pressed={isSelected}
              className={`min-h-14 rounded-2xl border-2 px-3 text-sm font-semibold transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
                isSelected
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-transparent bg-cream-deep text-brown-800 hover:border-primary-300 hover:bg-primary-100"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollToSection("oferta")}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-primary-500 px-4 text-center text-sm font-bold text-primary-600"
      >
        {selectedOption.ctaLabel}
      </button>
    </section>
  );
}
