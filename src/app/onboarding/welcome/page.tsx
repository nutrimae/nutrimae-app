"use client";

import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-cream px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-peach-100">
          <Sprout className="h-10 w-10 text-terracotta-600" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-brown-800">
          Bem-vinda ao NutriMäe
        </h1>
        <p className="mt-3 max-w-xs text-lg text-brown-700">
          Vamos deixar tudo pronto para acompanhar a introdução alimentar do seu bebê,
          com calma.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <ProgressDots step={0} total={4} />
        </div>
        <Button onClick={() => router.push("/onboarding/baby")}>Vamos começar</Button>
      </div>
    </main>
  );
}
