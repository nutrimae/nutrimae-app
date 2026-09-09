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
  "batch-cooking": "Cocina toda la semana en solo una hora. Método de porcionamiento, tabla de validez y etiquetas para imprimir.",
};
