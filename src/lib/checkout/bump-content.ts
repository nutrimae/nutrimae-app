/**
 * Imagem/descrição dos order bumps — compartilhado entre o checkout de
 * pagamento único (Anual) e o de assinatura (Mensal), pra nunca divergir
 * entre as duas telas.
 */
export const BUMP_IMAGES: Record<string, string> = {
  "batch-cooking": "/images/order-bumps/batch-cooking-thumb.webp",
  "protocolo-intestino": "/images/order-bumps/protocolo-intestino-thumb.webp",
  "sos-desmame": "/images/order-bumps/sos-desmame-thumb.webp",
  "nutribot-30d": "/images/order-bumps/nutribot-30d-thumb.webp",
};

export const BUMP_DESCRIPTIONS: Record<string, string> = {
  "batch-cooking": "Cozinhe a semana inteira em uma hora só. Método de porcionamento, tabela de validade e etiquetas pra imprimir.",
};
