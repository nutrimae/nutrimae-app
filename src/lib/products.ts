// "sos" não é um ModuleKey: o Manual S.O.S. é gratuito, público e nunca
// gateado por assinatura (rota /sos, fora deste sistema de permissões).
export type ModuleKey =
  | "cardapio"
  | "cortes_seguros"
  | "lista_compras"
  | "alergia"
  | "diario_bebe"
  | "restricao_alimentar"
  | "rotina_sono"
  | "calculadora_fraldas"
  | "sos_desmame_noturno"
  | "protocolo_intestino_livre";

export type ProductKey =
  | "nutrimae_assinatura"
  | "diario_bebe"
  | "restricao_alimentar"
  | "rotina_sono"
  | "calculadora_fraldas"
  | "sos_desmame_noturno"
  | "protocolo_intestino_livre"
  | "nutribot_vip";

export interface BundledItem {
  label: string;
  originalPrice: number;
}

export interface Product {
  key: ProductKey;
  name: string;
  /** Preço promocional cobrado agora (ex.: preço de entrada no primeiro mês). */
  price: number;
  /** Preço cheio recorrente (ex.: mensalidade normal), usado no cálculo de "valor total". */
  regularPrice: number;
  /** true = produto de pagamento único (order bump), não mostra "/mês" ao lado do preço cheio. */
  oneTimePayment?: boolean;
  /** Texto ao lado do preço promocional, ex.: "no primeiro mês". */
  priceNote: string;
  /** Itens bônus mostrados riscados (de R$X por GRÁTIS) na tela de upgrade. */
  bundled: BundledItem[];
  /** Módulos liberados por este produto. */
  modules: ModuleKey[];
  /** Link externo de checkout (Cartpanda) do plano mensal. Ainda não configurado para os módulos futuros. */
  checkoutUrl?: string;
  /** Se as telas dos módulos já existem no app. */
  built: boolean;
  /**
   * Plano anual opcional (preço à vista). Quando presente, telas de oferta podem
   * exibir os dois planos lado a lado. Ausente = produto só tem opção mensal.
   */
  annual?: {
    price: number;
    /** Texto de apoio ao preço à vista, ex.: "à vista". */
    note: string;
    /** Opção de parcelamento real (não é price/12 — o cartão cobra um pouco mais). */
    installmentNote: string;
    /** Link externo de checkout (Cartpanda) do plano anual. */
    checkoutUrl?: string;
  };
}

export const PRODUCTS: Record<ProductKey, Product> = {
  nutrimae_assinatura: {
    key: "nutrimae_assinatura",
    name: "NutriMãe (assinatura)",
    price: 19.9,
    regularPrice: 29.9,
    priceNote: "no primeiro mês",
    bundled: [{ label: "Guia de Sinais de Alergia", originalPrice: 19.9 }],
    modules: ["cardapio", "cortes_seguros", "lista_compras", "alergia"],
    built: true,
    annual: {
      price: 97,
      note: "à vista",
      installmentNote: "ou 12x de R$9,70 no cartão",
    },
  },
  // Produtos futuros: módulo ainda não construído, só o "gate" (config) está pronto
  // para quando a tela existir. Preços abaixo são placeholders — ajustar com o valor real.
  diario_bebe: {
    key: "diario_bebe",
    name: "Diário do Bebê",
    price: 9.9,
    regularPrice: 14.9,
    priceNote: "no primeiro mês",
    bundled: [],
    modules: ["diario_bebe"],
    built: false,
  },
  restricao_alimentar: {
    key: "restricao_alimentar",
    name: "Cardápio de Restrição Alimentar",
    price: 14.9,
    regularPrice: 19.9,
    priceNote: "no primeiro mês",
    bundled: [],
    modules: ["restricao_alimentar"],
    built: false,
  },
  rotina_sono: {
    key: "rotina_sono",
    name: "Rotina do Sono & Calma",
    price: 9.9,
    regularPrice: 14.9,
    priceNote: "no primeiro mês",
    bundled: [],
    modules: ["rotina_sono"],
    built: false,
  },
  calculadora_fraldas: {
    key: "calculadora_fraldas",
    name: "Calculadora de Fraldas",
    price: 4.9,
    regularPrice: 9.9,
    priceNote: "no primeiro mês",
    bundled: [],
    modules: ["calculadora_fraldas"],
    built: false,
  },
  // Order bump: acesso vitalício, pagamento único (não é assinatura recorrente).
  sos_desmame_noturno: {
    key: "sos_desmame_noturno",
    name: "SOS Desmame Noturno",
    price: 27,
    regularPrice: 47,
    priceNote: "pagamento único, acesso vitalício",
    bundled: [],
    modules: ["sos_desmame_noturno"],
    built: true,
    oneTimePayment: true,
  },
  // Segundo módulo da Área VIP — mesmo padrão de order bump (pagamento único).
  protocolo_intestino_livre: {
    key: "protocolo_intestino_livre",
    name: "Protocolo Intestino Livre",
    price: 27,
    regularPrice: 47,
    priceNote: "pagamento único, acesso vitalício",
    bundled: [],
    modules: ["protocolo_intestino_livre"],
    built: true,
    oneTimePayment: true,
  },
  // Acesso à NutriBot (assistente via WhatsApp) — não é um módulo do app
  // (por isso "modules: []"), só é concedido pelo webhook de compra e
  // consultado pelo webhook do WhatsApp (ver src/app/api/whatsapp/webhook).
  // Preço/priceNote são placeholders: ajustar para o valor real de venda.
  nutribot_vip: {
    key: "nutribot_vip",
    name: "NutriBot (WhatsApp)",
    price: 19.9,
    regularPrice: 19.9,
    priceNote: "por mês",
    bundled: [],
    modules: [],
    built: true,
  },
};

export const MODULE_TO_PRODUCT: Record<ModuleKey, ProductKey> = Object.values(PRODUCTS).reduce(
  (acc, product) => {
    for (const moduleKey of product.modules) {
      acc[moduleKey] = product.key;
    }
    return acc;
  },
  {} as Record<ModuleKey, ProductKey>,
);

export function totalStackedValue(product: Product): number {
  return product.regularPrice + product.bundled.reduce((sum, item) => sum + item.originalPrice, 0);
}

export function isKnownProductKey(key: string): key is ProductKey {
  return key in PRODUCTS;
}
