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
  /** true quando existe narração real em assets/audio/<id>.mp3 (ver src/lib/audio/static-audio.ts). */
  hasAudio: boolean;
  transcript: TranscriptSegment[];
}

export const AUDIOBOOKS: Audiobook[] = [
  {
    id: "janela-imunologica",
    title: "Janela Imunológica",
    subtitle: "Por que o momento da introdução alimentar importa tanto",
    estimatedMinutes: "12-15",
    hasAudio: true,
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
    hasAudio: true,
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

// ─── Versão em espanhol ───
// ATENÇÃO: o texto abaixo está traduzido, mas os arquivos .mp3 reais em
// assets/audio/<id>.mp3 são narração gravada em português — ainda NÃO
// existe narração em espanhol. Enquanto isso, hasAudio segue true e o
// player toca o áudio em português junto com esta transcrição em espanhol
// (incoerente, mas menos ruim que texto em português). Precisa de nova
// gravação (ou fallback para TTS via Google Cloud, mesma infra do /sos) —
// ver conversa de 2026-09-11.
export const AUDIOBOOKS_ES: Audiobook[] = [
  {
    id: "janela-imunologica",
    title: "Ventana Inmunológica",
    subtitle: "Por qué el momento de la introducción alimentaria importa tanto",
    estimatedMinutes: "12-15",
    hasAudio: true,
    transcript: [
      { startSeconds: 0, text: "Probablemente ya escuchaste el término \"ventana inmunológica\" en algún grupo de mamás o en la consulta del pediatra. Vamos a entender exactamente qué es, por qué los especialistas hablan tanto de ella, y qué cambia esto en la práctica para la introducción alimentaria de tu bebé." },
      { startSeconds: 50, text: "La ventana inmunológica es el período, generalmente entre los 4 y los 11 meses de edad, en que el sistema inmunológico del bebé está más receptivo a \"aprender\" a tolerar alimentos nuevos — incluso los que son alérgenos comunes, como el huevo y el maní. Fuera de ese período, ya sea antes o demasiado después, el cuerpo tiende a reaccionar de forma diferente al primer contacto." },
      { startSeconds: 130, text: "Durante mucho tiempo, la recomendación era justamente la opuesta: atrasar al máximo la introducción de alimentos alergénicos, con la esperanza de \"proteger\" al bebé. Estudios grandes, como el LEAP (Learning Early About Peanut Allergy), publicado en 2015, mostraron lo contrario: atrasar la introducción del maní, por ejemplo, estaba asociado a más casos de alergia, no menos." },
      { startSeconds: 220, text: "Esto cambió completamente las guías internacionales de pediatría. Hoy, sociedades médicas alrededor del mundo recomiendan introducir los alimentos alergénicos de forma temprana, dentro de la ventana, y no evitarlos." },
      { startSeconds: 290, text: "Entonces, ¿cuál es el riesgo de esperar demasiado? Cuando la introducción de un alérgeno se posterga para después del primer año, el sistema inmunológico ya tuvo tiempo de \"decidirse\" de otras formas — muchas veces a través del contacto con el alimento por la piel, por ejemplo, en casos de dermatitis atópica. Ese contacto indirecto, sin la digestión, puede enseñarle al cuerpo a reconocer esa proteína como una amenaza, en vez de como comida, siguiendo el camino normal del sistema digestivo." },
      { startSeconds: 380, text: "Por eso la recomendación actual es: apenas comience la introducción alimentaria, alrededor de los 6 meses, los alérgenos más comunes deben entrar al menú en las primeras semanas — no dejarlos para después." },
      { startSeconds: 440, text: "¿Cuáles son esos alérgenos críticos? La lista más estudiada incluye huevo, maní, leche de vaca, trigo (gluten), pescado, mariscos, soya y frutos secos. Puedes encontrar la lista completa en el checklist de alergénicos aquí en la app." },
      { startSeconds: 520, text: "¿Cómo aprovechar bien esta ventana en la práctica? Primero, no esperes. Apenas el bebé empiece a comer sólidos, incluye los alérgenos comunes ya en las primeras semanas, uno a la vez, con un intervalo de 3 a 5 días entre ellos para observar reacciones." },
      { startSeconds: 590, text: "Segundo, mantén la regularidad. Introducir un alimento una sola vez y nunca más ofrecerlo no construye tolerancia. Lo ideal es mantener el alimento en el menú al menos dos veces por semana después de la primera introducción exitosa." },
      { startSeconds: 650, text: "Tercero, ofrécelo en cantidad real, no solo para \"probar\". Una cucharadita simbólica de vez en cuando tiene menos efecto en la construcción de tolerancia que una porción realmente incorporada a la rutina alimentaria." },
      { startSeconds: 710, text: "¿Y la seguridad en todo esto? Introducir tempranamente no significa dejar de lado el cuidado. Ofrece el alimento nuevo en la mañana, en casa, contigo cerca y atenta, nunca de noche o fuera de casa la primera vez. Así, si hay alguna reacción, la notas rápido y tienes tiempo de actuar." },
      { startSeconds: 780, text: "Si tu bebé ya tiene dermatitis atópica moderada a grave, o antecedentes familiares fuertes de alergia alimentaria, conversa con el pediatra antes de introducir los alérgenos más críticos — en algunos casos, la introducción se hace con acompañamiento médico más cercano, pero de igual forma, tempranamente." },
      { startSeconds: 850, text: "Resumiendo: la ventana inmunológica es una oportunidad, no una amenaza. Mientras más temprano — dentro del rango seguro a partir de los 6 meses — y más consistentemente introduzcas los alimentos alergénicos, mayor la posibilidad de que el cuerpo de tu bebé aprenda a tolerarlos bien. Es básicamente lo opuesto a lo que aprendió la generación anterior, y por eso vale la pena entender este cambio." },
      { startSeconds: 900, text: "Este contenido es educativo y no reemplaza la orientación del pediatra de tu bebé, especialmente si hay antecedentes de alergia en la familia. ¿De acuerdo?" },
    ],
  },
  {
    id: "engasgo-gag",
    title: "¿Atragantamiento o Arcada?",
    subtitle: "Cómo diferenciarlos rápido y qué hacer en cada caso",
    estimatedMinutes: "10-12",
    hasAudio: true,
    transcript: [
      { startSeconds: 0, text: "Este es probablemente el miedo número uno de quien está empezando la introducción alimentaria: el bebé traga mal, empieza a toser o hace una cara extraña, y el corazón de la mamá se acelera. Vamos a separar dos cosas que parecen iguales pero son bien diferentes: el reflejo de arcada y el atragantamiento real." },
      { startSeconds: 60, text: "Primero, qué es el reflejo de arcada (gag reflex). Es un mecanismo de protección natural que está ubicado más hacia adelante en la boca del bebé que en el adulto — esto es a propósito. La naturaleza puso este reflejo bien sensible justamente para impedir que trozos demasiado grandes lleguen cerca de la garganta antes de que el bebé sepa masticar bien." },
      { startSeconds: 130, text: "Cuando ocurre la arcada, vas a ver: el bebé tosiendo con fuerza, quizás con una náusea leve, la cara puede ponerse roja, los ojos lagrimear. Pero — y este es el punto más importante — sigue haciendo ruido. Está tosiendo, o haciendo sonidos, lo que significa que el aire está pasando." },
      { startSeconds: 200, text: "Esto es el cuerpo del bebé resolviendo el problema solo. Está empujando el trozo de comida de vuelta hacia adelante en la boca. Es incómodo de ver, puede ser ruidoso y hasta asustar la primera vez, pero no es una emergencia." },
      { startSeconds: 260, text: "¿Qué debes hacer durante un episodio de arcada? Básicamente, nada — además de quedarte cerca, tranquila, observando. No le des palmadas en la espalda al bebé, no metas los dedos en su boca tratando de sacar la comida a ciegas. Esas acciones pueden, en realidad, empujar el trozo más hacia adentro." },
      { startSeconds: 330, text: "Deja que el bebé tosa. En la gran mayoría de los casos, el episodio pasa solo en pocos segundos, menos de un minuto. Y aquí va algo importante: mientras más veces el bebé pasa por una arcada y la resuelve solo, más va retrocediendo el reflejo con el tiempo, y mejor se vuelve masticando." },
      { startSeconds: 400, text: "Ahora vamos al otro escenario, el que sí es una emergencia real: el atragantamiento real, también llamado obstrucción de la vía aérea." },
      { startSeconds: 440, text: "En el atragantamiento real, la señal más importante es justamente lo opuesto de la arcada: silencio. El bebé no puede toser, no puede llorar, no hace ningún sonido. Esto pasa porque las vías aéreas están bloqueadas — no hay aire pasando para generar ningún sonido." },
      { startSeconds: 510, text: "Otras señales de atragantamiento real: dificultad visible para respirar, el pecho moviéndose pero sin entrada de aire, la boca abierta sin poder emitir sonido, y la cara empezando a ponerse morada o azulada, principalmente alrededor de los labios." },
      { startSeconds: 580, text: "Si notas estas señales — silencio total, sin toser, sin llorar, dificultad real para respirar — ese es el momento de actuar de inmediato, con la maniobra de desobstrucción adecuada para la edad del bebé." },
      { startSeconds: 630, text: "El manual completo con el paso a paso de la maniobra, con imágenes e instrucciones específicas para bebés hasta 1 año y para niños mayores de 1 año, está disponible aquí en la app, en la sección Manual S.O.S. Vale la pena revisar ese paso a paso antes de necesitarlo — no durante una emergencia." },
      { startSeconds: 690, text: "Un consejo práctico para diferenciar rápido, en el momento: pregúntate \"¿está haciendo ruido?\". Si sí — tosiendo, llorando, quejándose — es arcada, dale espacio y observa. Si no — silencio completo — es atragantamiento real, actúa de inmediato." },
      { startSeconds: 750, text: "¿Y cómo prevenir atragantamientos reales? Siempre con el bebé sentado derecho, nunca reclinado, durante las comidas. Siempre supervisado, sin excepción. Alimentos cortados al tamaño y forma correctos para la edad — uva, tomate cherry y aceituna siempre cortados en cuartos, nunca enteros. Y evita alimentos de alto riesgo como palomitas de maíz y maní entero hasta los 4 o 5 años." },
      { startSeconds: 830, text: "Resumiendo: la arcada hace ruido y se resuelve sola, tú solo observas. El atragantamiento real es silencioso y exige acción inmediata. Saber diferenciar esto rápido es una de las herramientas más importantes que puedes tener como mamá en esta etapa — y ahora ya lo sabes." },
      { startSeconds: 880, text: "Este contenido es educativo y no reemplaza un curso certificado de primeros auxilios infantiles. Considera tomar uno, si todavía no lo hiciste — es una inversión que vale mucho la pena." },
    ],
  },
];

export function getAudiobooks(locale: "pt-BR" | "es" = "es"): Audiobook[] {
  return locale === "pt-BR" ? AUDIOBOOKS : AUDIOBOOKS_ES;
}

export function getAudiobook(id: string, locale: "pt-BR" | "es" = "es"): Audiobook | undefined {
  return getAudiobooks(locale).find((a) => a.id === id);
}
