"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Só monta `children` quando a seção chega perto da tela — usado só para
 * seções client-side com JS de verdade (ex.: FAQ). Não vale a pena
 * envolver Server Components aqui: eles já não têm bundle nenhum pra
 * adiar, então o wrapper só adicionaria overhead sem ganho.
 *
 * Nunca confiar em só `'IntersectionObserver' in window` — em alguns
 * navegadores in-app (tráfego de anúncio) a propriedade existe mas não é
 * um construtor utilizável, e o `new` lançaria um erro. Por isso o
 * try/catch: se o observer falhar por qualquer motivo, mostra o conteúdo
 * direto em vez de escondê-lo pra sempre.
 */
export function LazyMount({ children, rootMargin = "200px" }: { children: ReactNode; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Sempre começa `false` — igual no server e na primeira renderização do
  // client. Decidir isso durante a renderização (ex.: checando
  // `typeof IntersectionObserver` num lazy initializer) causaria mismatch
  // de hidratação, já que esse global não existe no server.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") {
      // Adia pra fora do corpo síncrono do efeito (regra do react-hooks).
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin },
      );
      observer.observe(el);
      return () => observer.disconnect();
    } catch {
      // Construtor presente mas inutilizável (alguns navegadores in-app) —
      // mostra o conteúdo direto em vez de escondê-lo pra sempre.
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
  }, [visible, rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
}
