import type { Locale } from "@/lib/i18n/locale";

export interface PrepStep {
  action: string;
  why: string;
}

export interface FoodPrepGuide {
  foodId: string;
  steps: PrepStep[];
  freezing: string;
  thawing: string;
}

export const FOOD_PREP_GUIDES: FoodPrepGuide[] = [
  {
    foodId: "banana",
    steps: [
      { action: "Escolha uma banana bem madura, com casca pintada de marrom.", why: "Quanto mais madura, mais macia e mais fácil de amassar sem pedaços duros." },
      { action: "Descasque e amasse com um garfo até virar purê, ou corte em bastão grosso.", why: "O purê evita pedaços que possam ser engolidos inteiros antes da idade de mastigar bem." },
      { action: "Sirva na hora — a banana escurece e perde textura rápido.", why: "Depois de exposta ao ar, oxida e pode ficar com sabor amargo." },
    ],
    freezing: "Amasse a banana, coloque em cubos de gelo ou potes pequenos e congele por até 2 meses.",
    thawing: "Descongele na geladeira de um dia para o outro, ou em banho-maria em fogo baixo, mexendo sempre.",
  },
  {
    foodId: "maca",
    steps: [
      { action: "Descasque, retire o miolo e corte em cubos pequenos.", why: "A casca é mais dura de mastigar e pode se soltar em pedaços grandes." },
      { action: "Cozinhe no vapor por 8 a 10 minutos, até um garfo entrar sem esforço.", why: "Maçã crua, mesmo picada, é firme demais e um dos alimentos que mais causa engasgo nessa fase." },
      { action: "Amasse ou pique conforme a fase do bebê.", why: "A textura deve acompanhar a habilidade de mastigação de cada idade." },
    ],
    freezing: "Cozinhe, amasse e congele em potes pequenos por até 2 meses.",
    thawing: "Descongele na geladeira ou aqueça em banho-maria antes de servir morno.",
  },
  {
    foodId: "pera",
    steps: [
      { action: "Escolha uma pera madura, mas ainda firme.", why: "Facilita cortar em bastões que não desmancham na mão." },
      { action: "Descasque e corte em palitos grossos ou cubos, conforme a fase.", why: "Bastões grossos são mais seguros para bebês pequenos segurarem sem quebrar em pedaços pequenos." },
      { action: "Para bebês de 6-7 meses, cozinhe no vapor por 6 minutos antes de amassar.", why: "Amacia a fruta, reduzindo o risco de pedaços firmes demais para essa fase." },
    ],
    freezing: "Cozida e amassada, congele em potes pequenos por até 2 meses.",
    thawing: "Descongele na geladeira e aqueça levemente antes de servir.",
  },
  {
    foodId: "mamao",
    steps: [
      { action: "Escolha um mamão bem maduro, com a casca alaranjada.", why: "Fica naturalmente macio, sem precisar cozinhar." },
      { action: "Retire a casca e as sementes por completo.", why: "As sementes são duras e não devem ser oferecidas ao bebê." },
      { action: "Corte em bastão grande (BLW) ou cubos pequenos, conforme a fase.", why: "O mamão maduro já desmancha fácil na boca, então o corte pode ser mais simples." },
    ],
    freezing: "Amassado, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira; sirva gelado ou em temperatura ambiente.",
  },
  {
    foodId: "manga",
    steps: [
      { action: "Escolha uma manga madura, que cede levemente ao toque.", why: "Fica macia o suficiente para amassar ou cortar em bastão seguro." },
      { action: "Descasque e retire toda a polpa em volta do caroço.", why: "A casca é fibrosa e difícil de mastigar." },
      { action: "Amasse ou corte em bastão/cubos conforme a fase do bebê.", why: "Textura deve acompanhar a habilidade de mastigação." },
    ],
    freezing: "Em cubos ou purê, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira antes de servir.",
  },
  {
    foodId: "morango",
    steps: [
      { action: "Lave bem em água corrente, retirando o cabinho.", why: "É um dos alimentos com mais resíduo de agrotóxico — lavar bem reduz o risco." },
      { action: "Corte em pedaços pequenos ou fatias grossas, conforme a fase.", why: "Morango inteiro pode ser grande demais para a boca do bebê." },
      { action: "Ofereça sozinho na primeira vez, sem misturar com outros alérgenos.", why: "Morango é um gatilho comum de reações leves em pele sensível — mais fácil identificar isolado." },
    ],
    freezing: "Fatiado, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira; a textura fica mais mole que o fresco, ideal para bebês pequenos.",
  },
  {
    foodId: "tomate",
    steps: [
      { action: "Faça um corte em X na casca e mergulhe em água fervente por 1 minuto.", why: "Facilita retirar a casca, que é difícil de mastigar e pode se soltar em tiras." },
      { action: "Retire a casca e as sementes.", why: "As sementes soltas podem incomodar bebês pequenos e a casca é fibrosa." },
      { action: "Cozinhe levemente e amasse, ou pique em pedaços pequenos conforme a fase.", why: "Reduz a acidez e amacia a textura." },
    ],
    freezing: "Cozido e amassado (tipo molho), em potes pequenos, por até 3 meses.",
    thawing: "Descongele e aqueça em fogo baixo antes de servir.",
  },
  {
    foodId: "cenoura",
    steps: [
      { action: "Descasque e corte em bastões ou rodelas, conforme a fase.", why: "O corte facilita o cozimento uniforme." },
      { action: "Cozinhe no vapor ou em água por 15 a 20 minutos, até um garfo entrar sem esforço.", why: "Cenoura crua é dura e um dos alimentos mais associados a engasgo grave — precisa ficar bem macia." },
      { action: "Amasse ou mantenha em bastão conforme a fase e o método (papinha ou BLW).", why: "Bastão cozido e macio é seguro para o bebê segurar e morder sozinho." },
    ],
    freezing: "Cozida e amassada, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira e aqueça antes de servir morna.",
  },
  {
    foodId: "batata-doce",
    steps: [
      { action: "Descasque e corte em cubos ou bastões.", why: "Facilita o cozimento por igual." },
      { action: "Cozinhe no vapor ou em água por 15 a 20 minutos, até ficar bem macia.", why: "A batata-doce crua é dura demais para o bebê mastigar com segurança." },
      { action: "Amasse ou mantenha em bastão macio, conforme a fase.", why: "É um ótimo primeiro alimento — naturalmente doce e fácil de amassar." },
    ],
    freezing: "Cozida e amassada, em potes pequenos, por até 3 meses.",
    thawing: "Descongele na geladeira e aqueça antes de servir.",
  },
  {
    foodId: "batata",
    steps: [
      { action: "Descasque e corte em cubos.", why: "Facilita o cozimento por igual." },
      { action: "Cozinhe em água até ficar bem macia (cerca de 15 minutos).", why: "Batata crua é dura e indigesta." },
      { action: "Amasse ou mantenha em cubos macios, conforme a fase.", why: "Textura deve acompanhar a habilidade de mastigação." },
    ],
    freezing: "O purê de batata pode ficar com textura granulada ao descongelar — prefira congelar em preparações como sopas.",
    thawing: "Descongele na geladeira e aqueça em fogo baixo, mexendo, para recuperar a cremosidade.",
  },
  {
    foodId: "abobrinha",
    steps: [
      { action: "Lave bem e corte em bastões ou cubos, com ou sem casca.", why: "A casca é macia e nutritiva, pode ser mantida se bem lavada." },
      { action: "Cozinhe no vapor por 8 a 10 minutos, até ficar bem macia.", why: "Facilita amassar e reduz o risco de pedaços firmes." },
      { action: "Amasse ou mantenha em bastão, conforme a fase.", why: "É um dos legumes mais suaves para o primeiro contato." },
    ],
    freezing: "Cozida e amassada, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira e aqueça levemente.",
  },
  {
    foodId: "brocolis",
    steps: [
      { action: "Separe em floretes, lave bem.", why: "Facilita o cozimento uniforme e o manuseio pelo bebê." },
      { action: "Cozinhe no vapor por 6 a 8 minutos, até ficar bem macio.", why: "Brócolis cru é duro e fibroso — precisa amaciar bem para ser seguro." },
      { action: "Ofereça o floreto inteiro (BLW) como um 'cabo natural', ou pique pequeno.", why: "O talo funciona como pegador natural, ajudando o bebê a se alimentar sozinho com segurança." },
    ],
    freezing: "Cozido, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira e aqueça antes de servir.",
  },
  {
    foodId: "frango",
    steps: [
      { action: "Cozinhe o peito de frango em água até ficar completamente cozido (sem partes rosadas).", why: "Frango mal cozido é risco de contaminação bacteriana." },
      { action: "Desfie bem fino com dois garfos, ou pique conforme a fase.", why: "Frango é fibroso — desfiar bem fino evita pedaços difíceis de mastigar." },
      { action: "Confira que não sobrou nenhum osso ou cartilagem.", why: "Ossos pequenos podem passar despercebidos e são risco sério de engasgo." },
    ],
    freezing: "Cozido e desfiado, em potes pequenos, por até 3 meses.",
    thawing: "Descongele na geladeira (nunca em temperatura ambiente) e reaqueça bem antes de servir.",
  },
  {
    foodId: "carne-moida",
    steps: [
      { action: "Refogue a carne moída em fogo médio até perder toda a cor rosada.", why: "Carne mal cozida é risco de contaminação bacteriana, mais sério em bebês pequenos." },
      { action: "Escorra o excesso de gordura.", why: "Facilita a digestão e reduz o sódio/gordura da refeição." },
      { action: "Amasse ainda mais fino para bebês pequenos, ou deixe em pedacinhos soltos para os maiores.", why: "A textura deve acompanhar a fase de mastigação." },
    ],
    freezing: "Cozida, em potes pequenos, por até 3 meses.",
    thawing: "Descongele na geladeira e reaqueça bem antes de servir.",
  },
  {
    foodId: "peixe",
    steps: [
      { action: "Escolha um filé sem pele, de peixe branco (como tilápia ou merluza).", why: "Peixes brancos costumam ter menos espinhas e sabor mais suave." },
      { action: "Cozinhe no vapor por 8 a 10 minutos, até ficar bem cozido e esbranquiçado.", why: "Peixe cru ou malcozido é risco de contaminação." },
      { action: "Desfie com os dedos, apalpando cuidadosamente cada pedaço em busca de espinhas.", why: "Espinhas são finas e difíceis de ver — apalpar é mais seguro do que só olhar." },
    ],
    freezing: "Cozido e desfiado, em potes pequenos, por até 2 meses.",
    thawing: "Descongele na geladeira e reaqueça bem, conferindo as espinhas novamente antes de servir.",
  },
  {
    foodId: "ovo",
    steps: [
      { action: "Cozinhe o ovo até a gema e a clara ficarem completamente firmes (cerca de 10 minutos fervendo, ou bem mexido na frigideira).", why: "Ovo cru ou mole é risco de contaminação por salmonela, mais perigoso para bebês." },
      { action: "Amasse com um garfo, ou corte em tiras/pedaços conforme a fase.", why: "Facilita o manuseio e reduz risco de pedaços grandes." },
      { action: "Na primeira oferta, dê só a clara ou só a gema, isoladamente, e observe por alguns dias.", why: "Ovo é um alérgeno comum — introduzir aos poucos ajuda a identificar reações com clareza." },
    ],
    freezing: "Não recomendado — o ovo cozido muda de textura (fica emborrachado) ao congelar.",
    thawing: "Não aplicável — prepare sempre fresco.",
  },
  {
    foodId: "queijo",
    steps: [
      { action: "Prefira queijos frescos e macios, como minas frescal ou cottage.", why: "São mais fáceis de amassar e têm menos sódio que queijos curados." },
      { action: "Corte em cubos pequenos ou amasse, conforme a fase.", why: "Queijos macios ainda podem ser firmes demais inteiros para bebês pequenos." },
      { action: "Ofereça em pequena quantidade.", why: "Queijo tem sódio e gordura — não deve ser a base da refeição." },
    ],
    freezing: "Não recomendado — queijos frescos perdem textura ao congelar.",
    thawing: "Não aplicável.",
  },
  {
    foodId: "pao",
    steps: [
      { action: "Escolha pão macio, de preferência integral e sem casca dura.", why: "Casca crocante pode ser difícil de mastigar e engolir com segurança." },
      { action: "Corte em tiras compridas (BLW) ou pedaços pequenos, conforme a fase.", why: "Tiras compridas funcionam como um cabo natural, fáceis de segurar." },
      { action: "Se o bebê tiver pouca saliva ainda, umedeça levemente com um pouco de purê de fruta ou azeite.", why: "Pão seco pode grudar no céu da boca de bebês pequenos." },
    ],
    freezing: "Não recomendado fatiado com cobertura — congele o pão puro, se necessário, e prepare na hora.",
    thawing: "Descongele em temperatura ambiente ou torradeira em fogo baixo.",
  },
  {
    foodId: "arroz",
    steps: [
      { action: "Cozinhe com bastante água até ficar bem macio e soltinho.", why: "Arroz mal cozido ou duro é difícil de mastigar para bebês pequenos." },
      { action: "Para bebês de 6-7 meses, amasse levemente ou bata com um pouco de água/caldo.", why: "Reduz o risco de grãos inteiros serem engolidos sem mastigar." },
      { action: "Para os maiores, sirva soltinho, como o resto da família.", why: "Nessa fase o bebê já mastiga melhor grãos inteiros macios." },
    ],
    freezing: "Cozido, em potes pequenos, por até 1 mês (a textura pode ficar levemente ressecada).",
    thawing: "Descongele e aqueça com um pouco de água ou caldo para recuperar a umidade.",
  },
  {
    foodId: "feijao",
    steps: [
      { action: "Cozinhe até os grãos ficarem bem macios, desmanchando facilmente com o garfo.", why: "Feijão mal cozido é duro e difícil de digerir." },
      { action: "Para bebês de 6-7 meses, retire a casca (aperte o grão entre os dedos) e amasse.", why: "A casca do feijão é fibrosa e pode ser difícil de mastigar para os menores." },
      { action: "Para os maiores, sirva os grãos inteiros e macios, com o caldo.", why: "O caldo do feijão é rico em nutrientes e ajuda na textura da refeição." },
    ],
    freezing: "Cozido, com caldo, em potes pequenos, por até 3 meses.",
    thawing: "Descongele na geladeira e aqueça bem antes de servir.",
  },
  // ─── Guias de Preparo Regionais ───

  {
    foodId: "acai",
    steps: [
      { action: "Use polpa de açaí 100% pura, congelada, sem adição de açúcar ou xarope.", why: "Açaí comercial geralmente vem com muito açúcar adicionado — verificar rótulo." },
      { action: "Bata a polpa congelada com um pouco de água até ficar cremoso e liso.", why: "Consistência lisa evita pedaços que possam engasgar." },
      { action: "Misture com banana madura amassada para adoçar naturalmente.", why: "A banana dá doçura sem precisar de açúcar." },
    ],
    freezing: "A polpa pura pode ser recongelada em cubos de gelo por até 3 meses.",
    thawing: "Descongele parcialmente e bata no liquidificador. Não precisa descongelar totalmente.",
  },
  {
    foodId: "tucuma",
    steps: [
      { action: "Escolha tucumãs maduros — a casca deve estar amarelo-alaranjada escura.", why: "Tucumã verde é muito duro e fibroso demais para bebê." },
      { action: "Retire toda a polpa do caroço com uma faca, raspando bem.", why: "O caroço é muito duro e não pode ser oferecido ao bebê." },
      { action: "Amasse a polpa com garfo até formar um purê, ou bata no liquidificador.", why: "A textura fibrosa do tucumã precisa ser bem processada para bebês." },
    ],
    freezing: "Congele a polpa já processada em potinhos por até 2 meses.",
    thawing: "Descongele na geladeira de um dia para o outro.",
  },
  {
    foodId: "cupuacu",
    steps: [
      { action: "Retire a polpa das sementes — use polpa congelada de boa procedência se não tiver a fruta fresca.", why: "A polpa fresca é ácida e viscosa; congelada é mais prática." },
      { action: "Bata no liquidificador com um pouco de água e coe se for para bebê de 6-7 meses.", why: "Coar remove fibras grossas que podem ser difíceis de engolir nos primeiros meses." },
      { action: "Misture com banana ou mamão para equilibrar a acidez.", why: "Cupuaçu puro é bem azedo — misturar com fruta doce melhora a aceitação." },
    ],
    freezing: "Congele a polpa pura em forminhas de gelo por até 3 meses.",
    thawing: "Descongele na geladeira ou em banho-maria em fogo baixo.",
  },
  {
    foodId: "tambaqui",
    steps: [
      { action: "Cozinhe o peixe em água ou vapor até ficar totalmente cozido e opaco.", why: "Peixe mal cozido pode conter parasitas — cozimento completo é obrigatório." },
      { action: "Desfie o peixe em fios bem finos com as mãos.", why: "Desfiar manualmente permite sentir espinhas que passam despercebidas com garfo." },
      { action: "PASSE OS DEDOS por todo o peixe desfiado, sentindo cuidadosamente por espinhas.", why: "Tambaqui tem muitas espinhas finas — a checagem manual é a única forma segura." },
      { action: "Amasse ou misture em papinhas com legumes.", why: "Misturar com purê de legumes facilita a ingestão e enriquece nutricionalmente." },
    ],
    freezing: "Congele o peixe já cozido e desfiado (sem espinhas) em porções pequenas por até 2 meses.",
    thawing: "Descongele na geladeira de um dia para o outro. Reaqueça completamente antes de servir.",
  },
  {
    foodId: "pirarucu",
    steps: [
      { action: "Cozinhe as postas ou filés em água até ficarem bem cozidos.", why: "Pirarucu é um peixe grande e tem postas grossas — garantir cozimento por dentro." },
      { action: "Desfie todo o peixe com as mãos e cheque espinhas manualmente.", why: "Mesmo sendo peixe de postas grandes, pode ter espinhas escondidas." },
      { action: "Amasse ou misture em preparações com legumes.", why: "O sabor suave do pirarucu combina bem com purês." },
    ],
    freezing: "Congele desfiado e livre de espinhas em porções por até 2 meses.",
    thawing: "Descongele na geladeira. Reaqueça bem antes de servir.",
  },
  {
    foodId: "tucunare",
    steps: [
      { action: "Cozinhe o peixe inteiro ou em postas até ficar completamente cozido.", why: "Tucunaré cru ou mal passado não deve ser oferecido a bebês." },
      { action: "Desfie cuidadosamente com as mãos e cheque cada porção para espinhas.", why: "Checagem manual é obrigatória — espinhas finas são perigosas." },
      { action: "Misture com purê de legumes ou use em caldos.", why: "O caldo de tucunaré é nutritivo e saboroso para papinhas." },
    ],
    freezing: "Congele desfiado e livre de espinhas por até 2 meses.",
    thawing: "Descongele na geladeira de um dia para o outro.",
  },
  {
    foodId: "umbu",
    steps: [
      { action: "Escolha umbus bem maduros — devem estar macios ao toque e com cor amarelada.", why: "Umbu verde é muito ácido e pode irritar o estômago do bebê." },
      { action: "Lave bem, retire a casca e o caroço.", why: "A casca é grossa e o caroço grande — ambos devem ser removidos." },
      { action: "Amasse a polpa com garfo.", why: "A polpa madura já é bem macia e fácil de amassar." },
    ],
    freezing: "Congele a polpa amassada em forminhas de gelo por até 3 meses.",
    thawing: "Descongele na geladeira.",
  },
  {
    foodId: "caju-fruta",
    steps: [
      { action: "Escolha cajus bem maduros, macios e de cor intensa (amarelo ou vermelho).", why: "Caju verde é muito adstringente e difícil de engolir." },
      { action: "Lave, remova a castanha (se ainda estiver presa) e esprema o suco.", why: "A castanha de caju é ALÉRGENO — não oferecer para o bebê." },
      { action: "Coe o suco para remover fibras e ofereça puro ou misturado com outra fruta.", why: "As fibras do caju são longas e podem ser difíceis de engolir." },
    ],
    freezing: "Congele o suco coado em forminhas de gelo por até 2 meses.",
    thawing: "Descongele na geladeira.",
  },
  {
    foodId: "feijao-de-corda",
    steps: [
      { action: "Deixe os grãos de molho por 8-12 horas, trocando a água pelo menos uma vez.", why: "O molho reduz fitatos e facilita a digestão." },
      { action: "Cozinhe em panela de pressão por 20-25 minutos até ficar bem mole.", why: "Grãos duros são risco de engasgo — precisam ficar bem macios." },
      { action: "Para bebê de 6-7 meses, amasse com garfo e use bastante caldo.", why: "O caldo grosso do feijão é rico em ferro e nutrientes." },
    ],
    freezing: "Congele cozido (com caldo) em porções por até 3 meses.",
    thawing: "Descongele na geladeira e reaqueça completamente.",
  },
  {
    foodId: "pequi",
    steps: [
      { action: "Cozinhe o pequi inteiro (com caroço) em água por 30-40 minutos.", why: "O cozimento longo amolece a polpa e facilita a retirada sem risco." },
      { action: "COM UMA COLHER, raspe toda a polpa ao redor do caroço. NUNCA morda, rosse ou quebre o caroço.", why: "O caroço do pequi contém milhares de espinhos finíssimos por dentro que podem perfurar boca, gengiva e garganta — risco grave de lesão." },
      { action: "Verifique visualmente se nenhum espinho ou fragmento de caroço ficou na polpa.", why: "Mesmo raspando com colher, fragmentos podem se soltar." },
      { action: "Amasse a polpa com garfo até virar purê e misture em arroz ou papinhas.", why: "Garante que nenhum fragmento de caroço passou despercebido na textura lisa." },
    ],
    freezing: "Congele a polpa já retirada do caroço, amassada, em potinhos por até 3 meses.",
    thawing: "Descongele na geladeira de um dia para o outro.",
  },
  {
    foodId: "guariroba",
    steps: [
      { action: "Corte a guariroba em rodelas finas e cozinhe em água por pelo menos 30 minutos.", why: "A guariroba é naturalmente amarga e firme — o cozimento longo suaviza ambos." },
      { action: "Troque a água pelo menos uma vez durante o cozimento se quiser reduzir o amargor.", why: "Parte do amargor sai na água de cozimento." },
      { action: "Pique bem miúda depois de cozida.", why: "A textura fibrosa pode ser difícil de mastigar para bebês." },
    ],
    freezing: "Congele cozida e picada em porções por até 2 meses.",
    thawing: "Descongele na geladeira e reaqueça.",
  },
  {
    foodId: "pinhao",
    steps: [
      { action: "Faça um corte na casca de cada pinhão (como se faz com castanha).", why: "O corte permite que o vapor entre e cozinhe por dentro." },
      { action: "Cozinhe na panela de pressão por 40 minutos, ou em água fervente por 1 hora.", why: "Pinhão mal cozido é duro e representa risco alto de engasgo." },
      { action: "Retire a casca e a película marrom interna.", why: "A película é amarga e difícil de digerir." },
      { action: "Pique em pedaços BEM pequenos ou amasse com garfo.", why: "Pinhão inteiro ou em pedaços grandes é risco de engasgo mesmo cozido." },
    ],
    freezing: "Congele já cozido e descascado em saco hermético por até 3 meses.",
    thawing: "Descongele na geladeira. Pode reaquecer no vapor.",
  },
];

