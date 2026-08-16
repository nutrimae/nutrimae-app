import type { AgeBand } from "@/lib/menu";

export interface Pratinho {
  id: string;
  title: string;
  ageBand: AgeBand;
  colors: string[];
  ingredients: string[];
  prepTimeMinutes: number;
  steps: string[];
}

export const PRATINHOS: Pratinho[] = [
  // ---------- 6-7 meses ----------
  {
    id: "arco-iris-suave",
    title: "Prato Arco-íris Suave",
    ageBand: "6-7",
    colors: ["amarelo", "laranja", "verde"],
    ingredients: ["1/2 banana amassada", "3 colheres de cenoura cozida amassada", "3 colheres de brócolis cozido amassado"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe a cenoura e o brócolis no vapor até ficarem bem macios.",
      "Amasse cada alimento separadamente, sem misturar.",
      "Disponha as três cores lado a lado no prato, em montinhos separados.",
    ],
  },
  {
    id: "trio-doce-frutas",
    title: "Trio Doce de Frutas",
    ageBand: "6-7",
    colors: ["laranja", "verde", "amarelo"],
    ingredients: ["3 colheres de manga amassada", "3 colheres de pera cozida amassada", "3 colheres de mamão amassado"],
    prepTimeMinutes: 12,
    steps: [
      "Cozinhe a pera no vapor até ficar bem macia.",
      "Amasse cada fruta separadamente.",
      "Sirva as três em montinhos coloridos no prato.",
    ],
  },
  {
    id: "verde-e-laranja",
    title: "Verde e Laranja",
    ageBand: "6-7",
    colors: ["verde", "laranja"],
    ingredients: ["4 colheres de abobrinha cozida amassada", "4 colheres de batata-doce cozida amassada"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe os dois legumes no vapor até ficarem bem macios.",
      "Amasse cada um separadamente.",
      "Sirva metade do prato de cada cor.",
    ],
  },
  {
    id: "proteina-gentil",
    title: "Prato Proteína Gentil",
    ageBand: "6-7",
    colors: ["branco", "laranja"],
    ingredients: ["3 colheres de frango cozido e desfiado bem fino", "4 colheres de purê de abóbora"],
    prepTimeMinutes: 25,
    steps: [
      "Cozinhe o frango até ficar bem macio e desfie bem fino.",
      "Cozinhe a abóbora no vapor e amasse em purê.",
      "Sirva o frango sobre o purê, formando duas texturas visíveis.",
    ],
  },
  {
    id: "colors-frutas-vermelhas",
    title: "Colors de Frutas Vermelhas",
    ageBand: "6-7",
    colors: ["vermelho", "amarelo"],
    ingredients: ["3 morangos amassados", "1/2 banana amassada"],
    prepTimeMinutes: 8,
    steps: [
      "Amasse o morango bem, sem pedaços grandes.",
      "Amasse a banana separadamente.",
      "Disponha lado a lado, criando contraste de cor.",
    ],
  },
  {
    id: "trio-legumes-classico",
    title: "Trio de Legumes Clássico",
    ageBand: "6-7",
    colors: ["laranja", "amarelo", "verde"],
    ingredients: ["3 colheres de cenoura cozida amassada", "3 colheres de batata cozida amassada", "3 colheres de abobrinha cozida amassada"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe os três legumes no vapor até ficarem bem macios.",
      "Amasse cada um separadamente.",
      "Sirva em três montinhos formando um triângulo no prato.",
    ],
  },
  {
    id: "cafe-colorido-aveia",
    title: "Café Colorido de Aveia",
    ageBand: "6-7",
    colors: ["bege", "amarelo"],
    ingredients: ["2 colheres de aveia cozida com leite materno ou fórmula", "1/2 banana amassada", "1 pitada de canela"],
    prepTimeMinutes: 10,
    steps: [
      "Cozinhe a aveia até formar um mingau cremoso.",
      "Amasse a banana e misture só na hora de servir, para manter as cores separadas visualmente.",
      "Polvilhe uma pitada de canela por cima.",
    ],
  },
  {
    id: "pure-duo-mamae",
    title: "Purê Duo da Mamãe",
    ageBand: "6-7",
    colors: ["verde", "branco"],
    ingredients: ["4 colheres de brócolis cozido amassado", "3 colheres de queijo cottage"],
    prepTimeMinutes: 15,
    steps: [
      "Cozinhe o brócolis no vapor até ficar bem macio e amasse.",
      "Separe o queijo cottage puro, sem misturar.",
      "Sirva lado a lado no prato.",
    ],
  },

  // ---------- 8-9 meses ----------
  {
    id: "carinha-feliz-frutas",
    title: "Carinha Feliz de Frutas",
    ageBand: "8-9",
    colors: ["amarelo", "vermelho", "roxo"],
    ingredients: ["2 rodelas de banana (olhos)", "1 morango cortado ao meio (boca)", "3 uvas cortadas em quartos (sobrancelhas)"],
    prepTimeMinutes: 10,
    steps: [
      "Corte a banana em rodelas grossas para os olhos.",
      "Corte o morango ao meio para formar a boca sorridente.",
      "Corte as uvas em quartos e arranje como sobrancelhas — nunca sirva uva inteira.",
    ],
  },
  {
    id: "trem-de-vegetais",
    title: "Trem de Vegetais",
    ageBand: "8-9",
    colors: ["laranja", "verde", "amarelo"],
    ingredients: ["cenoura cozida em rodelas grossas", "abobrinha cozida em rodelas grossas", "batata-doce cozida em rodelas grossas"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe os legumes até ficarem bem macios e corte em rodelas grossas.",
      "Disponha as rodelas em fileira, simulando vagões de um trem.",
      "Amasse levemente cada rodela para facilitar caso o bebê ainda não morda bem.",
    ],
  },
  {
    id: "arco-iris-3-cores",
    title: "Arco-íris de 3 Cores",
    ageBand: "8-9",
    colors: ["vermelho", "amarelo", "verde"],
    ingredients: ["morango em pedaços pequenos", "manga em pedaços pequenos", "abobrinha cozida em pedaços pequenos"],
    prepTimeMinutes: 15,
    steps: [
      "Corte cada alimento em pedaços pequenos e macios.",
      "Disponha em três fileiras curvas, imitando um arco-íris.",
      "Sirva em temperatura ambiente.",
    ],
  },
  {
    id: "proteina-e-cor",
    title: "Prato Proteína e Cor",
    ageBand: "8-9",
    colors: ["branco", "laranja", "amarelo"],
    ingredients: ["frango desfiado em fios grossos", "cenoura cozida em pedaços pequenos", "arroz bem cozido"],
    prepTimeMinutes: 25,
    steps: [
      "Cozinhe o frango e desfie em fios um pouco mais grossos.",
      "Cozinhe a cenoura até ficar bem macia e corte em pedaços pequenos.",
      "Sirva os três alimentos em seções separadas do prato.",
    ],
  },
  {
    id: "sol-amarelo",
    title: "Sol Amarelo",
    ageBand: "8-9",
    colors: ["amarelo", "branco"],
    ingredients: ["manga em pedaços pequenos", "banana em pedaços pequenos", "queijo cottage no centro"],
    prepTimeMinutes: 10,
    steps: [
      "Corte a manga e a banana em pedaços pequenos e macios.",
      "Disponha em círculo ao redor do prato, como raios de sol.",
      "Coloque o queijo cottage no centro, formando o 'sol'.",
    ],
  },
  {
    id: "jardim-verde",
    title: "Jardim Verde",
    ageBand: "8-9",
    colors: ["verde"],
    ingredients: ["brócolis cozido em floretes pequenos", "abobrinha cozida em pedaços pequenos", "ervilha bem cozida e amassada"],
    prepTimeMinutes: 15,
    steps: [
      "Cozinhe todos os vegetais até ficarem bem macios.",
      "Amasse levemente a ervilha para facilitar a mastigação.",
      "Disponha formando um pequeno 'jardim' no prato.",
    ],
  },
  {
    id: "doce-trio-frutas",
    title: "Doce Trio de Frutas",
    ageBand: "8-9",
    colors: ["verde", "vermelho", "roxo"],
    ingredients: ["pera em pedaços pequenos", "maçã cozida em pedaços pequenos", "uva cortada em quartos"],
    prepTimeMinutes: 15,
    steps: [
      "Cozinhe a maçã no vapor até ficar macia e corte em pedaços.",
      "Corte a pera madura em pedaços pequenos.",
      "Corte a uva sempre em quartos — nunca sirva inteira.",
    ],
  },

  // ---------- 10-12 meses ----------
  {
    id: "rostinho-divertido",
    title: "Rostinho Divertido",
    ageBand: "10-12",
    colors: ["branco", "laranja", "verde"],
    ingredients: ["arroz cozido (rosto)", "2 rodelas de cenoura (olhos)", "ervilha cozida (nariz e boca)"],
    prepTimeMinutes: 20,
    steps: [
      "Molde o arroz cozido em formato de rosto no centro do prato.",
      "Use rodelas de cenoura cozida como olhos.",
      "Use ervilhas bem cozidas para formar nariz e boca sorridente.",
    ],
  },
  {
    id: "trilha-de-cores",
    title: "Trilha de Cores",
    ageBand: "10-12",
    colors: ["laranja", "verde", "amarelo", "vermelho"],
    ingredients: ["cenoura cozida em cubos", "abobrinha cozida em cubos", "batata-doce cozida em cubos", "tomate sem pele em cubos"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe todos os legumes até ficarem macios e corte em cubos pequenos.",
      "Disponha em uma trilha ondulada no prato, alternando as cores.",
      "Sirva morno ou em temperatura ambiente.",
    ],
  },
  {
    id: "arco-iris-completo",
    title: "Prato Arco-íris Completo",
    ageBand: "10-12",
    colors: ["vermelho", "laranja", "amarelo", "verde", "roxo"],
    ingredients: ["morango em pedaços", "cenoura cozida em pedaços", "manga em pedaços", "brócolis cozido em pedaços", "uva cortada em quartos"],
    prepTimeMinutes: 20,
    steps: [
      "Prepare cada alimento em pedaços pequenos e seguros.",
      "Disponha em curva, seguindo a ordem das cores do arco-íris.",
      "Sirva imediatamente para manter as cores vivas.",
    ],
  },
  {
    id: "sanduiche-colorido-cubos",
    title: "Sanduíche Colorido em Cubos",
    ageBand: "10-12",
    colors: ["bege", "verde", "vermelho"],
    ingredients: ["1 fatia de pão integral", "pasta de abacate", "tomate sem pele picado bem miúdo"],
    prepTimeMinutes: 8,
    steps: [
      "Amasse o abacate até formar uma pasta lisa e espalhe no pão.",
      "Pique o tomate bem miúdo e distribua por cima.",
      "Corte em cubos pequenos e fáceis de pegar.",
    ],
  },
  {
    id: "mix-proteina-divertido",
    title: "Mix Proteína Divertido",
    ageBand: "10-12",
    colors: ["branco", "amarelo", "vermelho"],
    ingredients: ["frango desfiado em pedaços", "queijo em cubos pequenos", "tomate sem pele em pedaços pequenos"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe o frango e desfie em pedaços pequenos.",
      "Corte o queijo em cubos macios e pequenos.",
      "Disponha os três alimentos separados, formando três cores distintas.",
    ],
  },
  {
    id: "espetinhos-de-frutas",
    title: "Espetinhos de Frutas (sem palito)",
    ageBand: "10-12",
    colors: ["vermelho", "amarelo", "verde"],
    ingredients: ["morango em pedaços", "banana em rodelas", "melão em cubos pequenos"],
    prepTimeMinutes: 10,
    steps: [
      "Corte todas as frutas em pedaços pequenos e macios.",
      "Organize em fileiras alternando as cores, sem usar palito real — apenas a disposição visual.",
      "Sirva gelado nos dias mais quentes.",
    ],
  },
  {
    id: "prato-fazendinha",
    title: "Prato Fazendinha",
    ageBand: "10-12",
    colors: ["verde", "laranja", "amarelo"],
    ingredients: ["brócolis cozido em floretes (árvores)", "cenoura cozida em bastões (cerca)", "purê de batata-doce (terra)"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe os legumes até ficarem bem macios.",
      "Disponha o purê de batata-doce na base do prato como 'terra'.",
      "Espete os floretes de brócolis em pé como árvores e alinhe os bastões de cenoura como cerca.",
    ],
  },

  // ---------- 13-24 meses ----------
  {
    id: "prato-carinha-familia",
    title: "Prato Carinha da Família",
    ageBand: "13-24",
    colors: ["branco", "marrom", "verde"],
    ingredients: ["arroz cozido (rosto)", "feijão cozido (cabelo)", "vagem picada (olhos e boca)"],
    prepTimeMinutes: 25,
    steps: [
      "Molde o arroz em formato de rosto redondo no prato.",
      "Use o feijão para desenhar o cabelo na parte de cima.",
      "Use pedacinhos de vagem cozida para os olhos e a boca.",
    ],
  },
  {
    id: "arco-iris-familia",
    title: "Arco-íris Completo da Família",
    ageBand: "13-24",
    colors: ["vermelho", "laranja", "amarelo", "verde", "roxo"],
    ingredients: ["morango em pedaços", "cenoura cozida em pedaços", "milho cozido", "brócolis cozido em pedaços", "beterraba cozida em cubos"],
    prepTimeMinutes: 25,
    steps: [
      "Cozinhe cada legume separadamente até ficar macio.",
      "Corte tudo em pedaços do tamanho seguro para a idade.",
      "Disponha em curva, na ordem das cores do arco-íris.",
    ],
  },
  {
    id: "mini-sanduiches-coloridos",
    title: "Mini Sanduíches Coloridos",
    ageBand: "13-24",
    colors: ["bege", "verde", "vermelho", "amarelo"],
    ingredients: ["pão integral", "queijo", "peito de peru", "pepino em fatias finas"],
    prepTimeMinutes: 10,
    steps: [
      "Monte o sanduíche intercalando queijo, peru e pepino.",
      "Corte em quatro mini triângulos ou quadrados.",
      "Sirva com os pedaços coloridos visíveis nas bordas.",
    ],
  },
  {
    id: "espetinhos-frutas-reais",
    title: "Espetinhos de Frutas (palito de silicone)",
    ageBand: "13-24",
    colors: ["vermelho", "amarelo", "verde", "roxo"],
    ingredients: ["morango", "banana", "melão", "uva cortada ao meio"],
    prepTimeMinutes: 12,
    steps: [
      "Corte as frutas em pedaços do tamanho de um dedo.",
      "Se usar palito, prefira um palito de silicone rombudo, próprio para crianças, e supervisione o tempo todo.",
      "Alterne as cores ao montar o espeto.",
    ],
  },
  {
    id: "prato-trem-vagoes",
    title: "Prato Trem de Vagões",
    ageBand: "13-24",
    colors: ["laranja", "verde", "amarelo", "vermelho"],
    ingredients: ["cenoura em rodelas", "abobrinha em rodelas", "batata-doce em rodelas", "tomate em rodelas"],
    prepTimeMinutes: 20,
    steps: [
      "Cozinhe os legumes até ficarem macios e corte em rodelas.",
      "Disponha em fileira, cada legume representando um vagão do trem.",
      "Use um pedaço de queijo redondo como 'roda' entre os vagões.",
    ],
  },
  {
    id: "salada-divertida-picada",
    title: "Salada Divertida Picada",
    ageBand: "13-24",
    colors: ["verde", "vermelho", "amarelo"],
    ingredients: ["alface picada bem fina", "tomate sem pele picado", "milho cozido"],
    prepTimeMinutes: 10,
    steps: [
      "Pique a alface bem fina para facilitar a mastigação.",
      "Pique o tomate sem pele em pedaços pequenos.",
      "Misture com o milho cozido e sirva em porção pequena.",
    ],
  },
  {
    id: "prato-bandeira",
    title: "Prato Bandeira",
    ageBand: "13-24",
    colors: ["verde", "amarelo", "azul"],
    ingredients: ["brócolis cozido em pedaços (faixa verde)", "manga em cubos (faixa amarela)", "mirtilo ou uva roxa cortada (faixa azul/roxa)"],
    prepTimeMinutes: 20,
    steps: [
      "Prepare cada alimento em pedaços pequenos e seguros.",
      "Disponha em três faixas retas, lado a lado no prato.",
      "Sirva como uma 'bandeira' colorida e divertida.",
    ],
  },
  {
    id: "muffin-e-frutas",
    title: "Muffin e Frutas Coloridas",
    ageBand: "13-24",
    colors: ["laranja", "vermelho", "amarelo"],
    ingredients: ["1 muffin de cenoura caseiro", "morango em pedaços", "manga em cubos"],
    prepTimeMinutes: 10,
    steps: [
      "Corte o muffin em pedaços pequenos.",
      "Corte as frutas em pedaços do tamanho seguro para a idade.",
      "Disponha ao redor do muffin, criando um prato colorido e completo.",
    ],
  },
];

export const TOTAL_PRATINHOS = PRATINHOS.length;

export function searchPratinhos(params: { ageBand?: AgeBand; color?: string }): Pratinho[] {
  return PRATINHOS.filter((p) => {
    if (params.ageBand && p.ageBand !== params.ageBand) return false;
    if (params.color && !p.colors.includes(params.color)) return false;
    return true;
  });
}
