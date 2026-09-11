export interface FirstWeekDay {
  day: number;
  title: string;
  text: string;
}

export const FIRST_WEEK_DAYS: FirstWeekDay[] = [
  {
    day: 1,
    title: "Um único alimento, quantidade pequena",
    text: "Ofereça 1 a 2 colheres de chá (cerca de 5 a 10g) de um único alimento amassado, sempre no mesmo horário do dia — de preferência pela manhã, quando você pode observar o bebê com calma pelo resto do dia.",
  },
  {
    day: 2,
    title: "Repita o mesmo alimento",
    text: "Ofereça o mesmo alimento do dia 1, em quantidade um pouco maior se o bebê aceitar bem. Continue observando pele, fezes e comportamento.",
  },
  {
    day: 3,
    title: "Ainda o mesmo alimento",
    text: "Mantenha o mesmo alimento por um terceiro dia. Essa janela de 3 dias é o tempo geralmente considerado para perceber a maioria das reações alérgicas antes de introduzir algo novo.",
  },
  {
    day: 4,
    title: "Um segundo alimento, sozinho",
    text: "Se não houve nenhuma reação, introduza um novo alimento — também sozinho, sem misturar com o anterior — repetindo o mesmo processo de observação.",
  },
  {
    day: 5,
    title: "Comece a combinar sabores",
    text: "Com dois alimentos já testados sem reação, você pode começar a oferecê-los juntos na mesma refeição.",
  },
  {
    day: 6,
    title: "Aumente levemente a quantidade",
    text: "Se o apetite do bebê estiver pedindo mais, aumente as porções aos poucos — sem forçar. O leite (materno ou fórmula) continua sendo a base da alimentação nessa fase.",
  },
  {
    day: 7,
    title: "Uma segunda refeição sólida, se fizer sentido",
    text: "Muitas famílias começam a incluir uma segunda refeição de sólidos por dia perto do fim da primeira semana. Siga o ritmo do seu bebê — não existe pressa aqui.",
  },
];

export interface ProgressionStage {
  fromMonth: number;
  toMonth: number;
  label: string;
  texture: string;
  frequency: string;
  quantity: string;
}

export const PROGRESSION_STAGES: ProgressionStage[] = [
  {
    fromMonth: 6,
    toMonth: 7,
    label: "6 a 7 meses",
    texture: "Papinhas bem amassadas, sem pedaços, consistência de purê.",
    frequency: "1 a 2 refeições sólidas por dia, além do leite.",
    quantity: "Poucas colheres por refeição — o volume importa menos que a exposição ao sabor.",
  },
  {
    fromMonth: 8,
    toMonth: 9,
    label: "8 a 9 meses",
    texture: "Amassado grosseiro, com pequenos pedaços macios que o bebê já consegue gerenciar.",
    frequency: "2 a 3 refeições sólidas por dia.",
    quantity: "Porções crescendo gradualmente, seguindo o apetite do bebê.",
  },
  {
    fromMonth: 10,
    toMonth: 12,
    label: "10 a 12 meses",
    texture: "Pedaços pequenos e comidinha de mão (finger food), texturas mais firmes.",
    frequency: "3 refeições sólidas por dia, mais 1 a 2 lanches leves.",
    quantity: "Porções próximas de uma refeição pequena de adulto, em miniatura.",
  },
  {
    fromMonth: 13,
    toMonth: 24,
    label: "13 a 24 meses",
    texture: "Comida da família, cortada em pedaços seguros para a idade.",
    frequency: "3 refeições principais e 2 lanches por dia, no ritmo da família.",
    quantity: "Porções seguem o apetite — a criança regula bem sozinha nessa fase.",
  },
];

export interface SafetyRule {
  title: string;
  text: string;
  severity: "proibido" | "atencao";
}

export const SAFETY_RULES: SafetyRule[] = [
  {
    title: "Mel",
    text: "Proibido antes de 1 ano — risco de botulismo infantil, uma intoxicação grave causada por esporos presentes no mel.",
    severity: "proibido",
  },
  {
    title: "Sal e açúcar adicionados",
    text: "Evite adicionar sal e açúcar até 1 ano. Os rins do bebê ainda não processam bem o excesso de sódio, e o paladar por doce não precisa ser estimulado cedo.",
    severity: "proibido",
  },
  {
    title: "Leite de vaca como bebida principal",
    text: "Não deve substituir o leite materno ou fórmula antes de 1 ano. Pode ser usado em pequena quantidade como ingrediente de preparações, se orientado pelo pediatra.",
    severity: "proibido",
  },
  {
    title: "Alimentos redondos e duros inteiros",
    text: "Uva inteira, tomate-cereja inteiro, amendoim inteiro, pipoca e balas são os principais causadores de engasgo grave. Sempre corte, amasse ou pique.",
    severity: "proibido",
  },
  {
    title: "Ultraprocessados e embutidos",
    text: "Salsicha, presunto, salgadinhos e refrigerantes não têm valor nutricional para essa fase e sobrecarregam o paladar com sal e conservantes.",
    severity: "atencao",
  },
  {
    title: "Cafeína",
    text: "Café, chá preto/mate e chocolate em excesso devem ser evitados — o sistema nervoso do bebê é muito sensível a estimulantes.",
    severity: "atencao",
  },
  {
    title: "Peixes com mercúrio",
    text: "Peixes grandes e predadores (como cação e peixe-espada) devem ser oferecidos com moderação pelo acúmulo de mercúrio. Peixes menores são uma ótima fonte de proteína.",
    severity: "atencao",
  },
];

