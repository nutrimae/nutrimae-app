"use client";

import { useEffect } from "react";
import { trackEvent } from "./track";

/** Componente client mínimo só pra disparar o ViewContent no mount — não
    precisa arrastar o resto da página pro bundle client por causa disso. */
export function ViewContentTracker() {
  useEffect(() => {
    trackEvent("ViewContent", { page: "oferta" });
  }, []);
  return null;
}
