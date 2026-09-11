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

// ─── Versão em espanhol ───
export const PRATINHOS_ES: Pratinho[] = [
  // ---------- 6-7 meses ----------
  {
    id: "arco-iris-suave",
    title: "Plato Arcoíris Suave",
    ageBand: "6-7",
    colors: ["amarillo", "naranjo", "verde"],
    ingredients: ["1/2 plátano aplastado", "3 cucharadas de zanahoria cocida aplastada", "3 cucharadas de brócoli cocido aplastado"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina la zanahoria y el brócoli al vapor hasta que queden bien blandos.",
      "Aplasta cada alimento por separado, sin mezclar.",
      "Dispón los tres colores uno al lado del otro en el plato, en montoncitos separados.",
    ],
  },
  {
    id: "trio-doce-frutas",
    title: "Trío Dulce de Frutas",
    ageBand: "6-7",
    colors: ["naranjo", "verde", "amarillo"],
    ingredients: ["3 cucharadas de mango aplastado", "3 cucharadas de pera cocida aplastada", "3 cucharadas de papaya aplastada"],
    prepTimeMinutes: 12,
    steps: [
      "Cocina la pera al vapor hasta que quede bien blanda.",
      "Aplasta cada fruta por separado.",
      "Sirve las tres en montoncitos de colores en el plato.",
    ],
  },
  {
    id: "verde-e-laranja",
    title: "Verde y Naranjo",
    ageBand: "6-7",
    colors: ["verde", "naranjo"],
    ingredients: ["4 cucharadas de zapallo italiano cocido aplastado", "4 cucharadas de camote cocido aplastado"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina las dos verduras al vapor hasta que queden bien blandas.",
      "Aplasta cada una por separado.",
      "Sirve la mitad del plato de cada color.",
    ],
  },
  {
    id: "proteina-gentil",
    title: "Plato Proteína Gentil",
    ageBand: "6-7",
    colors: ["blanco", "naranjo"],
    ingredients: ["3 cucharadas de pollo cocido y deshilachado bien fino", "4 cucharadas de puré de zapallo"],
    prepTimeMinutes: 25,
    steps: [
      "Cocina el pollo hasta que quede bien blando y deshilacha bien fino.",
      "Cocina el zapallo al vapor y hazlo puré.",
      "Sirve el pollo sobre el puré, formando dos texturas visibles.",
    ],
  },
  {
    id: "colors-frutas-vermelhas",
    title: "Colores de Frutos Rojos",
    ageBand: "6-7",
    colors: ["rojo", "amarillo"],
    ingredients: ["3 frutillas aplastadas", "1/2 plátano aplastado"],
    prepTimeMinutes: 8,
    steps: [
      "Aplasta bien la frutilla, sin trozos grandes.",
      "Aplasta el plátano por separado.",
      "Dispón uno al lado del otro, creando contraste de color.",
    ],
  },
  {
    id: "trio-legumes-classico",
    title: "Trío de Verduras Clásico",
    ageBand: "6-7",
    colors: ["naranjo", "amarillo", "verde"],
    ingredients: ["3 cucharadas de zanahoria cocida aplastada", "3 cucharadas de papa cocida aplastada", "3 cucharadas de zapallo italiano cocido aplastado"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina las tres verduras al vapor hasta que queden bien blandas.",
      "Aplasta cada una por separado.",
      "Sirve en tres montoncitos formando un triángulo en el plato.",
    ],
  },
  {
    id: "cafe-colorido-aveia",
    title: "Desayuno Colorido de Avena",
    ageBand: "6-7",
    colors: ["beige", "amarillo"],
    ingredients: ["2 cucharadas de avena cocida con leche materna o fórmula", "1/2 plátano aplastado", "1 pizca de canela"],
    prepTimeMinutes: 10,
    steps: [
      "Cocina la avena hasta formar una papilla cremosa.",
      "Aplasta el plátano y mézclalo recién al momento de servir, para mantener los colores separados visualmente.",
      "Espolvorea una pizca de canela por encima.",
    ],
  },
  {
    id: "pure-duo-mamae",
    title: "Puré Dúo de Mamá",
    ageBand: "6-7",
    colors: ["verde", "blanco"],
    ingredients: ["4 cucharadas de brócoli cocido aplastado", "3 cucharadas de queso cottage"],
    prepTimeMinutes: 15,
    steps: [
      "Cocina el brócoli al vapor hasta que quede bien blando y aplástalo.",
      "Deja el queso cottage puro, sin mezclar.",
      "Sirve uno al lado del otro en el plato.",
    ],
  },

  // ---------- 8-9 meses ----------
  {
    id: "carinha-feliz-frutas",
    title: "Carita Feliz de Frutas",
    ageBand: "8-9",
    colors: ["amarillo", "rojo", "morado"],
    ingredients: ["2 rodajas de plátano (ojos)", "1 frutilla cortada a la mitad (boca)", "3 uvas cortadas en cuartos (cejas)"],
    prepTimeMinutes: 10,
    steps: [
      "Corta el plátano en rodajas gruesas para los ojos.",
      "Corta la frutilla a la mitad para formar la boca sonriente.",
      "Corta las uvas en cuartos y ordénalas como cejas — nunca sirvas uva entera.",
    ],
  },
  {
    id: "trem-de-vegetais",
    title: "Tren de Verduras",
    ageBand: "8-9",
    colors: ["naranjo", "verde", "amarillo"],
    ingredients: ["zanahoria cocida en rodajas gruesas", "zapallo italiano cocido en rodajas gruesas", "camote cocido en rodajas gruesas"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina las verduras hasta que queden bien blandas y córtalas en rodajas gruesas.",
      "Dispón las rodajas en fila, simulando los vagones de un tren.",
      "Aplasta levemente cada rodaja para facilitar si el bebé todavía no muerde bien.",
    ],
  },
  {
    id: "arco-iris-3-cores",
    title: "Arcoíris de 3 Colores",
    ageBand: "8-9",
    colors: ["rojo", "amarillo", "verde"],
    ingredients: ["frutilla en trozos pequeños", "mango en trozos pequeños", "zapallo italiano cocido en trozos pequeños"],
    prepTimeMinutes: 15,
    steps: [
      "Corta cada alimento en trozos pequeños y blandos.",
      "Dispón en tres filas curvas, imitando un arcoíris.",
      "Sirve a temperatura ambiente.",
    ],
  },
  {
    id: "proteina-e-cor",
    title: "Plato Proteína y Color",
    ageBand: "8-9",
    colors: ["blanco", "naranjo", "amarillo"],
    ingredients: ["pollo deshilachado en hebras gruesas", "zanahoria cocida en trozos pequeños", "arroz bien cocido"],
    prepTimeMinutes: 25,
    steps: [
      "Cocina el pollo y deshilacha en hebras un poco más gruesas.",
      "Cocina la zanahoria hasta que quede bien blanda y córtala en trozos pequeños.",
      "Sirve los tres alimentos en secciones separadas del plato.",
    ],
  },
  {
    id: "sol-amarelo",
    title: "Sol Amarillo",
    ageBand: "8-9",
    colors: ["amarillo", "blanco"],
    ingredients: ["mango en trozos pequeños", "plátano en trozos pequeños", "queso cottage en el centro"],
    prepTimeMinutes: 10,
    steps: [
      "Corta el mango y el plátano en trozos pequeños y blandos.",
      "Dispón en círculo alrededor del plato, como rayos de sol.",
      "Coloca el queso cottage en el centro, formando el 'sol'.",
    ],
  },
  {
    id: "jardim-verde",
    title: "Jardín Verde",
    ageBand: "8-9",
    colors: ["verde"],
    ingredients: ["brócoli cocido en ramitos pequeños", "zapallo italiano cocido en trozos pequeños", "arveja bien cocida y aplastada"],
    prepTimeMinutes: 15,
    steps: [
      "Cocina todas las verduras hasta que queden bien blandas.",
      "Aplasta levemente la arveja para facilitar la masticación.",
      "Dispón formando un pequeño 'jardín' en el plato.",
    ],
  },
  {
    id: "doce-trio-frutas",
    title: "Dulce Trío de Frutas",
    ageBand: "8-9",
    colors: ["verde", "rojo", "morado"],
    ingredients: ["pera en trozos pequeños", "manzana cocida en trozos pequeños", "uva cortada en cuartos"],
    prepTimeMinutes: 15,
    steps: [
      "Cocina la manzana al vapor hasta que quede blanda y córtala en trozos.",
      "Corta la pera madura en trozos pequeños.",
      "Corta la uva siempre en cuartos — nunca la sirvas entera.",
    ],
  },

  // ---------- 10-12 meses ----------
  {
    id: "rostinho-divertido",
    title: "Carita Divertida",
    ageBand: "10-12",
    colors: ["blanco", "naranjo", "verde"],
    ingredients: ["arroz cocido (cara)", "2 rodajas de zanahoria (ojos)", "arveja cocida (nariz y boca)"],
    prepTimeMinutes: 20,
    steps: [
      "Moldea el arroz cocido en forma de cara en el centro del plato.",
      "Usa rodajas de zanahoria cocida como ojos.",
      "Usa arvejas bien cocidas para formar la nariz y la boca sonriente.",
    ],
  },
  {
    id: "trilha-de-cores",
    title: "Sendero de Colores",
    ageBand: "10-12",
    colors: ["naranjo", "verde", "amarillo", "rojo"],
    ingredients: ["zanahoria cocida en cubos", "zapallo italiano cocido en cubos", "camote cocido en cubos", "tomate sin piel en cubos"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina todas las verduras hasta que queden blandas y córtalas en cubos pequeños.",
      "Dispón en un sendero ondulado en el plato, alternando los colores.",
      "Sirve tibio o a temperatura ambiente.",
    ],
  },
  {
    id: "arco-iris-completo",
    title: "Plato Arcoíris Completo",
    ageBand: "10-12",
    colors: ["rojo", "naranjo", "amarillo", "verde", "morado"],
    ingredients: ["frutilla en trozos", "zanahoria cocida en trozos", "mango en trozos", "brócoli cocido en trozos", "uva cortada en cuartos"],
    prepTimeMinutes: 20,
    steps: [
      "Prepara cada alimento en trozos pequeños y seguros.",
      "Dispón en curva, siguiendo el orden de los colores del arcoíris.",
      "Sirve de inmediato para mantener los colores vivos.",
    ],
  },
  {
    id: "sanduiche-colorido-cubos",
    title: "Sándwich Colorido en Cubos",
    ageBand: "10-12",
    colors: ["beige", "verde", "rojo"],
    ingredients: ["1 rebanada de pan integral", "pasta de palta", "tomate sin piel picado bien fino"],
    prepTimeMinutes: 8,
    steps: [
      "Aplasta la palta hasta formar una pasta lisa y úntala en el pan.",
      "Pica el tomate bien fino y distribúyelo encima.",
      "Corta en cubos pequeños y fáciles de tomar.",
    ],
  },
  {
    id: "mix-proteina-divertido",
    title: "Mix Proteína Divertido",
    ageBand: "10-12",
    colors: ["blanco", "amarillo", "rojo"],
    ingredients: ["pollo deshilachado en trozos", "queso en cubos pequeños", "tomate sin piel en trozos pequeños"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina el pollo y deshilacha en trozos pequeños.",
      "Corta el queso en cubos blandos y pequeños.",
      "Dispón los tres alimentos por separado, formando tres colores distintos.",
    ],
  },
  {
    id: "espetinhos-de-frutas",
    title: "Brochetas de Frutas (sin palito)",
    ageBand: "10-12",
    colors: ["rojo", "amarillo", "verde"],
    ingredients: ["frutilla en trozos", "plátano en rodajas", "melón en cubos pequeños"],
    prepTimeMinutes: 10,
    steps: [
      "Corta todas las frutas en trozos pequeños y blandos.",
      "Organiza en filas alternando los colores, sin usar palito real — solo la disposición visual.",
      "Sirve frío en los días más calurosos.",
    ],
  },
  {
    id: "prato-fazendinha",
    title: "Plato Granjita",
    ageBand: "10-12",
    colors: ["verde", "naranjo", "amarillo"],
    ingredients: ["brócoli cocido en ramitos (árboles)", "zanahoria cocida en bastones (cerco)", "puré de camote (tierra)"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina las verduras hasta que queden bien blandas.",
      "Dispón el puré de camote en la base del plato como 'tierra'.",
      "Clava los ramitos de brócoli parados como árboles y alinea los bastones de zanahoria como cerco.",
    ],
  },

  // ---------- 13-24 meses ----------
  {
    id: "prato-carinha-familia",
    title: "Plato Carita de la Familia",
    ageBand: "13-24",
    colors: ["blanco", "café", "verde"],
    ingredients: ["arroz cocido (cara)", "porotos cocidos (pelo)", "poroto verde picado (ojos y boca)"],
    prepTimeMinutes: 25,
    steps: [
      "Moldea el arroz en forma de cara redonda en el plato.",
      "Usa los porotos para dibujar el pelo en la parte de arriba.",
      "Usa trocitos de poroto verde cocido para los ojos y la boca.",
    ],
  },
  {
    id: "arco-iris-familia",
    title: "Arcoíris Completo de la Familia",
    ageBand: "13-24",
    colors: ["rojo", "naranjo", "amarillo", "verde", "morado"],
    ingredients: ["frutilla en trozos", "zanahoria cocida en trozos", "choclo cocido", "brócoli cocido en trozos", "betarraga cocida en cubos"],
    prepTimeMinutes: 25,
    steps: [
      "Cocina cada verdura por separado hasta que quede blanda.",
      "Corta todo en trozos del tamaño seguro para la edad.",
      "Dispón en curva, en el orden de los colores del arcoíris.",
    ],
  },
  {
    id: "mini-sanduiches-coloridos",
    title: "Mini Sándwiches Coloridos",
    ageBand: "13-24",
    colors: ["beige", "verde", "rojo", "amarillo"],
    ingredients: ["pan integral", "queso", "pechuga de pavo", "pepino en láminas finas"],
    prepTimeMinutes: 10,
    steps: [
      "Arma el sándwich intercalando queso, pavo y pepino.",
      "Corta en cuatro mini triángulos o cuadrados.",
      "Sirve con los trozos de colores visibles en los bordes.",
    ],
  },
  {
    id: "espetinhos-frutas-reais",
    title: "Brochetas de Frutas (palito de silicona)",
    ageBand: "13-24",
    colors: ["rojo", "amarillo", "verde", "morado"],
    ingredients: ["frutilla", "plátano", "melón", "uva cortada a la mitad"],
    prepTimeMinutes: 12,
    steps: [
      "Corta las frutas en trozos del tamaño de un dedo.",
      "Si usas palito, prefiere uno de silicona romo, especial para niños, y supervisa todo el tiempo.",
      "Alterna los colores al armar la brocheta.",
    ],
  },
  {
    id: "prato-trem-vagoes",
    title: "Plato Tren de Vagones",
    ageBand: "13-24",
    colors: ["naranjo", "verde", "amarillo", "rojo"],
    ingredients: ["zanahoria en rodajas", "zapallo italiano en rodajas", "camote en rodajas", "tomate en rodajas"],
    prepTimeMinutes: 20,
    steps: [
      "Cocina las verduras hasta que queden blandas y córtalas en rodajas.",
      "Dispón en fila, cada verdura representando un vagón del tren.",
      "Usa un trozo de queso redondo como 'rueda' entre los vagones.",
    ],
  },
  {
    id: "salada-divertida-picada",
    title: "Ensalada Divertida Picada",
    ageBand: "13-24",
    colors: ["verde", "rojo", "amarillo"],
    ingredients: ["lechuga picada bien fina", "tomate sin piel picado", "choclo cocido"],
    prepTimeMinutes: 10,
    steps: [
      "Pica la lechuga bien fina para facilitar la masticación.",
      "Pica el tomate sin piel en trozos pequeños.",
      "Mezcla con el choclo cocido y sirve en porción pequeña.",
    ],
  },
  {
    id: "prato-bandeira",
    title: "Plato Bandera",
    ageBand: "13-24",
    colors: ["verde", "amarillo", "azul"],
    ingredients: ["brócoli cocido en trozos (franja verde)", "mango en cubos (franja amarilla)", "arándano o uva morada cortada (franja azul/morada)"],
    prepTimeMinutes: 20,
    steps: [
      "Prepara cada alimento en trozos pequeños y seguros.",
      "Dispón en tres franjas rectas, una al lado de la otra en el plato.",
      "Sirve como una 'bandera' colorida y divertida.",
    ],
  },
  {
    id: "muffin-e-frutas",
    title: "Muffin y Frutas de Colores",
    ageBand: "13-24",
    colors: ["naranjo", "rojo", "amarillo"],
    ingredients: ["1 muffin de zanahoria casero", "frutilla en trozos", "mango en cubos"],
    prepTimeMinutes: 10,
    steps: [
      "Corta el muffin en trozos pequeños.",
      "Corta las frutas en trozos del tamaño seguro para la edad.",
      "Dispón alrededor del muffin, creando un plato colorido y completo.",
    ],
  },
];

export function getPratinhos(locale: "pt-BR" | "es" = "es"): Pratinho[] {
  return locale === "pt-BR" ? PRATINHOS : PRATINHOS_ES;
}

export function searchPratinhos(params: { ageBand?: AgeBand; color?: string }, locale: "pt-BR" | "es" = "es"): Pratinho[] {
  return getPratinhos(locale).filter((p) => {
    if (params.ageBand && p.ageBand !== params.ageBand) return false;
    if (params.color && !p.colors.includes(params.color)) return false;
    return true;
  });
}
