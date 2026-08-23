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

export function getFoodPrepGuide(foodId: string): FoodPrepGuide | undefined {
  return FOOD_PREP_GUIDES.find((g) => g.foodId === foodId);
}
