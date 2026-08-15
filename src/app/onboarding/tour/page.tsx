"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Search, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";

const slides = [
  {
    icon: CalendarDays,
    title: "Cardápio da semana",
    text: "Sugestões de refeições pensadas para a fase do seu bebê, dia a dia.",
  },
  {
    icon: Search,
    title: "Busca de cortes e alimentos",
    text: "Descubra rapidinho se um alimento é seguro e como oferecê-lo.",
  },
  {
    icon: PhoneCall,
    title: "Botão de emergência",
    text: "Orientações imediatas para engasgos, a um toque de distância.",
  },
];

export default function TourPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  function finish() {
    router.push("/app");
  }

  function next() {
    if (step === slides.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  const slide = slides[step];
  const Icon = slide.icon;

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-cream px-6 py-10">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={finish}
          className="min-h-12 px-2 text-base font-semibold text-brown-700/60"
        >
          Pular
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-peach-100">
          <Icon className="h-10 w-10 text-terracotta-600" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">{slide.title}</h1>
        <p className="mt-3 max-w-xs text-lg text-brown-700">{slide.text}</p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <ProgressDots step={3} total={4} />
        </div>
        <div className="mb-4 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-terracotta-500" : "w-1.5 bg-peach-200"
              }`}
            />
          ))}
        </div>
        <Button onClick={next}>
          {step === slides.length - 1 ? "Começar a usar" : "Próximo"}
        </Button>
      </div>
    </main>
  );
}