// ─── Versão em espanhol ───
export const FIRST_WEEK_DAYS_ES: FirstWeekDay[] = [
  {
    day: 1,
    title: "Un solo alimento, en poca cantidad",
    text: "Ofrece 1 a 2 cucharaditas (unos 5 a 10g) de un único alimento aplastado, siempre a la misma hora del día — de preferencia en la mañana, para poder observar al bebé con calma el resto del día.",
  },
  {
    day: 2,
    title: "Repite el mismo alimento",
    text: "Ofrece el mismo alimento del día 1, en cantidad un poco mayor si el bebé lo acepta bien. Sigue observando piel, deposiciones y comportamiento.",
  },
  {
    day: 3,
    title: "Todavía el mismo alimento",
    text: "Mantén el mismo alimento por un tercer día. Esta ventana de 3 días es el tiempo generalmente considerado para notar la mayoría de las reacciones alérgicas antes de introducir algo nuevo.",
  },
  {
    day: 4,
    title: "Un segundo alimento, solo",
    text: "Si no hubo ninguna reacción, introduce un nuevo alimento — también solo, sin mezclar con el anterior — repitiendo el mismo proceso de observación.",
  },
  {
    day: 5,
    title: "Empieza a combinar sabores",
    text: "Con dos alimentos ya probados sin reacción, puedes empezar a ofrecerlos juntos en la misma comida.",
  },
  {
    day: 6,
    title: "Aumenta levemente la cantidad",
    text: "Si el apetito del bebé pide más, aumenta las porciones de a poco — sin forzar. La leche (materna o fórmula) sigue siendo la base de la alimentación en esta etapa.",
  },
  {
    day: 7,
    title: "Una segunda comida sólida, si tiene sentido",
    text: "Muchas familias empiezan a incluir una segunda comida de sólidos al día cerca del final de la primera semana. Sigue el ritmo de tu bebé — no hay apuro aquí.",
  },
];

export const PROGRESSION_STAGES_ES: ProgressionStage[] = [
  {
    fromMonth: 6,
    toMonth: 7,
    label: "6 a 7 meses",
    texture: "Papillas bien aplastadas, sin trozos, consistencia de puré.",
    frequency: "1 a 2 comidas sólidas al día, además de la leche.",
    quantity: "Pocas cucharadas por comida — el volumen importa menos que la exposición al sabor.",
  },
  {
    fromMonth: 8,
    toMonth: 9,
    label: "8 a 9 meses",
    texture: "Aplastado grueso, con trocitos blandos que el bebé ya puede manejar.",
    frequency: "2 a 3 comidas sólidas al día.",
    quantity: "Porciones creciendo gradualmente, según el apetito del bebé.",
  },
  {
    fromMonth: 10,
    toMonth: 12,
    label: "10 a 12 meses",
    texture: "Trozos pequeños y finger food, texturas más firmes.",
    frequency: "3 comidas sólidas al día, más 1 a 2 colaciones ligeras.",
    quantity: "Porciones cercanas a una comida pequeña de adulto, en miniatura.",
  },
  {
    fromMonth: 13,
    toMonth: 24,
    label: "13 a 24 meses",
    texture: "Comida de la familia, cortada en trozos seguros para la edad.",
    frequency: "3 comidas principales y 2 colaciones al día, al ritmo de la familia.",
    quantity: "Las porciones siguen el apetito — el niño se regula bien solo en esta etapa.",
  },
];

export const SAFETY_RULES_ES: SafetyRule[] = [
  {
    title: "Miel",
    text: "Prohibida antes de 1 año — riesgo de botulismo infantil, una intoxicación grave causada por esporas presentes en la miel.",
    severity: "proibido",
  },
  {
    title: "Sal y azúcar agregados",
    text: "Evita agregar sal y azúcar hasta 1 año. Los riñones del bebé todavía no procesan bien el exceso de sodio, y el gusto por lo dulce no necesita estimularse temprano.",
    severity: "proibido",
  },
  {
    title: "Leche de vaca como bebida principal",
    text: "No debe reemplazar la leche materna o fórmula antes de 1 año. Puede usarse en poca cantidad como ingrediente de preparaciones, si el pediatra lo indica.",
    severity: "proibido",
  },
  {
    title: "Alimentos redondos y duros enteros",
    text: "Uva entera, tomate cherry entero, maní entero, palomitas y caramelos son las principales causas de atragantamiento grave. Siempre corta, aplasta o pica.",
    severity: "proibido",
  },
  {
    title: "Ultraprocesados y embutidos",
    text: "Vienesas, jamón, snacks y bebidas azucaradas no aportan valor nutricional en esta etapa y sobrecargan el paladar con sal y conservantes.",
    severity: "atencao",
  },
  {
    title: "Cafeína",
    text: "El café, té negro/mate y chocolate en exceso deben evitarse — el sistema nervioso del bebé es muy sensible a los estimulantes.",
    severity: "atencao",
  },
  {
    title: "Pescados con mercurio",
    text: "Pescados grandes y depredadores (como tiburón y pez espada) deben ofrecerse con moderación por la acumulación de mercurio. Los pescados más pequeños son una excelente fuente de proteína.",
    severity: "atencao",
  },
];

export function getFirstWeekDays(locale: "pt-BR" | "es" = "es"): FirstWeekDay[] {
  return locale === "pt-BR" ? FIRST_WEEK_DAYS : FIRST_WEEK_DAYS_ES;
}

export function getProgressionStages(locale: "pt-BR" | "es" = "es"): ProgressionStage[] {
  return locale === "pt-BR" ? PROGRESSION_STAGES : PROGRESSION_STAGES_ES;
}

export function getSafetyRules(locale: "pt-BR" | "es" = "es"): SafetyRule[] {
  return locale === "pt-BR" ? SAFETY_RULES : SAFETY_RULES_ES;
}
