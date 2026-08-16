export type BlwCategory = "frutas" | "vegetais" | "proteina" | "graos" | "laticinios";

export const BLW_CATEGORY_LABEL: Record<BlwCategory, string> = {
  frutas: "Frutas",
  vegetais: "Vegetais",
  proteina: "Proteína",
  graos: "Grãos",
  laticinios: "Laticínios",
};

export interface BlwFood {
  id: string;
  name: string;
  emoji: string;
  category: BlwCategory;
  minAgeMonths: number;
  sizeGuide: string;
  prep: string;
}

export const BLW_FOODS: BlwFood[] = [
  { id: "banana", name: "Banana", emoji: "🍌", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastão do tamanho de dois dedos juntos, com casca na ponta para servir de cabo.", prep: "Corte ao meio no sentido do comprimento e deixe um pedaço de casca para o bebê segurar sem escorregar." },
  { id: "maca", name: "Maçã", emoji: "🍎", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastão grosso, do tamanho do seu dedo indicador.", prep: "Cozinhe no vapor até amaciar bem (um garfo deve entrar sem esforço) antes de cortar em bastão." },
  { id: "pera", name: "Pera", emoji: "🍐", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastão grosso, do tamanho do seu dedo indicador.", prep: "Se estiver bem madura, pode oferecer crua em bastão; se firme, cozinhe no vapor por 6 minutos." },
  { id: "mamao", name: "Mamão", emoji: "🧡", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastão largo, do tamanho de dois dedos.", prep: "Retire sementes e casca; corte em bastão largo — a polpa madura já é macia o suficiente crua." },
  { id: "manga", name: "Manga", emoji: "🥭", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastão largo, do tamanho de dois dedos.", prep: "Descasque e corte em bastão ao longo da polpa, deixando a casca ou o caroço como apoio para segurar." },
  { id: "morango", name: "Morango", emoji: "🍓", category: "frutas", minAgeMonths: 8, sizeGuide: "Cortado ao meio (nunca inteiro) para morangos grandes; inteiro apenas se muito pequeno.", prep: "Lave bem e corte ao meio no sentido do comprimento." },
  { id: "abacate", name: "Abacate", emoji: "🥑", category: "frutas", minAgeMonths: 6, sizeGuide: "Fatia grossa, do tamanho de dois dedos.", prep: "Corte em fatias grossas com a casca de um lado, funcionando como cabo antiderrapante." },
  { id: "melancia", name: "Melancia", emoji: "🍉", category: "frutas", minAgeMonths: 8, sizeGuide: "Bastão largo sem sementes, do tamanho de dois dedos.", prep: "Retire todas as sementes visíveis e corte em bastões largos e firmes." },
  { id: "cenoura", name: "Cenoura", emoji: "🥕", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastão do tamanho do seu dedo indicador.", prep: "Cozinhe no vapor por 15-20 min até ficar bem macia — nunca ofereça crua nesta fase." },
  { id: "batata-doce", name: "Batata-doce", emoji: "🍠", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastão do tamanho do seu dedo indicador.", prep: "Corte em bastões antes de cozinhar no vapor por 15-20 min, até ficar bem macia." },
  { id: "batata", name: "Batata", emoji: "🥔", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastão do tamanho do seu dedo indicador.", prep: "Corte em bastões antes de cozinhar em água até ficar bem macia (cerca de 15 min)." },
  { id: "abobrinha", name: "Abobrinha", emoji: "🥒", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastão largo, do tamanho de dois dedos.", prep: "Corte em bastões e cozinhe no vapor por 8-10 min até ficar bem macia." },
  { id: "brocolis", name: "Brócolis", emoji: "🥦", category: "vegetais", minAgeMonths: 6, sizeGuide: "Floretes grandes com o talo como cabo natural.", prep: "Cozinhe no vapor por 6-8 min até ficar bem macio; o talo funciona como pegador." },
  { id: "pepino", name: "Pepino", emoji: "🥒", category: "vegetais", minAgeMonths: 10, sizeGuide: "Bastão largo, do tamanho de dois dedos.", prep: "Retire as sementes se estiverem grandes e corte em bastões largos e firmes." },
  { id: "couve-flor", name: "Couve-flor", emoji: "🥦", category: "vegetais", minAgeMonths: 6, sizeGuide: "Floretes grandes com o talo como cabo natural.", prep: "Cozinhe no vapor por 8 min até ficar bem macia." },
  { id: "frango", name: "Frango", emoji: "🍗", category: "proteina", minAgeMonths: 6, sizeGuide: "Tira longa e larga, do tamanho de dois dedos.", prep: "Cozinhe até ficar bem macio e corte em tiras grossas no sentido da fibra, fáceis de morder e sugar." },
  { id: "carne-moida", name: "Carne moída", emoji: "🍖", category: "proteina", minAgeMonths: 6, sizeGuide: "Almôndega ou bolinho achatado, do tamanho da palma da mão do bebê.", prep: "Molde em bolinhos achatados e cozinhe bem — a forma facilita segurar melhor que a carne solta." },
  { id: "peixe", name: "Peixe", emoji: "🐟", category: "proteina", minAgeMonths: 6, sizeGuide: "Posta larga e macia, do tamanho de dois dedos.", prep: "Cozinhe no vapor e apalpe cuidadosamente em busca de espinhas antes de servir em postas." },
  { id: "ovo", name: "Ovo", emoji: "🥚", category: "proteina", minAgeMonths: 6, sizeGuide: "Tira de omelete, do tamanho do seu dedo indicador.", prep: "Faça uma omelete firme e corte em tiras compridas, fáceis de segurar." },
  { id: "feijao", name: "Feijão", emoji: "🫘", category: "proteina", minAgeMonths: 8, sizeGuide: "Grãos inteiros e macios, servidos em punhado.", prep: "Cozinhe até desmanchar fácil com o garfo; os grãos macios já são seguros para pegar com a mão." },
  { id: "grao-de-bico", name: "Grão-de-bico", emoji: "🟡", category: "proteina", minAgeMonths: 8, sizeGuide: "Grãos inteiros e bem macios, servidos em punhado.", prep: "Cozinhe até ficar bem macio; amasse levemente entre os dedos para conferir que desmancha fácil." },
  { id: "pao", name: "Pão integral", emoji: "🍞", category: "graos", minAgeMonths: 6, sizeGuide: "Tira comprida, do tamanho de dois dedos.", prep: "Use pão macio, sem casca dura, cortado em tiras compridas." },
  { id: "macarrao", name: "Macarrão parafuso", emoji: "🍝", category: "graos", minAgeMonths: 8, sizeGuide: "Parafusos grandes, cozidos bem macios.", prep: "Cozinhe até ficar bem macio (além do ponto al dente) — o formato parafuso já é fácil de pegar com a mão." },
  { id: "bolinho-arroz", name: "Bolinho de arroz", emoji: "🍚", category: "graos", minAgeMonths: 8, sizeGuide: "Bolinho achatado, do tamanho da palma da mão do bebê.", prep: "Molde o arroz bem cozido em bolinhos achatados e leve à frigideira antiaderente para firmar." },
  { id: "mingau-bastao", name: "Mingau de aveia firme", emoji: "🌾", category: "graos", minAgeMonths: 6, sizeGuide: "Bastão firme, do tamanho de dois dedos.", prep: "Prepare um mingau bem grosso, deixe esfriar em uma forma até firmar, e corte em bastões." },
  { id: "cuscuz-milho", name: "Cuscuz de milho", emoji: "🟨", category: "graos", minAgeMonths: 8, sizeGuide: "Fatia firme, do tamanho de dois dedos.", prep: "Prepare bem firme (mais água absorvida), deixe esfriar em uma forma e corte em fatias grossas." },
  { id: "queijo-minas", name: "Queijo minas frescal", emoji: "🧀", category: "laticinios", minAgeMonths: 6, sizeGuide: "Palito largo, do tamanho de dois dedos.", prep: "Corte em palitos largos — o queijo minas é macio o suficiente para amassar na boca com facilidade." },
  { id: "queijo-cottage", name: "Queijo cottage", emoji: "🥣", category: "laticinios", minAgeMonths: 6, sizeGuide: "Oferecido de colher ou em bolinha grande.", prep: "Sirva puro ou misturado a frutas amassadas; a textura em grãos já é segura para essa fase." },
  { id: "iogurte-natural", name: "Iogurte natural integral", emoji: "🥣", category: "laticinios", minAgeMonths: 6, sizeGuide: "Oferecido de colher, deixando o bebê explorar sozinho.", prep: "Ofereça puro, sem açúcar, em uma colher curva de silicone para o bebê praticar levar à boca." },
  { id: "iogurte-grego", name: "Iogurte grego natural", emoji: "🥣", category: "laticinios", minAgeMonths: 6, sizeGuide: "Oferecido de colher, textura mais espessa.", prep: "A consistência mais firme ajuda o bebê a controlar melhor a colherada." },
];

export interface BlwSafetyRule {
  title: string;
  text: string;
}

export const BLW_GOLDEN_RULES: BlwSafetyRule[] = [
  { title: "Sempre sentado ereto", text: "O bebê deve estar sentado com apoio de 90 graus, nunca reclinado ou deitado, para a via aérea ficar alinhada." },
  { title: "Sempre supervisionado", text: "Nunca deixe o bebê comer sozinho, mesmo por poucos segundos. Fique ao alcance de braço o tempo todo." },
  { title: "Espere os sinais de prontidão", text: "Sentar sem apoio, perder o reflexo de protrusão da língua e demonstrar interesse pela comida são os três sinais que indicam que o bebê está pronto." },
  { title: "Deixe o bebê no comando", text: "Não force a levar a comida à boca do bebê — o método é sobre autonomia. Ele decide o que, quanto e se vai comer." },
  { title: "Um alimento novo por vez", text: "Assim como na introdução tradicional, ofereça um alimento por vez nos primeiros dias para identificar reações." },
  { title: "Confie no reflexo de gag", text: "Engasgos leves com barulho (gag) são o corpo aprendendo — não é motivo de pânico, veja a diferença na aba de segurança." },
];

export const BLW_FORBIDDEN_FOODS: string[] = [
  "Uva, tomate-cereja ou azeitona inteiros — corte sempre em quartos.",
  "Amendoim ou castanhas inteiros — risco altíssimo de engasgo até os 4-5 anos.",
  "Pipoca — um dos maiores causadores de engasgo grave em crianças pequenas.",
  "Mel antes de 1 ano — risco de botulismo infantil.",
  "Sal e açúcar adicionados antes de 1 ano.",
  "Pedaços de carne fibrosos ou com gordura dura, difíceis de mastigar.",
  "Salsicha ou linguiça em rodelas — sempre corte ao comprido, ou evite.",
  "Alimentos duros e quebradiços, como cenoura crua ou maçã crua em pedaços grandes.",
  "Balas, chicletes e doces em geral.",
];

export function getBlwFood(id: string): BlwFood | undefined {
  return BLW_FOODS.find((f) => f.id === id);
}
