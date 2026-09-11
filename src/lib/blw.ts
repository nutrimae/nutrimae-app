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

// ─── Versão em espanhol ───
export const BLW_CATEGORY_LABEL_ES: Record<BlwCategory, string> = {
  frutas: "Frutas",
  vegetais: "Verduras",
  proteina: "Proteína",
  graos: "Granos",
  laticinios: "Lácteos",
};

export const BLW_FOODS_ES: BlwFood[] = [
  { id: "banana", name: "Plátano", emoji: "🍌", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastón del tamaño de dos dedos juntos, con un poco de cáscara en la punta para servir de mango.", prep: "Corta a la mitad a lo largo y deja un trozo de cáscara para que el bebé lo sostenga sin que se resbale." },
  { id: "maca", name: "Manzana", emoji: "🍎", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastón grueso, del tamaño de tu dedo índice.", prep: "Cocina al vapor hasta que ablande bien (un tenedor debe entrar sin esfuerzo) antes de cortar en bastón." },
  { id: "pera", name: "Pera", emoji: "🍐", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastón grueso, del tamaño de tu dedo índice.", prep: "Si está bien madura, puedes ofrecerla cruda en bastón; si está firme, cocina al vapor por 6 minutos." },
  { id: "mamao", name: "Papaya", emoji: "🧡", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastón ancho, del tamaño de dos dedos.", prep: "Retira semillas y cáscara; corta en bastón ancho — la pulpa madura ya es lo bastante blanda cruda." },
  { id: "manga", name: "Mango", emoji: "🥭", category: "frutas", minAgeMonths: 6, sizeGuide: "Bastón ancho, del tamaño de dos dedos.", prep: "Pela y corta en bastón a lo largo de la pulpa, dejando la cáscara o el carozo como apoyo para sostener." },
  { id: "morango", name: "Frutilla", emoji: "🍓", category: "frutas", minAgeMonths: 8, sizeGuide: "Cortada a la mitad (nunca entera) para frutillas grandes; entera solo si es muy pequeña.", prep: "Lava bien y corta a la mitad a lo largo." },
  { id: "abacate", name: "Palta", emoji: "🥑", category: "frutas", minAgeMonths: 6, sizeGuide: "Tajada gruesa, del tamaño de dos dedos.", prep: "Corta en tajadas gruesas con la cáscara de un lado, funcionando como mango antideslizante." },
  { id: "melancia", name: "Sandía", emoji: "🍉", category: "frutas", minAgeMonths: 8, sizeGuide: "Bastón ancho sin semillas, del tamaño de dos dedos.", prep: "Retira todas las semillas visibles y corta en bastones anchos y firmes." },
  { id: "cenoura", name: "Zanahoria", emoji: "🥕", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastón del tamaño de tu dedo índice.", prep: "Cocina al vapor por 15-20 min hasta que quede bien blanda — nunca la ofrezcas cruda en esta etapa." },
  { id: "batata-doce", name: "Camote", emoji: "🍠", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastón del tamaño de tu dedo índice.", prep: "Corta en bastones antes de cocinar al vapor por 15-20 min, hasta que quede bien blando." },
  { id: "batata", name: "Papa", emoji: "🥔", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastón del tamaño de tu dedo índice.", prep: "Corta en bastones antes de cocinar en agua hasta que quede bien blanda (unos 15 min)." },
  { id: "abobrinha", name: "Zapallo italiano", emoji: "🥒", category: "vegetais", minAgeMonths: 6, sizeGuide: "Bastón ancho, del tamaño de dos dedos.", prep: "Corta en bastones y cocina al vapor por 8-10 min hasta que quede bien blando." },
  { id: "brocolis", name: "Brócoli", emoji: "🥦", category: "vegetais", minAgeMonths: 6, sizeGuide: "Ramitos grandes con el tallo como mango natural.", prep: "Cocina al vapor por 6-8 min hasta que quede bien blando; el tallo funciona como agarre." },
  { id: "pepino", name: "Pepino", emoji: "🥒", category: "vegetais", minAgeMonths: 10, sizeGuide: "Bastón ancho, del tamaño de dos dedos.", prep: "Retira las semillas si son grandes y corta en bastones anchos y firmes." },
  { id: "couve-flor", name: "Coliflor", emoji: "🥦", category: "vegetais", minAgeMonths: 6, sizeGuide: "Ramitos grandes con el tallo como mango natural.", prep: "Cocina al vapor por 8 min hasta que quede bien blanda." },
  { id: "frango", name: "Pollo", emoji: "🍗", category: "proteina", minAgeMonths: 6, sizeGuide: "Tira larga y ancha, del tamaño de dos dedos.", prep: "Cocina hasta que quede bien blando y corta en tiras gruesas a favor de la fibra, fáciles de morder y chupar." },
  { id: "carne-moida", name: "Carne molida", emoji: "🍖", category: "proteina", minAgeMonths: 6, sizeGuide: "Albóndiga o bollito aplastado, del tamaño de la palma de la mano del bebé.", prep: "Moldea en bollitos aplastados y cocina bien — la forma facilita sostenerlo mejor que la carne suelta." },
  { id: "peixe", name: "Pescado", emoji: "🐟", category: "proteina", minAgeMonths: 6, sizeGuide: "Trozo ancho y blando, del tamaño de dos dedos.", prep: "Cocina al vapor y palpa cuidadosamente en busca de espinas antes de servir en trozos." },
  { id: "ovo", name: "Huevo", emoji: "🥚", category: "proteina", minAgeMonths: 6, sizeGuide: "Tira de tortilla, del tamaño de tu dedo índice.", prep: "Haz una tortilla firme y corta en tiras largas, fáciles de sostener." },
  { id: "feijao", name: "Poroto", emoji: "🫘", category: "proteina", minAgeMonths: 8, sizeGuide: "Granos enteros y blandos, servidos en puñado.", prep: "Cocina hasta que se deshaga fácil con el tenedor; los granos blandos ya son seguros para tomar con la mano." },
  { id: "grao-de-bico", name: "Garbanzo", emoji: "🟡", category: "proteina", minAgeMonths: 8, sizeGuide: "Granos enteros y bien blandos, servidos en puñado.", prep: "Cocina hasta que quede bien blando; aplasta levemente entre los dedos para confirmar que se deshace fácil." },
  { id: "pao", name: "Pan integral", emoji: "🍞", category: "graos", minAgeMonths: 6, sizeGuide: "Tira larga, del tamaño de dos dedos.", prep: "Usa pan blando, sin corteza dura, cortado en tiras largas." },
  { id: "macarrao", name: "Fideos tornillo", emoji: "🍝", category: "graos", minAgeMonths: 8, sizeGuide: "Tornillos grandes, cocidos bien blandos.", prep: "Cocina hasta que quede bien blando (más allá del punto al dente) — la forma de tornillo ya es fácil de tomar con la mano." },
  { id: "bolinho-arroz", name: "Bolita de arroz", emoji: "🍚", category: "graos", minAgeMonths: 8, sizeGuide: "Bollito aplastado, del tamaño de la palma de la mano del bebé.", prep: "Moldea el arroz bien cocido en bollitos aplastados y pásalos por un sartén antiadherente para que firmen." },
  { id: "mingau-bastao", name: "Papilla de avena firme", emoji: "🌾", category: "graos", minAgeMonths: 6, sizeGuide: "Bastón firme, del tamaño de dos dedos.", prep: "Prepara una papilla bien espesa, deja enfriar en un molde hasta que firme, y corta en bastones." },
  { id: "cuscuz-milho", name: "Cuchuflí de maíz", emoji: "🟨", category: "graos", minAgeMonths: 8, sizeGuide: "Tajada firme, del tamaño de dos dedos.", prep: "Prepáralo bien firme (más agua absorbida), deja enfriar en un molde y corta en tajadas gruesas." },
  { id: "queijo-minas", name: "Queso fresco", emoji: "🧀", category: "laticinios", minAgeMonths: 6, sizeGuide: "Bastoncito ancho, del tamaño de dos dedos.", prep: "Corta en bastoncitos anchos — el queso fresco es lo bastante blando para aplastarse en la boca con facilidad." },
  { id: "queijo-cottage", name: "Queso cottage", emoji: "🥣", category: "laticinios", minAgeMonths: 6, sizeGuide: "Ofrecido a cuchara o en bolita grande.", prep: "Sírvelo solo o mezclado con fruta aplastada; la textura en granos ya es segura para esta etapa." },
  { id: "iogurte-natural", name: "Yogur natural entero", emoji: "🥣", category: "laticinios", minAgeMonths: 6, sizeGuide: "Ofrecido a cuchara, dejando que el bebé explore solo.", prep: "Ofrécelo puro, sin azúcar, en una cuchara curva de silicona para que el bebé practique llevarla a la boca." },
  { id: "iogurte-grego", name: "Yogur griego natural", emoji: "🥣", category: "laticinios", minAgeMonths: 6, sizeGuide: "Ofrecido a cuchara, textura más espesa.", prep: "La consistencia más firme ayuda al bebé a controlar mejor la cucharada." },
];

export const BLW_GOLDEN_RULES_ES: BlwSafetyRule[] = [
  { title: "Siempre sentado derecho", text: "El bebé debe estar sentado con apoyo a 90 grados, nunca reclinado o acostado, para que la vía aérea quede alineada." },
  { title: "Siempre supervisado", text: "Nunca dejes al bebé comer solo, ni por pocos segundos. Mantente a distancia de un brazo todo el tiempo." },
  { title: "Espera las señales de estar listo", text: "Sentarse sin apoyo, perder el reflejo de extrusión de la lengua y mostrar interés por la comida son las tres señales que indican que el bebé está listo." },
  { title: "Deja al bebé al mando", text: "No fuerces la comida hacia la boca del bebé — el método se trata de autonomía. Él decide qué, cuánto y si va a comer." },
  { title: "Un alimento nuevo a la vez", text: "Igual que en la introducción tradicional, ofrece un alimento a la vez en los primeros días para identificar reacciones." },
  { title: "Confía en el reflejo de náusea", text: "Las náuseas leves con ruido (gag) son el cuerpo aprendiendo — no es motivo de pánico, revisa la diferencia en la pestaña de seguridad." },
];

export const BLW_FORBIDDEN_FOODS_ES: string[] = [
  "Uva, tomate cherry o aceituna enteros — córtalos siempre en cuartos.",
  "Maní o nueces enteros — riesgo altísimo de atragantamiento hasta los 4-5 años.",
  "Palomitas de maíz — una de las mayores causas de atragantamiento grave en niños pequeños.",
  "Miel antes de 1 año — riesgo de botulismo infantil.",
  "Sal y azúcar agregados antes de 1 año.",
  "Trozos de carne fibrosos o con grasa dura, difíciles de masticar.",
  "Vienesa o longaniza en rodajas — siempre córtala a lo largo, o evítala.",
  "Alimentos duros y quebradizos, como zanahoria cruda o manzana cruda en trozos grandes.",
  "Caramelos, chicles y dulces en general.",
];

export function getBlwCategoryLabel(locale: "pt-BR" | "es" = "es"): Record<BlwCategory, string> {
  return locale === "pt-BR" ? BLW_CATEGORY_LABEL : BLW_CATEGORY_LABEL_ES;
}

export function getBlwFoods(locale: "pt-BR" | "es" = "es"): BlwFood[] {
  return locale === "pt-BR" ? BLW_FOODS : BLW_FOODS_ES;
}

export function getBlwGoldenRules(locale: "pt-BR" | "es" = "es"): BlwSafetyRule[] {
  return locale === "pt-BR" ? BLW_GOLDEN_RULES : BLW_GOLDEN_RULES_ES;
}

export function getBlwForbiddenFoods(locale: "pt-BR" | "es" = "es"): string[] {
  return locale === "pt-BR" ? BLW_FORBIDDEN_FOODS : BLW_FORBIDDEN_FOODS_ES;
}
