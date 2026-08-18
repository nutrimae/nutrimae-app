import type { ReactNode } from "react";

/**
 * Layout isolado do funil de checkout (upsell/downsell de 1 clique):
 * sem BottomNav, sem Sidebar, sem menu do app — a pessoa só tem as saídas
 * explícitas da própria tela (comprar ou recusar), nunca uma navegação
 * escondida atrás de um menu.
 *
 * Não redeclara <html>/<body>: isso já vem do layout raiz
 * (src/app/layout.tsx) e um layout aninhado não pode declarar outro
 * <body> — seria HTML inválido. Este layout só remove o "chrome" do app
 * (nav/sidebar) que o layout raiz não inclui de qualquer forma; ele existe
 * para deixar explícito, para quem mexer nesta pasta depois, que nenhum
 * componente de navegação deve ser adicionado aqui.
 */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