// ─── Versão em espanhol ───
// Mesmos foodIds, mesma ordem, mesmo significado técnico/segurança —
// só o texto muda. Ver nota em FOODS_ES (src/lib/foods.ts) sobre o
// mesmo padrão de array espelhado por locale.
export const FOOD_PREP_GUIDES_ES: FoodPrepGuide[] = [
  {
    foodId: "banana",
    steps: [
      { action: "Elige un plátano bien maduro, con la cáscara pintada de marrón.", why: "Cuanto más maduro, más blando y más fácil de aplastar sin trozos duros." },
      { action: "Pela y aplasta con un tenedor hasta formar puré, o córtalo en bastón grueso.", why: "El puré evita trozos que puedan tragarse enteros antes de la edad de masticar bien." },
      { action: "Sírvelo al momento — el plátano se oscurece y pierde textura rápido.", why: "Una vez expuesto al aire, se oxida y puede tomar un sabor amargo." },
    ],
    freezing: "Aplasta el plátano, colócalo en cubos de hielo o potecitos pequeños y congela por hasta 2 meses.",
    thawing: "Descongela en el refrigerador de un día para otro, o a baño maría a fuego bajo, revolviendo siempre.",
  },
  {
    foodId: "maca",
    steps: [
      { action: "Pela, retira el centro y corta en cubos pequeños.", why: "La cáscara es más dura de masticar y puede soltarse en trozos grandes." },
      { action: "Cocina al vapor por 8 a 10 minutos, hasta que un tenedor entre sin esfuerzo.", why: "La manzana cruda, aunque picada, es demasiado firme y uno de los alimentos que más causa atragantamiento en esta etapa." },
      { action: "Aplasta o pica según la etapa del bebé.", why: "La textura debe acompañar la habilidad de masticación de cada edad." },
    ],
    freezing: "Cocina, aplasta y congela en potecitos pequeños por hasta 2 meses.",
    thawing: "Descongela en el refrigerador o calienta a baño maría antes de servir tibio.",
  },
  {
    foodId: "pera",
    steps: [
      { action: "Elige una pera madura, pero todavía firme.", why: "Facilita cortarla en bastones que no se deshacen en la mano." },
      { action: "Pela y corta en palitos gruesos o cubos, según la etapa.", why: "Los bastones gruesos son más seguros para que los bebés pequeños los sostengan sin que se rompan en trozos pequeños." },
      { action: "Para bebés de 6-7 meses, cocina al vapor por 6 minutos antes de aplastar.", why: "Ablanda la fruta, reduciendo el riesgo de trozos demasiado firmes para esta etapa." },
    ],
    freezing: "Ya cocida y aplastada, congela en potecitos pequeños por hasta 2 meses.",
    thawing: "Descongela en el refrigerador y calienta levemente antes de servir.",
  },
  {
    foodId: "mamao",
    steps: [
      { action: "Elige una papaya bien madura, con la cáscara anaranjada.", why: "Queda naturalmente blanda, sin necesidad de cocinar." },
      { action: "Retira por completo la cáscara y las semillas.", why: "Las semillas son duras y no deben ofrecerse al bebé." },
      { action: "Corta en bastón grande (BLW) o cubos pequeños, según la etapa.", why: "La papaya madura ya se deshace fácil en la boca, así que el corte puede ser más simple." },
    ],
    freezing: "Aplastada, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador; sirve fría o a temperatura ambiente.",
  },
  {
    foodId: "manga",
    steps: [
      { action: "Elige un mango maduro, que ceda levemente al tacto.", why: "Queda lo bastante blando para aplastar o cortar en bastón seguro." },
      { action: "Pela y retira toda la pulpa alrededor del carozo.", why: "La cáscara es fibrosa y difícil de masticar." },
      { action: "Aplasta o corta en bastón/cubos según la etapa del bebé.", why: "La textura debe acompañar la habilidad de masticación." },
    ],
    freezing: "En cubos o puré, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador antes de servir.",
  },
  {
    foodId: "morango",
    steps: [
      { action: "Lava bien bajo agua corriente, quitando el cabito.", why: "Es uno de los alimentos con más residuo de pesticida — lavar bien reduce el riesgo." },
      { action: "Corta en trozos pequeños o rodajas gruesas, según la etapa.", why: "La frutilla entera puede ser demasiado grande para la boca del bebé." },
      { action: "Ofrécela sola la primera vez, sin mezclar con otros alérgenos.", why: "La frutilla es un gatillo común de reacciones leves en piel sensible — es más fácil identificarlo aislado." },
    ],
    freezing: "En rodajas, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador; la textura queda más blanda que la fresca, ideal para bebés pequeños.",
  },
  {
    foodId: "tomate",
    steps: [
      { action: "Haz un corte en cruz en la cáscara y sumerge en agua hirviendo por 1 minuto.", why: "Facilita retirar la cáscara, que es difícil de masticar y puede soltarse en tiras." },
      { action: "Retira la cáscara y las semillas.", why: "Las semillas sueltas pueden incomodar a los bebés pequeños y la cáscara es fibrosa." },
      { action: "Cocina levemente y aplasta, o pica en trozos pequeños según la etapa.", why: "Reduce la acidez y suaviza la textura." },
    ],
    freezing: "Cocido y aplastado (tipo salsa), en potecitos pequeños, por hasta 3 meses.",
    thawing: "Descongela y calienta a fuego bajo antes de servir.",
  },
  {
    foodId: "cenoura",
    steps: [
      { action: "Pela y corta en bastones o rodajas, según la etapa.", why: "El corte facilita una cocción pareja." },
      { action: "Cocina al vapor o en agua por 15 a 20 minutos, hasta que un tenedor entre sin esfuerzo.", why: "La zanahoria cruda es dura y uno de los alimentos más asociados a atragantamiento grave — necesita quedar bien blanda." },
      { action: "Aplasta o mantén en bastón según la etapa y el método (papilla o BLW).", why: "El bastón cocido y blando es seguro para que el bebé lo sostenga y muerda solo." },
    ],
    freezing: "Ya cocida y aplastada, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador y calienta antes de servir tibia.",
  },
  {
    foodId: "batata-doce",
    steps: [
      { action: "Pela y corta en cubos o bastones.", why: "Facilita una cocción pareja." },
      { action: "Cocina al vapor o en agua por 15 a 20 minutos, hasta que quede bien blanda.", why: "El camote crudo es demasiado duro para que el bebé lo mastique con seguridad." },
      { action: "Aplasta o mantén en bastón blando, según la etapa.", why: "Es un excelente primer alimento — naturalmente dulce y fácil de aplastar." },
    ],
    freezing: "Ya cocida y aplastada, en potecitos pequeños, por hasta 3 meses.",
    thawing: "Descongela en el refrigerador y calienta antes de servir.",
  },
  {
    foodId: "batata",
    steps: [
      { action: "Pela y corta en cubos.", why: "Facilita una cocción pareja." },
      { action: "Cocina en agua hasta que quede bien blanda (unos 15 minutos).", why: "La papa cruda es dura e indigesta." },
      { action: "Aplasta o mantén en cubos blandos, según la etapa.", why: "La textura debe acompañar la habilidad de masticación." },
    ],
    freezing: "El puré de papa puede quedar granulado al descongelar — prefiere congelarlo en preparaciones como sopas.",
    thawing: "Descongela en el refrigerador y calienta a fuego bajo, revolviendo, para recuperar la cremosidad.",
  },
  {
    foodId: "abobrinha",
    steps: [
      { action: "Lava bien y corta en bastones o cubos, con o sin cáscara.", why: "La cáscara es blanda y nutritiva, puede mantenerse si está bien lavada." },
      { action: "Cocina al vapor por 8 a 10 minutos, hasta que quede bien blanda.", why: "Facilita aplastarla y reduce el riesgo de trozos firmes." },
      { action: "Aplasta o mantén en bastón, según la etapa.", why: "Es una de las verduras más suaves para el primer contacto." },
    ],
    freezing: "Ya cocida y aplastada, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador y calienta levemente.",
  },
  {
    foodId: "brocolis",
    steps: [
      { action: "Sepáralo en ramitos, lava bien.", why: "Facilita una cocción pareja y el manejo por parte del bebé." },
      { action: "Cocina al vapor por 6 a 8 minutos, hasta que quede bien blando.", why: "El brócoli crudo es duro y fibroso — necesita ablandarse bien para ser seguro." },
      { action: "Ofrece el ramito entero (BLW) como un 'mango natural', o pícalo pequeño.", why: "El tallo funciona como agarre natural, ayudando al bebé a alimentarse solo con seguridad." },
    ],
    freezing: "Ya cocido, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador y calienta antes de servir.",
  },
  {
    foodId: "frango",
    steps: [
      { action: "Cocina la pechuga de pollo en agua hasta que quede completamente cocida (sin partes rosadas).", why: "El pollo mal cocido es riesgo de contaminación bacteriana." },
      { action: "Deshilacha bien fino con dos tenedores, o pica según la etapa.", why: "El pollo es fibroso — deshilacharlo bien fino evita trozos difíciles de masticar." },
      { action: "Verifica que no haya quedado ningún hueso o cartílago.", why: "Los huesos pequeños pueden pasar desapercibidos y son un riesgo serio de atragantamiento." },
    ],
    freezing: "Ya cocido y deshilachado, en potecitos pequeños, por hasta 3 meses.",
    thawing: "Descongela en el refrigerador (nunca a temperatura ambiente) y recalienta bien antes de servir.",
  },
  {
    foodId: "carne-moida",
    steps: [
      { action: "Sofríe la carne molida a fuego medio hasta que pierda todo el color rosado.", why: "La carne mal cocida es riesgo de contaminación bacteriana, más grave en bebés pequeños." },
      { action: "Escurre el exceso de grasa.", why: "Facilita la digestión y reduce el sodio/grasa de la comida." },
      { action: "Aplasta aún más fino para bebés pequeños, o déjala en trocitos sueltos para los mayores.", why: "La textura debe acompañar la etapa de masticación." },
    ],
    freezing: "Ya cocida, en potecitos pequeños, por hasta 3 meses.",
    thawing: "Descongela en el refrigerador y recalienta bien antes de servir.",
  },
  {
    foodId: "peixe",
    steps: [
      { action: "Elige un filete sin piel, de pescado blanco (como tilapia o merluza).", why: "Los pescados blancos suelen tener menos espinas y sabor más suave." },
      { action: "Cocina al vapor por 8 a 10 minutos, hasta que quede bien cocido y blanquecino.", why: "El pescado crudo o mal cocido es riesgo de contaminación." },
      { action: "Deshilacha con los dedos, palpando cuidadosamente cada trozo en busca de espinas.", why: "Las espinas son finas y difíciles de ver — palpar es más seguro que solo mirar." },
    ],
    freezing: "Ya cocido y deshilachado, en potecitos pequeños, por hasta 2 meses.",
    thawing: "Descongela en el refrigerador y recalienta bien, revisando las espinas de nuevo antes de servir.",
  },
  {
    foodId: "ovo",
    steps: [
      { action: "Cocina el huevo hasta que la yema y la clara queden completamente firmes (unos 10 minutos hirviendo, o bien revuelto en la sartén).", why: "El huevo crudo o poco cocido es riesgo de contaminación por salmonela, más peligroso para bebés." },
      { action: "Aplasta con un tenedor, o corta en tiras/trozos según la etapa.", why: "Facilita el manejo y reduce el riesgo de trozos grandes." },
      { action: "En la primera oferta, da solo la clara o solo la yema, por separado, y observa por algunos días.", why: "El huevo es un alérgeno común — introducirlo de a poco ayuda a identificar reacciones con claridad." },
    ],
    freezing: "No se recomienda — el huevo cocido cambia de textura (queda gomoso) al congelar.",
    thawing: "No aplica — prepáralo siempre fresco.",
  },
  {
    foodId: "queijo",
    steps: [
      { action: "Prefiere quesos frescos y blandos, como queso fresco o cottage.", why: "Son más fáciles de aplastar y tienen menos sodio que los quesos curados." },
      { action: "Corta en cubos pequeños o aplasta, según la etapa.", why: "Los quesos blandos todavía pueden ser demasiado firmes enteros para bebés pequeños." },
      { action: "Ofrécelo en poca cantidad.", why: "El queso tiene sodio y grasa — no debe ser la base de la comida." },
    ],
    freezing: "No se recomienda — los quesos frescos pierden textura al congelar.",
    thawing: "No aplica.",
  },
  {
    foodId: "pao",
    steps: [
      { action: "Elige pan blando, de preferencia integral y sin corteza dura.", why: "La corteza crocante puede ser difícil de masticar y tragar con seguridad." },
      { action: "Corta en tiras largas (BLW) o trozos pequeños, según la etapa.", why: "Las tiras largas funcionan como un mango natural, fáciles de sostener." },
      { action: "Si el bebé todavía tiene poca saliva, humedece levemente con un poco de puré de fruta o aceite de oliva.", why: "El pan seco puede pegarse en el paladar de bebés pequeños." },
    ],
    freezing: "No se recomienda en rebanadas con relleno — congela el pan solo, si es necesario, y prepáralo al momento.",
    thawing: "Descongela a temperatura ambiente o en tostadora a fuego bajo.",
  },
  {
    foodId: "arroz",
    steps: [
      { action: "Cocina con bastante agua hasta que quede bien blando y suelto.", why: "El arroz mal cocido o duro es difícil de masticar para bebés pequeños." },
      { action: "Para bebés de 6-7 meses, aplasta levemente o bate con un poco de agua/caldo.", why: "Reduce el riesgo de que granos enteros se traguen sin masticar." },
      { action: "Para los mayores, sírvelo suelto, como el resto de la familia.", why: "En esta etapa el bebé ya mastica mejor granos enteros blandos." },
    ],
    freezing: "Ya cocido, en potecitos pequeños, por hasta 1 mes (la textura puede quedar levemente reseca).",
    thawing: "Descongela y calienta con un poco de agua o caldo para recuperar la humedad.",
  },
  {
    foodId: "feijao",
    steps: [
      { action: "Cocina hasta que los granos queden bien blandos, deshaciéndose fácilmente con el tenedor.", why: "El poroto mal cocido es duro y difícil de digerir." },
      { action: "Para bebés de 6-7 meses, retira la cáscara (aprieta el grano entre los dedos) y aplasta.", why: "La cáscara del poroto es fibrosa y puede ser difícil de masticar para los más pequeños." },
      { action: "Para los mayores, sirve los granos enteros y blandos, con el caldo.", why: "El caldo del poroto es rico en nutrientes y ayuda con la textura de la comida." },
    ],
    freezing: "Ya cocido, con caldo, en potecitos pequeños, por hasta 3 meses.",
    thawing: "Descongela en el refrigerador y calienta bien antes de servir.",
  },
  // ─── Guías de preparación regionales ───
  {
    foodId: "acai",
    steps: [
      { action: "Usa pulpa de açaí 100% pura, congelada, sin azúcar ni jarabe agregado.", why: "El açaí comercial suele venir con mucha azúcar agregada — hay que revisar la etiqueta." },
      { action: "Bate la pulpa congelada con un poco de agua hasta que quede cremosa y lisa.", why: "La consistencia lisa evita trozos que puedan causar atragantamiento." },
      { action: "Mezcla con plátano maduro aplastado para endulzar de forma natural.", why: "El plátano le da dulzor sin necesidad de azúcar." },
    ],
    freezing: "La pulpa pura puede recongelarse en cubos de hielo por hasta 3 meses.",
    thawing: "Descongela parcialmente y bate en la licuadora. No hace falta descongelar del todo.",
  },
  {
    foodId: "tucuma",
    steps: [
      { action: "Elige tucumãs maduros — la cáscara debe estar de un anaranjado oscuro amarillento.", why: "El tucumã verde es demasiado duro y fibroso para el bebé." },
      { action: "Retira toda la pulpa del carozo con un cuchillo, raspando bien.", why: "El carozo es muy duro y no debe ofrecerse al bebé." },
      { action: "Aplasta la pulpa con tenedor hasta formar un puré, o bátela en la licuadora.", why: "La textura fibrosa del tucumã necesita procesarse bien para bebés." },
    ],
    freezing: "Congela la pulpa ya procesada en potecitos por hasta 2 meses.",
    thawing: "Descongela en el refrigerador de un día para otro.",
  },
  {
    foodId: "cupuacu",
    steps: [
      { action: "Retira la pulpa de las semillas — usa pulpa congelada de buena procedencia si no tienes la fruta fresca.", why: "La pulpa fresca es ácida y viscosa; congelada es más práctica." },
      { action: "Bate en la licuadora con un poco de agua y cuela si es para un bebé de 6-7 meses.", why: "Colar remueve fibras gruesas que pueden ser difíciles de tragar en los primeros meses." },
      { action: "Mezcla con plátano o papaya para equilibrar la acidez.", why: "El cupuaçu puro es bien ácido — mezclarlo con fruta dulce mejora la aceptación." },
    ],
    freezing: "Congela la pulpa pura en cubeteras por hasta 3 meses.",
    thawing: "Descongela en el refrigerador o a baño maría a fuego bajo.",
  },
  {
    foodId: "tambaqui",
    steps: [
      { action: "Cocina el pescado en agua o al vapor hasta que quede totalmente cocido y opaco.", why: "El pescado mal cocido puede contener parásitos — la cocción completa es obligatoria." },
      { action: "Deshilacha el pescado en hebras bien finas con las manos.", why: "Deshilachar a mano permite sentir espinas que pasan desapercibidas con tenedor." },
      { action: "PASA LOS DEDOS por todo el pescado deshilachado, sintiendo cuidadosamente si hay espinas.", why: "El tambaquí tiene muchas espinas finas — la revisión manual es la única forma segura." },
      { action: "Aplasta o mezcla en papillas con verduras.", why: "Mezclar con puré de verduras facilita la ingesta y enriquece nutricionalmente." },
    ],
    freezing: "Congela el pescado ya cocido y deshilachado (sin espinas) en porciones pequeñas por hasta 2 meses.",
    thawing: "Descongela en el refrigerador de un día para otro. Recalienta completamente antes de servir.",
  },
  {
    foodId: "pirarucu",
    steps: [
      { action: "Cocina las postas o filetes en agua hasta que queden bien cocidos.", why: "El pirarucú es un pescado grande y tiene postas gruesas — hay que asegurar la cocción por dentro." },
      { action: "Deshilacha todo el pescado con las manos y revisa las espinas manualmente.", why: "Aunque sea pescado de postas grandes, puede tener espinas escondidas." },
      { action: "Aplasta o mezcla en preparaciones con verduras.", why: "El sabor suave del pirarucú combina bien con purés." },
    ],
    freezing: "Congela deshilachado y libre de espinas en porciones por hasta 2 meses.",
    thawing: "Descongela en el refrigerador. Recalienta bien antes de servir.",
  },
  {
    foodId: "tucunare",
    steps: [
      { action: "Cocina el pescado entero o en postas hasta que quede completamente cocido.", why: "El tucunaré crudo o mal cocido no debe ofrecerse a bebés." },
      { action: "Deshilacha cuidadosamente con las manos y revisa cada porción en busca de espinas.", why: "La revisión manual es obligatoria — las espinas finas son peligrosas." },
      { action: "Mezcla con puré de verduras o úsalo en caldos.", why: "El caldo de tucunaré es nutritivo y sabroso para papillas." },
    ],
    freezing: "Congela deshilachado y libre de espinas por hasta 2 meses.",
    thawing: "Descongela en el refrigerador de un día para otro.",
  },
  {
    foodId: "umbu",
    steps: [
      { action: "Elige umbús bien maduros — deben estar blandos al tacto y de color amarillento.", why: "El umbú verde es muy ácido y puede irritar el estómago del bebé." },
      { action: "Lava bien, retira la cáscara y el carozo.", why: "La cáscara es gruesa y el carozo grande — ambos deben retirarse." },
      { action: "Aplasta la pulpa con tenedor.", why: "La pulpa madura ya es bien blanda y fácil de aplastar." },
    ],
    freezing: "Congela la pulpa aplastada en cubeteras por hasta 3 meses.",
    thawing: "Descongela en el refrigerador.",
  },
  {
    foodId: "caju-fruta",
    steps: [
      { action: "Elige marañones bien maduros, blandos y de color intenso (amarillo o rojo).", why: "El marañón verde es muy astringente y difícil de tragar." },
      { action: "Lava, retira la nuez (si todavía está pegada) y exprime el jugo.", why: "La nuez de marañón es un ALÉRGENO — no debe ofrecerse al bebé." },
      { action: "Cuela el jugo para remover fibras y ofrécelo solo o mezclado con otra fruta.", why: "Las fibras del marañón son largas y pueden ser difíciles de tragar." },
    ],
    freezing: "Congela el jugo colado en cubeteras por hasta 2 meses.",
    thawing: "Descongela en el refrigerador.",
  },
  {
    foodId: "feijao-de-corda",
    steps: [
      { action: "Deja los granos en remojo por 8-12 horas, cambiando el agua al menos una vez.", why: "El remojo reduce los fitatos y facilita la digestión." },
      { action: "Cocina en olla a presión por 20-25 minutos hasta que queden bien blandos.", why: "Los granos duros son riesgo de atragantamiento — necesitan quedar bien blandos." },
      { action: "Para bebé de 6-7 meses, aplasta con tenedor y usa bastante caldo.", why: "El caldo espeso del poroto es rico en hierro y nutrientes." },
    ],
    freezing: "Congela ya cocido (con caldo) en porciones por hasta 3 meses.",
    thawing: "Descongela en el refrigerador y recalienta completamente.",
  },
  {
    foodId: "pequi",
    steps: [
      { action: "Cocina el pequi entero (con carozo) en agua por 30-40 minutos.", why: "La cocción larga ablanda la pulpa y facilita retirarla sin riesgo." },
      { action: "CON UNA CUCHARA, raspa toda la pulpa alrededor del carozo. NUNCA lo muerdas, roas o rompas.", why: "El carozo del pequi tiene miles de espinas finísimas por dentro que pueden perforar boca, encía y garganta — riesgo grave de lesión." },
      { action: "Revisa visualmente que no haya quedado ninguna espina o fragmento de carozo en la pulpa.", why: "Aun raspando con cuchara, pueden soltarse fragmentos." },
      { action: "Aplasta la pulpa con tenedor hasta formar puré y mézclala con arroz o papillas.", why: "Garantiza que ningún fragmento de carozo pasó desapercibido en la textura lisa." },
    ],
    freezing: "Congela la pulpa ya retirada del carozo, aplastada, en potecitos por hasta 3 meses.",
    thawing: "Descongela en el refrigerador de un día para otro.",
  },
  {
    foodId: "guariroba",
    steps: [
      { action: "Corta la guariroba en rodajas finas y cocina en agua por al menos 30 minutos.", why: "La guariroba es naturalmente amarga y firme — la cocción larga suaviza ambas cosas." },
      { action: "Cambia el agua al menos una vez durante la cocción si quieres reducir el amargor.", why: "Parte del amargor sale en el agua de cocción." },
      { action: "Pica bien fino después de cocida.", why: "La textura fibrosa puede ser difícil de masticar para bebés." },
    ],
    freezing: "Congela cocida y picada en porciones por hasta 2 meses.",
    thawing: "Descongela en el refrigerador y recalienta.",
  },
  {
    foodId: "pinhao",
    steps: [
      { action: "Haz un corte en la cáscara de cada piñón (como se hace con castañas).", why: "El corte permite que el vapor entre y cocine por dentro." },
      { action: "Cocina en olla a presión por 40 minutos, o en agua hirviendo por 1 hora.", why: "El piñón mal cocido es duro y representa un riesgo alto de atragantamiento." },
      { action: "Retira la cáscara y la película marrón interna.", why: "La película es amarga y difícil de digerir." },
      { action: "Pica en trozos BIEN pequeños o aplasta con tenedor.", why: "El piñón entero o en trozos grandes es riesgo de atragantamiento aun estando cocido." },
    ],
    freezing: "Congela ya cocido y pelado en bolsa hermética por hasta 3 meses.",
    thawing: "Descongela en el refrigerador. Puede recalentarse al vapor.",
  },
];

export function getFoodPrepGuide(foodId: string, locale: Locale = "es"): FoodPrepGuide | undefined {
  const guides = locale === "pt-BR" ? FOOD_PREP_GUIDES : FOOD_PREP_GUIDES_ES;
  return guides.find((g) => g.foodId === foodId);
}
