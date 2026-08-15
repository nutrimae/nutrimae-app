"use client";

import { CalendarDays, Search, PhoneCall } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { Card } from "@/components/ui/card";

export default function AppHomePage() {
  const { activeBaby } = useActiveBaby();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Oi! Que bom te ver por aqui. 💛
        </h1>
        <p className="mt-1 text-brown-700">
          {activeBaby
            ? `Acompanhando a introdução alimentar de ${activeBaby.name}.`
            : "Vamos começar."}
        </p>
      </div>

      <Card className="text-center text-brown-700">
        <p>
          Login, cadastro do bebê e onboarding prontos. As funcionalidades abaixo chegam
          nas próximas sessões:
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <Card className="flex items-center gap-4 opacity-60">
          <CalendarDays className="h-8 w-8 shrink-0 text-sage-500" strokeWidth={1.5} />
          <div>
            <p className="font-heading font-bold text-brown-800">Cardápio da semana</p>
            <p className="text-sm text-brown-700/70">Em breve</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 opacity-60">
          <Search className="h-8 w-8 shrink-0 text-sage-500" strokeWidth={1.5} />
          <div>
            <p className="font-heading font-bold text-brown-800">Busca de cortes</p>
            <p className="text-sm text-brown-700/70">Em breve</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 opacity-60">
          <PhoneCall className="h-8 w-8 shrink-0 text-sage-500" strokeWidth={1.5} />
          <div>
            <p className="font-heading font-bold text-brown-800">Botão de emergência</p>
            <p className="text-sm text-brown-700/70">Em breve</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
