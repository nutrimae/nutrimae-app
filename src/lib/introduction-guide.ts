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
