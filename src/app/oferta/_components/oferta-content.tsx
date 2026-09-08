import dynamic from "next/dynamic";
import { Hero } from "./hero";
import { AgeProvider } from "./age-context";
import { AgeSelector } from "./age-selector";
import { Problem } from "./problem";
import { BeliefBreak } from "./belief-break";
import { FoodDemo } from "./food-demo";
import { AssistantChat } from "./assistant-chat";
import { Inclusions } from "./inclusions";
import { SosHighlight } from "./sos-highlight";
import { Testimonial } from "./testimonial";
import { About } from "./about";
import { Offer } from "./offer";
import { OfertaFooter } from "./footer";
import { ViewContentTracker } from "./view-content-tracker";
import { LazyMount } from "./lazy-mount";

// A única seção abaixo da dobra com JS de verdade (estado do acordeão) —
// as outras (Problem, BeliefBreak, Inclusions, SosHighlight, Testimonial,
// About, Footer) já são Server Components puros, sem bundle nenhum pra
// dividir. Código dividido em chunk à parte + só monta quando a pessoa
// rola até perto (ver LazyMount).
const Faq = dynamic(() => import("./faq").then((mod) => mod.Faq), {
  loading: () => <div className="mx-auto w-full max-w-sm px-5 py-8" aria-hidden="true" />,
});

/**
 * Server Component por padrão — nenhum "use client" aqui. A interatividade
 * fica isolada em componentes menores (Hero, AgeProvider + consumidores,
 * AssistantChat, Faq). Problem/BeliefBreak/Inclusions/SosHighlight/
 * Testimonial/About/Footer são instanciados aqui no server e só "passam
 * por dentro" do client boundary do AgeProvider via children — continuam
 * Server Components de verdade, sem hidratação.
 */
export function OfertaContent() {
  return (
    <main className="flex flex-col overflow-x-hidden">
      <ViewContentTracker />
      <Hero />
      <AgeProvider>
        <AgeSelector />
        <Problem />
        <BeliefBreak />
        <FoodDemo />
        <AssistantChat />
        <Inclusions />
        <SosHighlight />
        <Testimonial />
        <About />
        <Offer />
      </AgeProvider>
      <LazyMount>
        <Faq />
      </LazyMount>
      <OfertaFooter />
    </main>
  );
}
