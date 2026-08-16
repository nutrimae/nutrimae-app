export type ModuleKey =
  | "cardapio"
  | "cortes_seguros"
  | "lista_compras"
  | "sos"
  | "alergia"
  | "diario_bebe"
  | "restricao_alimentar"
  | "rotina_sono"
  | "calculadora_fraldas";

export type ProductKey =
  | "nutrimae_assinatura"
  | "diario_bebe"
  | "restricao_alimentar"
  | "rotina_sono"
  | "calculadora_fraldas";

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
  /** Texto ao lado do preço promocional, ex.: "no primeiro mês". */
  priceNote: string;
  /** Itens bônus mostrados riscados (de R$X por GRÁTIS) na tela de upgrade. */
  bundled: BundledItem[];
  /** Módulos liberados por este produto. */
  modules: ModuleKey[];
  /** Link externo de checkout (Cartpanda). Ainda não configurado para os módulos futuros. */
  checkoutUrl?: string;
  /** Se as telas dos módulos já existem no app. */
  built: boolean;
}

export const PRODUCTS: Record<ProductKey, Product> = {
  nutrimae_assinatura: {
    key: "nutrimae_assinatura",
    name: "NutriMäe (assinatura)",
    price: 9.9,
    regularPrice: 24.9,
    priceNote: "no primeiro mês",
    bundled: [
      { label: "Manual S.O.S.", originalPrice: 29.9 },
      { label: "Guia de Sinais de Alergia", originalPrice: 19.9 },
    ],
    modules: ["cardapio", "cortes_seguros", "lista_compras", "sos", "alergia"],
    built: true,
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
