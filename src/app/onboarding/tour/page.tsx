"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Search, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";

const slides = [
  {
    icon: CalendarDays,
    title: "Cardápio da semana",
    text: "Sugestões de refeições pensadas para a fase do seu bebê, dia a dia.",
    gradient: "from-sage-50 to-white",
    iconColor: "text-sage-600",
  },
  {
    icon: Search,
    title: "Busca de cortes e alimentos",
    text: "Descubra rapidinho se um alimento é seguro e como oferecê-lo.",
    gradient: "from-primary-50 to-white",
    iconColor: "text-primary-600",
  },
  {
    icon: PhoneCall,
    title: "Botão de emergência",
    text: "Orientações imediatas para engasgos, a um toque de distância.",
    gradient: "from-red-50 to-white",
    iconColor: "text-red-500",
  },
];

export default function TourPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  function finish() {
    router.push("/app/cardapio");
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
    <main className="flex min-h-dvh flex-col justify-between px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={finish}
          className="min-h-11 px-2 text-sm font-semibold text-brown-700/40 transition-colors hover:text-brown-700/60"
        >
          Pular
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-4">
          <Image
            src="/nutrimae-logo.png"
            alt=""
            width={64}
            height={64}
            className="h-12 w-12 object-contain opacity-30"
          />
        </div>
        <div className={`animate-scale-in mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.gradient} shadow-subtle`} key={step}>
          <Icon className={`h-9 w-9 ${slide.iconColor}`} strokeWidth={1.5} />
        </div>
        <h1 className="animate-fade-in-up font-heading text-2xl font-bold text-brown-800" key={`t-${step}`}>{slide.title}</h1>
        <p className="animate-fade-in-up mt-3 max-w-xs text-base leading-relaxed text-brown-700/70" key={`d-${step}`} style={{ animationDelay: "0.05s" }}>{slide.text}</p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <ProgressDots step={4} total={5} />
        </div>
        <div className="mb-4 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary-500" : "w-1.5 bg-primary-100"
              }`}
            />
          ))}
        </div>
        <Button onClick={next} variant="brand">
          {step === slides.length - 1 ? "Começar a usar" : "Próximo"}
        </Button>
      </div>
    </main>
  );
}
