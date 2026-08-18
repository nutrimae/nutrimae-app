"use client";

import { useEffect, useState } from "react";
import { Hero } from "./hero";
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
import { Faq } from "./faq";
import { OfertaFooter } from "./footer";
import { DEFAULT_AGE_KEY, getAgeOption, type AgeKey } from "./data";
import { trackEvent } from "./track";
import { scrollToSection } from "./scroll";

export function OfertaContent() {
  const [ageKey, setAgeKey] = useState<AgeKey>(DEFAULT_AGE_KEY);
  const ageOption = getAgeOption(ageKey);

  useEffect(() => {
    trackEvent("ViewContent", { page: "oferta" });
  }, []);

  function handleAssistantFinish() {
    trackEvent("AssistantFinish");
    scrollToSection("oferta");
  }

  return (
    <main className="flex flex-col">
      <Hero />
      <AgeSelector selected={ageKey} onSelect={setAgeKey} />
      <Problem />
      <BeliefBreak />
      <FoodDemo ageOption={ageOption} />
      <AssistantChat onFinish={handleAssistantFinish} />
      <Inclusions />
      <SosHighlight />
      <Testimonial />
      <About />
      <Offer onboardingMonths={ageOption.onboardingMonths} />
      <Faq />
      <OfertaFooter />
    </main>
  );
}
