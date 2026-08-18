"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main
      className="flex min-h-dvh flex-col justify-between px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-15" />

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-splash-logo mb-4">
          <Image
            src="/nutrimae-logo.png"
            alt="NutriMãe"
            width={240}
            height={240}
            priority
            className="h-44 w-44 object-contain drop-shadow-[0_16px_40px_rgba(255,107,157,0.25)]"
          />
        </div>
        <h1 className="animate-fade-in-up font-heading text-3xl font-bold text-brown-800">
          Bem-vinda ao NutriMãe
        </h1>
        <p className="animate-fade-in-up mt-3 max-w-xs text-base leading-relaxed text-brown-700/80" style={{ animationDelay: "0.1s" }}>
          Vamos deixar tudo pronto para acompanhar a introdução alimentar do seu bebê, com calma.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="mb-6">
          <ProgressDots step={0} total={5} />
        </div>
        <Button variant="brand" onClick={() => router.push("/onboarding/baby")}>Vamos começar</Button>
      </div>
    </main>
  );
}
