/* =====================================================
   NutriMãe — Landing Page (/oferta, versão estática)
   Interatividade (JavaScript vanilla, sem dependências)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------
     Configuração
     --------------------------------------------------- */
  // APP_URL: ajuste para o domínio real do app publicado antes de subir
  // tráfego. Usado nos links de checkout (fallback), S.O.S. e privacidade.
  var APP_URL = 'https://app.nutrimae.com';

  /* ---------------------------------------------------
     Rastreamento de eventos (hooks para Meta Pixel)
     --------------------------------------------------- */
  function trackEvent(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, params || {});
    }
    console.log('[track]', eventName, params || {});
  }

  function trackStandardEvent(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('track', eventName, params || {});
    }
    console.log('[track-standard]', eventName, params || {});
  }

  /* ---------------------------------------------------
     Abertura interativa: quiz integrado à landing atual
     --------------------------------------------------- */
  var entryQuiz = document.getElementById('entry-quiz');

  if (entryQuiz) {
    var entryQuizAnswers = { age: null, priority: null, support: null };
    var entryQuizChanging = false;
    var entryQuizFinished = false;
    var entryQuizAlreadyCompleted = false;
    var entryQuizSteps = {
      1: document.getElementById('entry-quiz-step-1'),
      2: document.getElementById('entry-quiz-step-2'),
      3: document.getElementById('entry-quiz-step-3')
    };
    var entryQuizProgress = document.getElementById('entry-quiz-progress');
    var entryQuizProgressFill = document.getElementById('entry-quiz-progress-fill');
    var entryQuizProgressLabel = document.getElementById('entry-quiz-progress-label');
    var entryQuizProgressPercent = document.getElementById('entry-quiz-progress-percent');
    var entryQuizLoading = document.getElementById('entry-quiz-loading');
    var entryQuizLoadingText = document.getElementById('entry-quiz-loading-text');
    var entryQuizLoadingFill = document.getElementById('entry-quiz-loading-fill');
    var entryQuizLockedNodes = [];
    var ENTRY_AGE_LABELS = {
      'vai-comecar': 'o início da introdução alimentar',
      '6-meses': 'bebês de 6 meses',
      '7-9-meses': 'bebês de 7 a 9 meses',
      '10-12-meses': 'bebês de 10 a 12+ meses'
    };

    try {
      var savedEntryQuizAnswers = JSON.parse(window.sessionStorage.getItem('nutrimae_entry_quiz_answers') || 'null');
      entryQuizAlreadyCompleted = window.sessionStorage.getItem('nutrimae_entry_quiz_completed') === 'true';
      if (entryQuizAlreadyCompleted && savedEntryQuizAnswers && savedEntryQuizAnswers.age) {
        entryQuizAnswers = savedEntryQuizAnswers;
      } else {
        entryQuizAlreadyCompleted = false;
      }
    } catch (e) {
      entryQuizAlreadyCompleted = false;
    }

    if (entryQuizAlreadyCompleted) {
      entryQuiz.classList.add('entry-quiz--hidden');
      entryQuiz.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('entry-quiz-active');
    } else {
      Array.prototype.forEach.call(document.body.children, function (node) {
        if (node !== entryQuiz && node.tagName !== 'SCRIPT' && !node.hasAttribute('inert')) {
          node.setAttribute('inert', '');
          node.setAttribute('data-entry-quiz-inert', 'true');
          entryQuizLockedNodes.push(node);
        }
      });
    }

    function focusFirstEntryOption(stepNumber) {
      var headline = entryQuizSteps[stepNumber] && entryQuizSteps[stepNumber].querySelector('.quiz-headline');
      if (headline) {
        window.setTimeout(function () { headline.focus({ preventScroll: true }); }, 40);
      }
    }

    function updateEntryQuizProgress(stepNumber) {
      var percent = Math.round((stepNumber / 3) * 100);
      entryQuizProgressFill.style.width = percent + '%';
      entryQuizProgressLabel.textContent = 'Etapa ' + stepNumber + ' de 3';
      entryQuizProgressPercent.textContent = percent + '%';
      entryQuizProgress.setAttribute('aria-valuenow', String(percent));
    }

    function goToEntryQuizStep(fromStep, toStep) {
      if (entryQuizChanging) return;
      entryQuizChanging = true;
      entryQuizSteps[fromStep].classList.add('quiz-step--fade-out');

      window.setTimeout(function () {
        entryQuizSteps[fromStep].classList.add('quiz-step--hidden');
        entryQuizSteps[fromStep].classList.remove('quiz-step--fade-out');
        entryQuizSteps[toStep].classList.add('entry-quiz-step--entering');
        entryQuizSteps[toStep].classList.remove('quiz-step--hidden');
        updateEntryQuizProgress(toStep);
        entryQuizChanging = false;
        focusFirstEntryOption(toStep);

        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            entryQuizSteps[toStep].classList.remove('entry-quiz-step--entering');
          });
        });
      }, 300);
    }

    function markEntryOption(button) {
      var options = button.closest('.quiz-options').querySelectorAll('.entry-quiz__option');
      options.forEach(function (option) {
        var selected = option === button;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
    }

    function applyEntryQuizAge(ageKey) {
      if (!ageKey || !AGE_CONTENT[ageKey]) return;

      currentAgeKey = ageKey;
      ageOptions.forEach(function (button) {
        button.classList.toggle('selected', button.getAttribute('data-age') === currentAgeKey);
      });
      updateAgeCta();
      renderFoodResult();
    }

    function personalizeLandingFromQuiz() {
      var ageLabel = ENTRY_AGE_LABELS[entryQuizAnswers.age] || 'a fase escolhida';
      var heroEyebrow = document.querySelector('.hero__eyebrow');
      var heroVideoTitle = document.querySelector('.hero__video-title');
      var eyebrowBySupport = {
        'guia-visual': 'Consulta rápida organizada para ',
        cardapio: 'Plano diário organizado para ',
        receitas: 'Opções flexíveis organizadas para '
      };
      var videoTitleByPriority = {
        cortes: 'Veja o guia visual de cortes em ação para ',
        variedade: 'Veja receitas e combinações no NutriMãe para ',
        rotina: 'Veja o cardápio e a lista de compras para '
      };

      if (heroEyebrow) {
        heroEyebrow.textContent = (eyebrowBySupport[entryQuizAnswers.support] || 'Conteúdo organizado para ') + ageLabel;
      }
      if (heroVideoTitle) {
        heroVideoTitle.textContent = (videoTitleByPriority[entryQuizAnswers.priority] || 'Veja o NutriMãe em ação para ') + ageLabel;
      }
    }

    function revealLandingFromQuiz() {
      var deferredVideoThumbnail = document.getElementById('video-placeholder');
      if (deferredVideoThumbnail && !deferredVideoThumbnail.style.backgroundImage) {
        var thumbnailUrl = deferredVideoThumbnail.getAttribute('data-thumbnail');
        if (thumbnailUrl) {
          deferredVideoThumbnail.style.backgroundImage = 'url("' + thumbnailUrl + '")';
        }
      }

      entryQuiz.classList.add('entry-quiz--leaving');
      document.body.classList.remove('entry-quiz-active');

      entryQuizLockedNodes.forEach(function (node) {
        if (node.getAttribute('data-entry-quiz-inert') === 'true') {
          node.removeAttribute('inert');
          node.removeAttribute('data-entry-quiz-inert');
        }
      });

      window.setTimeout(function () {
        entryQuiz.classList.add('entry-quiz--hidden');
        entryQuiz.setAttribute('aria-hidden', 'true');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        var heroTitle = document.querySelector('.hero__title');
        if (heroTitle) {
          heroTitle.setAttribute('tabindex', '-1');
          heroTitle.focus({ preventScroll: true });
        }
      }, 720);
    }

    function finishEntryQuiz() {
      if (entryQuizFinished) return;
      entryQuizFinished = true;

      try {
        window.sessionStorage.setItem('nutrimae_entry_quiz_answers', JSON.stringify(entryQuizAnswers));
        window.sessionStorage.setItem('nutrimae_entry_quiz_completed', 'true');
      } catch (e) {
        // A experiência continua normalmente quando o navegador bloqueia storage.
      }

      trackEvent('QuizCompleted', entryQuizAnswers);
      trackStandardEvent('Lead', {
        content_name: 'Quiz de abertura NutriMãe',
        phase: entryQuizAnswers.age,
        priority: entryQuizAnswers.priority,
        support: entryQuizAnswers.support
      });

      applyEntryQuizAge(entryQuizAnswers.age || '6-meses');
      personalizeLandingFromQuiz();
      revealLandingFromQuiz();
    }

    function runEntryQuizLoading() {
      entryQuizSteps[3].classList.add('quiz-step--fade-out');
      entryQuizProgressFill.style.width = '100%';
      entryQuizProgressLabel.textContent = 'Personalizando';
      entryQuizProgressPercent.textContent = '100%';
      entryQuizProgress.setAttribute('aria-valuenow', '100');

      window.setTimeout(function () {
        entryQuizSteps[3].classList.add('quiz-step--hidden');
        entryQuizLoading.classList.remove('quiz-loading--hidden');
        var ageLabel = ENTRY_AGE_LABELS[entryQuizAnswers.age] || 'a fase escolhida';
        var priorityMessages = {
          cortes: 'Destacando o guia visual de cortes e texturas...',
          variedade: 'Selecionando receitas e formas práticas de variar...',
          rotina: 'Montando uma prévia de cardápio e lista de compras...'
        };
        var messages = [
          'Organizando uma experiência para ' + ageLabel + '...',
          priorityMessages[entryQuizAnswers.priority] || 'Organizando os recursos mais úteis...',
          'Preparando sua prévia do NutriMãe...'
        ];

        entryQuizLoadingText.textContent = messages[0];
        entryQuizLoadingFill.style.transition = 'none';
        entryQuizLoadingFill.style.width = '0%';
        void entryQuizLoadingFill.offsetWidth;
        entryQuizLoadingFill.style.transition = 'width 2.9s linear';
        window.requestAnimationFrame(function () {
          entryQuizLoadingFill.style.width = '100%';
        });

        function changeLoadingMessage(message) {
          entryQuizLoadingText.classList.add('is-changing');
          window.setTimeout(function () {
            entryQuizLoadingText.textContent = message;
            entryQuizLoadingText.classList.remove('is-changing');
          }, 180);
        }

        window.setTimeout(function () { changeLoadingMessage(messages[1]); }, 950);
        window.setTimeout(function () { changeLoadingMessage(messages[2]); }, 1900);
        window.setTimeout(function () {
          entryQuizLoading.setAttribute('aria-busy', 'false');
          finishEntryQuiz();
        }, 2900);

        // Fallback para navegadores in-app que pausam timers em segundo plano.
        window.setTimeout(finishEntryQuiz, 3600);
      }, 300);
    }

    entryQuizSteps[1].querySelectorAll('[data-entry-age]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        markEntryOption(button);
        entryQuizAnswers.age = button.getAttribute('data-entry-age');
        trackEvent('QuizAnswer', { step: 1, question: 'age', answer: entryQuizAnswers.age });
        goToEntryQuizStep(1, 2);
      });
    });

    entryQuizSteps[2].querySelectorAll('[data-entry-priority]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        markEntryOption(button);
        entryQuizAnswers.priority = button.getAttribute('data-entry-priority');
        trackEvent('QuizAnswer', { step: 2, question: 'priority', answer: entryQuizAnswers.priority });
        goToEntryQuizStep(2, 3);
      });
    });

    entryQuizSteps[3].querySelectorAll('[data-entry-support]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        markEntryOption(button);
        entryQuizChanging = true;
        entryQuizAnswers.support = button.getAttribute('data-entry-support');
        trackEvent('QuizAnswer', { step: 3, question: 'support', answer: entryQuizAnswers.support });
        runEntryQuizLoading();
      });
    });

    entryQuiz.querySelectorAll('[data-entry-back]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        var targetStep = Number(button.getAttribute('data-entry-back'));
        var currentStep = targetStep + 1;
        trackEvent('QuizBack', { from_step: currentStep, to_step: targetStep });
        goToEntryQuizStep(currentStep, targetStep);
      });
    });

    entryQuiz.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;

      var focusable = Array.prototype.filter.call(
        entryQuiz.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (element) { return element.offsetParent !== null; }
      );
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (entryQuizAlreadyCompleted) {
      window.setTimeout(function () {
        applyEntryQuizAge(entryQuizAnswers.age || '6-meses');
        personalizeLandingFromQuiz();
      }, 0);
    } else {
      updateEntryQuizProgress(1);
      focusFirstEntryOption(1);
      trackEvent('QuizStart', { source: 'landing-entry' });
    }
  }

  /* ---------------------------------------------------
     Scroll suave entre blocos
     --------------------------------------------------- */
  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------------------------------------------------
     Suporte a IntersectionObserver
     Checar `'IntersectionObserver' in window` não basta: alguns navegadores
     in-app (Instagram, Facebook, TikTok — boa parte do tráfego pago) expõem
     a propriedade sem que ela seja um construtor utilizável, e o `new`
     lançaria um erro que abortaria todo o restante deste script.
     --------------------------------------------------- */
  var supportsIO = typeof window.IntersectionObserver === 'function';

  function safeObserve(target, callback, options) {
    if (!supportsIO || !target) return null;
    try {
      var observer = new IntersectionObserver(callback, options);
      observer.observe(target);
      return observer;
    } catch (e) {
      return null;
    }
  }

  /* ---------------------------------------------------
     BLOCO 1: Hero
     --------------------------------------------------- */
  // Regra de ouro dos CTAs: botões de topo/meio (hero, nav, sticky, CTA
  // final) são âncoras que rolam até a oferta — nunca vão direto pro
  // checkout, pra mãe não "levar um susto" com preço antes de entender o
  // produto. Só o botão dentro da própria seção de preço (goToCheckout,
  // mais abaixo neste arquivo) sai da página.
  var ctaHero = document.getElementById('cta-hero');
  if (ctaHero) {
    ctaHero.addEventListener('click', function () {
      trackEvent('HeroCtaClick');
      scrollToSection('bloco-6');
    });
  }

  var videoWrapper = document.getElementById('video-wrapper');
  var videoPlaceholder = document.getElementById('video-placeholder');
  if (videoPlaceholder && videoWrapper) {
    var playVideo = function () {
      trackEvent('VideoPlay');
      var youtubeId = videoWrapper.getAttribute('data-youtube-id');
      if (!youtubeId) return;

      // Só cria o iframe do YouTube no clique (facade pattern) — carregar o
      // player de cara pesa a página e prejudica o LCP em 4G.
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1&rel=0';
      iframe.title = 'Vídeo de apresentação NutriMãe';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      videoWrapper.innerHTML = '';
      videoWrapper.appendChild(iframe);
    };
    videoPlaceholder.addEventListener('click', playVideo);
    videoPlaceholder.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playVideo();
      }
    });
  }

  /* ---------------------------------------------------
     Dados: fases e alimentos
     --------------------------------------------------- */
  var AGE_CONTENT = {
    'vai-comecar': {
      ctaLabel: 'Ver plano de início',
      food: {
        name: 'Banana', emoji: '🍌', age: 'a partir dos 6 meses',
        cut: 'Bastão largo, do tamanho do punho fechado do bebê',
        how: 'Na mão, sem casca, com uma pontinha cortada para dar apoio'
      }
    },
    '6-meses': {
      ctaLabel: 'Ver plano de 6 meses',
      food: {
        name: 'Morango', emoji: '🍓', age: 'a partir dos 6 meses',
        cut: 'Inteiro, com a rama removida',
        how: 'Na mão do bebê, sentado e supervisionado'
      }
    },
    '7-9-meses': {
      ctaLabel: 'Ver plano de 7 a 9 meses',
      food: {
        name: 'Frango desfiado', emoji: '🍗', age: '7 a 9 meses',
        cut: 'Desfiado ou em tiras finas e macias',
        how: 'Junto com o prato, fácil de pegar com as mãos'
      }
    },
    '10-12-meses': {
      ctaLabel: 'Ver plano de 10 a 12+ meses',
      food: {
        name: 'Bolinho de legumes', emoji: '🥕', age: '10 a 12+ meses',
        cut: 'Pedaços pequenos e macios',
        how: 'Incentive o bebê a pegar sozinho, com ou sem talher'
      }
    }
  };

  var SEARCHABLE_FOODS = [
    { key: 'banana', name: 'Banana', emoji: '🍌', age: 'a partir dos 6 meses', cut: 'Bastão largo, do tamanho do punho fechado do bebê', how: 'Na mão, sem casca, com uma pontinha cortada para dar apoio' },
    { key: 'abacate', name: 'Abacate', emoji: '🥑', age: 'a partir dos 6 meses', cut: 'Fatias grossas com casca, para facilitar a preensão', how: 'Na mão, ou amassado em uma colher pré-carregada' },
    { key: 'morango', name: 'Morango', emoji: '🍓', age: 'a partir dos 6 meses', cut: 'Inteiro, com a rama removida', how: 'Na mão do bebê, sentado e supervisionado' }
  ];

  var currentAgeKey = '6-meses';
  var currentSearchQuery = '';

  /* ---------------------------------------------------
     Continuidade vinda do quiz (quiz.html?fase=...)
     Se a visitante veio do Quiz Rápido, a fase que ela já escolheu lá
     chega aqui pré-selecionada — sem repetir pergunta.
     --------------------------------------------------- */
  (function applyFaseFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var fase = params.get('fase');

    // Fallback: alguns hosts estáticos derrubam a query string num redirect
    // de /index.html?query para / (visto no servidor de dev local "serve").
    // sessionStorage sobrevive a isso, então é a fonte garantida; a query
    // string funciona quando o host preserva o parâmetro.
    if (!fase) {
      try {
        fase = window.sessionStorage.getItem('nutrimae_fase_from_quiz');
        window.sessionStorage.removeItem('nutrimae_fase_from_quiz');
      } catch (e) {
        fase = null;
      }
    }

    if (fase && AGE_CONTENT[fase]) {
      currentAgeKey = fase;
      trackEvent('FaseFromQuiz', { age: fase });
    }
  })();

  /* ---------------------------------------------------
     BLOCO 2: Seletor de fase (funcional)
     --------------------------------------------------- */
  var ageOptions = document.querySelectorAll('#age-options .option-btn');
  var ageCtaBtn = document.getElementById('age-cta');

  ageOptions.forEach(function (btn) {
    btn.classList.toggle('selected', btn.getAttribute('data-age') === currentAgeKey);
  });

  function updateAgeCta() {
    if (ageCtaBtn) ageCtaBtn.textContent = AGE_CONTENT[currentAgeKey].ctaLabel;
  }

  ageOptions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      ageOptions.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      currentAgeKey = btn.getAttribute('data-age');
      trackEvent('AgeSelected', { age: currentAgeKey });
      updateAgeCta();
      renderFoodResult();
    });
  });

  if (ageCtaBtn) {
    ageCtaBtn.addEventListener('click', function () {
      scrollToSection('bloco-6');
    });
  }

  updateAgeCta();

  /* ---------------------------------------------------
     BLOCO 5: Demonstração buscável
     --------------------------------------------------- */
  var foodSearchInput = document.getElementById('food-search');
  var foodSearchHint = document.getElementById('food-search-hint');
  var foodResultEmoji = document.getElementById('food-result-emoji');
  var foodResultName = document.getElementById('food-result-name');
  var foodResultAge = document.getElementById('food-result-age');
  var foodResultCut = document.getElementById('food-result-cut');
  var foodResultHow = document.getElementById('food-result-how');

  function findSearchMatch(query) {
    var q = query.trim().toLowerCase();
    if (!q) return undefined;
    return SEARCHABLE_FOODS.filter(function (food) {
      return food.name.toLowerCase().indexOf(q) !== -1;
    })[0] || null;
  }

  function renderFoodResult() {
    var match = findSearchMatch(currentSearchQuery);
    var data;

    if (match === undefined) {
      // Sem busca ativa: mostra o alimento da fase selecionada.
      data = AGE_CONTENT[currentAgeKey].food;
      if (foodSearchHint) foodSearchHint.classList.add('food-search-hint--hidden');
    } else if (match === null) {
      // Busca ativa, sem correspondência entre os 3 alimentos de exemplo.
      if (foodSearchHint) foodSearchHint.classList.remove('food-search-hint--hidden');
      return;
    } else {
      data = match;
      if (foodSearchHint) foodSearchHint.classList.add('food-search-hint--hidden');
    }

    if (foodResultEmoji) foodResultEmoji.textContent = data.emoji;
    if (foodResultName) foodResultName.textContent = data.name;
    if (foodResultAge) foodResultAge.textContent = data.age;
    if (foodResultCut) foodResultCut.textContent = data.cut;
    if (foodResultHow) foodResultHow.textContent = data.how;
  }

  if (foodSearchInput) {
    foodSearchInput.addEventListener('input', function () {
      currentSearchQuery = foodSearchInput.value;
      if (currentSearchQuery.trim().length >= 2) {
        trackEvent('FoodSearchUsed', { query: currentSearchQuery.trim() });
      }
      renderFoodResult();
    });
  }

  renderFoodResult();

  /* ---------------------------------------------------
     BLOCO 6: Assistente honesto (2 perguntas reais)
     --------------------------------------------------- */
  var methodNotes = {
    'papinha': 'Anotado — papinha. As receitas em textura de papinha já aparecem primeiro pra você.',
    'blw': 'Anotado — BLW. O guia de cortes por pedaço fica em destaque na sua tela inicial.',
    'misto': 'Anotado — método misto. Você recebe as duas texturas lado a lado, sem precisar escolher uma só.',
    'nao-decidi': 'Sem problema. O app mostra os dois métodos lado a lado para você decidir com calma.'
  };

  var allergenNotes = {
    'nao': 'Sem alergênico conhecido — seguimos com a introdução gradual recomendada.',
    'ovo': 'Anotado — ovo. As receitas com ovo já saem sinalizadas para você.',
    'leite': 'Anotado — leite. As receitas com leite já saem sinalizadas para você.',
    'outro': 'Anotado. No app dá para marcar o alergênico específico e filtrar as receitas.'
  };

  var methodOptions = document.querySelectorAll('#assistant-method-options .option-btn');
  var methodNoteEl = document.getElementById('assistant-method-note');
  var allergenStep = document.getElementById('assistant-allergen-step');
  var allergenOptions = document.querySelectorAll('#assistant-allergen-options .option-btn');
  var allergenNoteEl = document.getElementById('assistant-allergen-note');
  var assistantFinishBtn = document.getElementById('assistant-finish');

  methodOptions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      methodOptions.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      var method = btn.getAttribute('data-method');
      trackEvent('AssistantAnswer', { question: 'method', answer: method });

      if (methodNoteEl) {
        methodNoteEl.textContent = methodNotes[method];
        methodNoteEl.classList.remove('assistant-note--hidden');
      }
      if (allergenStep) allergenStep.classList.remove('assistant-step--hidden');
    });
  });

  allergenOptions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      allergenOptions.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      var allergen = btn.getAttribute('data-allergen');
      trackEvent('AssistantAnswer', { question: 'allergen', answer: allergen });
      trackEvent('AssistantComplete');

      if (allergenNoteEl) {
        allergenNoteEl.textContent = allergenNotes[allergen];
        allergenNoteEl.classList.remove('assistant-note--hidden');
      }
      if (assistantFinishBtn) assistantFinishBtn.classList.remove('assistant-finish--hidden');
    });
  });

  if (assistantFinishBtn) {
    assistantFinishBtn.addEventListener('click', function () {
      trackEvent('AssistantFinish');
      scrollToSection('bloco-6');
    });
  }

  /* ---------------------------------------------------
     BLOCO 8: Manual S.O.S. (link para o app)
     --------------------------------------------------- */
  var sosLink = document.getElementById('sos-link');
  if (sosLink) {
    sosLink.href = APP_URL + '/manual-sos';
  }

  var privacyLink = document.getElementById('privacy-link');
  if (privacyLink) {
    privacyLink.href = APP_URL + '/politica-privacidade';
  }

  /* ---------------------------------------------------
     BLOCO 11: Oferta — tracking de chegada
     --------------------------------------------------- */
  var offerSection = document.getElementById('bloco-6');
  var offerObserver = safeObserve(offerSection, function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        trackEvent('OfferView');
        if (offerObserver) offerObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  /* ---------------------------------------------------
     BLOCO 11: Oferta — toggle Mensal / Anual + Checkout
     --------------------------------------------------- */
  var currentPlan = 'anual';
  var toggleButtons = document.querySelectorAll('.pricing-toggle__btn');
  var planCardMensal = document.getElementById('plan-card-mensal');
  var planCardAnual = document.getElementById('plan-card-anual');
  var ctaCheckoutDynamic = document.getElementById('cta-checkout-dynamic');

  function updatePlanView() {
    var isAnual = currentPlan === 'anual';
    if (planCardMensal) planCardMensal.hidden = isAnual;
    if (planCardAnual) planCardAnual.hidden = !isAnual;

    toggleButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-plan-toggle') === currentPlan;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    if (ctaCheckoutDynamic) {
      ctaCheckoutDynamic.textContent = isAnual ? 'Começar agora — Plano Anual' : 'Começar agora — Plano Mensal';
    }
  }

  toggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentPlan = btn.getAttribute('data-plan-toggle');
      trackEvent('PlanToggle', { plan: currentPlan });
      updatePlanView();
    });
  });

  updatePlanView();

  function goToCheckout(plan) {
    trackEvent('InitiateCheckout', { plan: plan, age: currentAgeKey });
    // CHECKOUT CARTPANDA: substitua pela URL real de checkout de cada plano.
    // Sem URL configurada ainda, manda para o cadastro no app em vez de um
    // link morto.
    var checkoutUrls = {
      mensal: null, // 'https://SEU-CHECKOUT-CARTPANDA.com/mensal'
      anual: null   // 'https://SEU-CHECKOUT-CARTPANDA.com/anual'
    };
    window.location.href = checkoutUrls[plan] || (APP_URL + '/login');
  }

  if (ctaCheckoutDynamic) {
    ctaCheckoutDynamic.addEventListener('click', function () { goToCheckout(currentPlan); });
  }

  /* ---------------------------------------------------
     Nav e CTA final
     --------------------------------------------------- */
  var navCta = document.getElementById('nav-cta');
  if (navCta) {
    navCta.addEventListener('click', function () {
      trackEvent('NavCtaClick');
      scrollToSection('bloco-6');
    });
  }

  var ctaFinal = document.getElementById('cta-final');
  if (ctaFinal) {
    ctaFinal.addEventListener('click', function () {
      trackEvent('FinalCtaClick');
      scrollToSection('bloco-6');
    });
  }

  // CTAs de âncora no meio da página (depois dos depoimentos, depois do
  // quadro comparativo) — mesma regra dos demais: rolam até a oferta,
  // nunca saem da página.
  document.querySelectorAll('[data-anchor-cta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      trackEvent('MidCtaClick', { from: btn.getAttribute('data-anchor-cta') });
      scrollToSection('bloco-6');
    });
  });

  /* ---------------------------------------------------
     BLOCO 12: FAQ (accordion)
     --------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        trackEvent('FaqOpen', { question: question.textContent.trim() });
      }
    });
  });

  /* ---------------------------------------------------
     Barra de CTA fixa (mobile)
     --------------------------------------------------- */
  var stickyCta = document.getElementById('sticky-cta');
  var stickyCtaBtn = document.getElementById('sticky-cta-btn');
  var heroSection = document.getElementById('bloco-1');
  var offerSectionForSticky = document.getElementById('bloco-6');

  if (stickyCta && heroSection && offerSectionForSticky) {
    // Visibilidade calculada por geometria: funciona com ou sem
    // IntersectionObserver, garantindo a barra também em navegadores in-app.
    function isElementOnScreen(el) {
      var rect = el.getBoundingClientRect();
      var viewportH = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewportH && rect.bottom > 0;
    }

    function updateStickyCta() {
      var shouldShow = !isElementOnScreen(heroSection) && !isElementOnScreen(offerSectionForSticky);
      stickyCta.classList.toggle('sticky-cta--visible', shouldShow);
      stickyCta.setAttribute('aria-hidden', String(!shouldShow));
    }

    if (supportsIO) {
      safeObserve(heroSection, updateStickyCta, { threshold: 0 });
      safeObserve(offerSectionForSticky, updateStickyCta, { threshold: 0 });
    }

    window.addEventListener('scroll', updateStickyCta, { passive: true });
    window.addEventListener('resize', updateStickyCta, { passive: true });
    updateStickyCta();
  }

  if (stickyCtaBtn) {
    stickyCtaBtn.addEventListener('click', function () {
      trackEvent('StickyCtaClick');
      scrollToSection('bloco-6');
    });
  }

  trackEvent('ViewContent', { page: 'oferta' });

});
