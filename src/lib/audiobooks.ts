export interface TranscriptSegment {
  /** Estimativa em segundos — ainda não calibrada com narração real. */
  startSeconds: number;
  text: string;
}

export interface Audiobook {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: string;
  transcript: TranscriptSegment[];
}

export const AUDIOBOOKS: Audiobook[] = [
  {
    id: "janela-imunologica",
    title: "Janela Imunológica",
    subtitle: "Por que o momento da introdução alimentar importa tanto",
    estimatedMinutes: "12-15",
    transcript: [
      { startSeconds: 0, text: "Você provavelmente já ouviu o termo \"janela imunológica\" em algum grupo de mães ou na consulta do pediatra. Vamos entender exatamente o que ela é, por que os especialistas falam tanto sobre ela, e o que isso muda na prática para a introdução alimentar do seu bebê." },
      { startSeconds: 50, text: "A janela imunológica é o período, geralmente entre 4 e 11 meses de idade, em que o sistema imunológico do bebê está mais receptivo a \"aprender\" a tolerar novos alimentos — inclusive os que são alérgenos comuns, como ovo e amendoim. Fora desse período, seja antes ou depois demais, o corpo tende a reagir de forma diferente ao primeiro contato." },
      { startSeconds: 130, text: "Durante muito tempo, a recomendação era justamente o oposto: atrasar ao máximo a introdução de alimentos alergênicos, na esperança de \"proteger\" o bebê. Estudos grandes, como o LEAP (Learning Early About Peanut Allergy), publicado em 2015, mostraram o contrário: atrasar a introdução do amendoim, por exemplo, estava associado a mais casos de alergia, não menos." },
      { startSeconds: 220, text: "Isso mudou completamente as diretrizes internacionais de pediatria. Hoje, sociedades médicas ao redor do mundo — incluindo aqui no Brasil — recomendam introduzir os alimentos alergênicos de forma precoce, dentro da janela, e não evitá-los." },
      { startSeconds: 290, text: "Então qual é o risco de esperar demais? Quando a introdução de um alérgeno é adiada para depois do primeiro ano, o sistema imunológico já teve tempo de se \"decidir\" de outras formas — muitas vezes através do contato com o alimento pela pele, por exemplo, em casos de dermatite atópica. Esse contato indireto, sem a digestão, pode ensinar o corpo a reconhecer aquela proteína como uma ameaça, em vez de como comida seguindo o caminho normal do sistema digestivo." },
      { startSeconds: 380, text: "Por isso a recomendação atual é: assim que a introdução alimentar começar, por volta dos 6 meses, os alérgenos mais comuns devem entrar no cardápio nas primeiras semanas — não deixados para depois." },
      { startSeconds: 440, text: "Quais são esses alérgenos críticos? A lista mais estudada inclui ovo, amendoim, leite de vaca, trigo (glúten), peixe, frutos do mar, soja e castanhas. No Brasil, a ANVISA reconhece 14 alérgenos de declaração obrigatória em rótulos — você encontra a lista completa no checklist de alergênicos aqui no app." },
      { startSeconds: 520, text: "Como aproveitar bem essa janela na prática? Primeiro, não espere. Assim que o bebê começar a comer sólidos, inclua os alérgenos comuns já nas primeiras semanas, um de cada vez, com um intervalo de 3 a 5 dias entre eles para observar reações." },
      { startSeconds: 590, text: "Segundo, mantenha a regularidade. Introduzir um alimento uma única vez e nunca mais oferecer não constrói tolerância. O ideal é manter o alimento no cardápio pelo menos duas vezes por semana depois da primeira introdução bem-sucedida." },
      { startSeconds: 650, text: "Terceiro, ofereça em quantidade real, não só \"provar\". Uma colherzinha simbólica de vez em quando tem menos efeito de construção de tolerância do que uma porção de fato incorporada à rotina alimentar." },
      { startSeconds: 710, text: "E a segurança nisso tudo? Introduzir precocemente não significa abrir mão de cuidado. Ofereça o alimento novo pela manhã, em casa, com você por perto e atenta, nunca à noite ou fora de casa na primeira vez. Assim, se houver alguma reação, você percebe rápido e tem tempo de agir." },
      { startSeconds: 780, text: "Se o seu bebê já tem dermatite atópica moderada a grave, ou histórico familiar forte de alergia alimentar, converse com o pediatra antes de introduzir os alérgenos mais críticos — em alguns casos, a introdução é feita com acompanhamento médico mais próximo, mas ainda assim, precocemente." },
      { startSeconds: 850, text: "Resumindo: a janela imunológica é uma oportunidade, não uma ameaça. Quanto mais cedo — dentro da faixa segura a partir dos 6 meses — e mais consistentemente você introduzir os alimentos alergênicos, maior a chance do corpo do seu bebê aprender a tolerá-los bem. É basicamente o oposto do que a geração passada aprendeu, e é por isso que vale a pena entender essa mudança." },
      { startSeconds: 900, text: "Esse conteúdo é educativo e não substitui orientação do pediatra do seu bebê, especialmente se houver histórico de alergia na família. Combinado?" },
    ],
  },
  {
    id: "engasgo-gag",
    title: "Engasgo ou GAG?",
    subtitle: "Como diferenciar rápido e o que fazer em cada caso",
    estimatedMinutes: "10-12",
    transcript: [
      { startSeconds: 0, text: "Esse é provavelmente o medo número um de quem está começando a introdução alimentar: o bebê engole errado, começa a tossir ou fazer uma cara estranha, e o coração da mãe dispara. Vamos separar duas coisas que parecem iguais mas são bem diferentes: o reflexo de gag e o engasgo real." },
      { startSeconds: 60, text: "Primeiro, o que é o gag reflex, ou reflexo de tosse. É um mecanismo de proteção natural que fica localizado mais para a frente da boca do bebê do que no adulto — isso é proposital. A natureza colocou esse reflexo bem sensível justamente para impedir que pedaços grandes demais cheguem perto da garganta antes do bebê saber mastigar direito." },
      { startSeconds: 130, text: "Quando o gag acontece, você vai ver: o bebê tossindo com força, talvez engasgando um pouco, o rosto podendo ficar vermelho, os olhos lacrimejando. Mas — e esse é o ponto mais importante — ele continua fazendo barulho. Está tossindo, ou fazendo sons, o que significa que o ar está passando." },
      { startSeconds: 200, text: "Isso é o corpo do bebê resolvendo o problema sozinho. Ele está empurrando o pedaço de comida de volta para a frente da boca. É desconfortável de ver, pode ser barulhento e até assustador na primeira vez, mas não é uma emergência." },
      { startSeconds: 260, text: "O que você deve fazer durante um episódio de gag? Basicamente, nada — além de ficar por perto, calma, observando. Não bata nas costas do bebê, não coloque os dedos na boca dele tentando tirar a comida às cegas. Essas ações podem, na verdade, empurrar o pedaço mais para dentro." },
      { startSeconds: 330, text: "Deixe o bebê tossir. Na grande maioria das vezes, o episódio passa sozinho em poucos segundos a menos de um minuto. E aqui vai uma coisa importante: quanto mais vezes o bebê passa por um gag e resolve sozinho, mais o reflexo vai recuando com o tempo, e melhor ele fica em mastigar." },
      { startSeconds: 400, text: "Agora vamos para o outro cenário, o que realmente é uma emergência: o engasgo real, também chamado de obstrução de via aérea." },
      { startSeconds: 440, text: "No engasgo real, o sinal mais importante é justamente o oposto do gag: silêncio. O bebê não consegue tossir, não consegue chorar, não faz nenhum som. Isso acontece porque as vias aéreas estão bloqueadas — não tem ar passando para gerar som nenhum." },
      { startSeconds: 510, text: "Outros sinais de engasgo real: dificuldade visível para respirar, o peito se movendo mas sem entrada de ar, a boca aberta sem conseguir emitir som, e o rosto começando a ficar roxo ou azulado, principalmente ao redor dos lábios." },
      { startSeconds: 580, text: "Se você perceber esses sinais — silêncio total, sem tossir, sem chorar, dificuldade real para respirar — essa é a hora de agir imediatamente, com a manobra de desobstrução adequada para a idade do bebê." },
      { startSeconds: 630, text: "O manual completo com o passo a passo da manobra, com imagens e instruções específicas para bebês até 1 ano e para crianças acima de 1 ano, está disponível aqui no app, na seção de Manual S.O.S. Vale a pena revisar esse passo a passo antes de precisar dele — não durante uma emergência." },
      { startSeconds: 690, text: "Uma dica prática para diferenciar rápido, na hora: pergunte a si mesma \"ele está fazendo barulho?\". Se sim — tossindo, chorando, resmungando — é gag, dê espaço e observe. Se não — silêncio completo — é engasgo real, aja imediatamente." },
      { startSeconds: 750, text: "E como prevenir engasgos reais? Sempre com o bebê sentado ereto, nunca reclinado, durante as refeições. Sempre supervisionado, sem exceção. Alimentos cortados no tamanho e formato certos para a idade — uva, tomate-cereja e azeitona sempre cortados em quartos, nunca inteiros. E evite alimentos de alto risco como pipoca e amendoim inteiro até os 4 ou 5 anos." },
      { startSeconds: 830, text: "Resumindo: gag faz barulho e resolve sozinho, você só observa. Engasgo real é silencioso e exige ação imediata. Saber diferenciar isso rápido é uma das ferramentas mais importantes que você pode ter como mãe nessa fase — e agora você já sabe." },
      { startSeconds: 880, text: "Esse conteúdo é educativo e não substitui um curso certificado de primeiros socorros infantis. Considere fazer um, se ainda não fez — é um investimento que vale muito a pena." },
    ],
  },
];

export function getAudiobook(id: string): Audiobook | undefined {
  return AUDIOBOOKS.find((a) => a.id === id);
}
