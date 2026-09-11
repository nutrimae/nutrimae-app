/* =====================================================
   NutriMama — Landing Page (/oferta, versão estática)
   Interatividade (JavaScript vanilla, sem dependências)

   ATENÇÃO: index.html carrega script.min.js (minificado), não este
   arquivo direto. Depois de editar aqui, rode:
     npx terser script.js -c -m -o script.min.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------
     Configuração
     --------------------------------------------------- */
  // APP_URL: domínio próprio do app Next.js, migrado de nutrimae-app.vercel.app
  // em 2026-08-24 (ver memória project-dominio-nutrimae-app). Usado nos
  // links de checkout, S.O.S. e privacidade.
  var APP_URL = 'https://app.nutrimae.app';

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
     VSL (player VTurb): pixel por % assistido, revelação
     progressiva de conteúdo e mini-ganchos de reengajamento.

     API oficial do player (smartplayer.instances[0].on(...) e
     .video.currentTime/.duration) — ver
     https://help.vturb.com/en-us/article/old-player-using-the-delay-code-to-sync-page-elements-with-your-video-1r9mnzz/

     Observação: o VTurb também dispara pixels de % assistido
     automaticamente a cada 5% se você cadastrar o Pixel ID do
     Meta direto no painel do player (Configurações > Pixels) —
     isso não depende de código. O bloco abaixo é um espelho desses
     eventos usando o Pixel que já está instalado nesta página, para
     não depender de outra configuração além desta aqui.

     PAUSADO (2026-09-10): VSL desativada pro teste de impulso, os
     elementos abaixo não existem mais no DOM. Bloco mantido comentado
     (não apagado) pra reverter ser só remover o /* * /.
     --------------------------------------------------- */
  /*
  (function () {
    var PIXEL_MILESTONES = [10, 25, 50, 75];
    var UNLOCK_AT_PERCENT = 30;
    var firedMilestones = {};
    var hooksShown = {};
    var contentUnlocked = false;

    var unlockLocked = document.getElementById('video-unlock-locked');
    var unlockUnlocked = document.getElementById('video-unlock-unlocked');
    var unlockFill = document.getElementById('video-unlock-fill');
    var vslHook = document.getElementById('vsl-hook');

    function fireProgressPixel(percent) {
      if (firedMilestones[percent]) return;
      firedMilestones[percent] = true;
      trackEvent('VSLProgress' + percent, { percent: percent });
    }

    function unlockGatedContent() {
      if (contentUnlocked || !unlockLocked || !unlockUnlocked) return;
      contentUnlocked = true;
      unlockLocked.style.display = 'none';
      unlockUnlocked.hidden = false;
      trackEvent('VSLContentUnlocked', { percent: UNLOCK_AT_PERCENT });
    }

    function showHook(key, text) {
      if (hooksShown[key] || !vslHook) return;
      hooksShown[key] = true;
      vslHook.textContent = text;
      vslHook.classList.add('is-visible');
      window.setTimeout(function () { vslHook.classList.remove('is-visible'); }, 6000);
    }

    // A API pública do player não expõe duração em .video (só currentTime);
    // a duração real do vídeo vive em .instance.duration.
    function getPercentWatched(instance) {
      var currentTime = instance.video && instance.video.currentTime;
      var duration = instance.instance && instance.instance.duration;
      if (!duration || typeof currentTime !== 'number') return null;
      return (currentTime / duration) * 100;
    }

    function handleTimeUpdate(instance) {
      var percent = getPercentWatched(instance);
      if (percent === null) return;
      percent = Math.floor(percent);

      if (unlockFill) unlockFill.style.width = Math.min(percent, UNLOCK_AT_PERCENT) / UNLOCK_AT_PERCENT * 100 + '%';
      if (percent >= UNLOCK_AT_PERCENT) unlockGatedContent();

      PIXEL_MILESTONES.forEach(function (milestone) {
        if (percent >= milestone) fireProgressPixel(milestone);
      });

      if (percent >= 15) showHook('early', 'Quédate un minuto más, la parte buena viene a continuación 👀');
      if (percent >= 60) showHook('late', '¡Ya casi! Después del video solo falta elegir tu plan.');
    }

    function handlePause(instance) {
      var percent = getPercentWatched(instance);
      if (percent === null) return;
      if (percent < 85) {
        showHook('pause', '¿Pausaste? No hay problema — solo presiona play para continuar donde quedaste.');
        trackEvent('VSLPaused', { percent: Math.floor(percent) });
      }
    }

    function attachToPlayer(instance) {
      instance.on('timeupdate', function () { handleTimeUpdate(instance); });
      instance.on('pause', function () { handlePause(instance); });
    }

    function waitForPlayer(attemptsLeft) {
      if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances.length) {
        attachToPlayer(window.smartplayer.instances[0]);
        return;
      }
      if (attemptsLeft <= 0) return;
      window.setTimeout(function () { waitForPlayer(attemptsLeft - 1); }, 400);
    }

    if (unlockLocked || vslHook) waitForPlayer(40);
  })();
  */

  /* ---------------------------------------------------
     Depoimentos: carrossel de prints reais do WhatsApp
     (mesmo padrão já usado no Kit Crochê com Fé e na Clínica Psi)
     --------------------------------------------------- */
  var TOTAL_DEPOIMENTOS = 9;
  var depoimentoIndex = 0;
  var depoimentoImg = document.getElementById('depoimento-img');
  var depoimentoDots = document.getElementById('depoimento-dots');

  if (depoimentoImg && depoimentoDots) {
    for (var di = 0; di < TOTAL_DEPOIMENTOS; di++) {
      (function (dotIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Ver testimonio ' + (dotIndex + 1));
        dot.className = 'testimonials-carousel__dot' + (dotIndex === 0 ? ' is-active' : '');
        dot.addEventListener('click', function () { showDepoimento(dotIndex); });
        depoimentoDots.appendChild(dot);
      })(di);
    }

    var showDepoimento = function (index) {
      depoimentoIndex = (index + TOTAL_DEPOIMENTOS) % TOTAL_DEPOIMENTOS;
      depoimentoImg.src = 'assets/depoimentos/depoimento_' + (depoimentoIndex + 1) + '.jpg';
      Array.prototype.forEach.call(depoimentoDots.children, function (dot, i) {
        dot.classList.toggle('is-active', i === depoimentoIndex);
      });
    };

    window.moveDepoimento = function (delta) {
      showDepoimento(depoimentoIndex + delta);
    };

    var depoimentoTouchStartX = null;
    var depoimentoFrame = depoimentoImg.closest('.testimonials-carousel__frame');
    depoimentoFrame.addEventListener('touchstart', function (e) {
      depoimentoTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    depoimentoFrame.addEventListener('touchend', function (e) {
      if (depoimentoTouchStartX === null) return;
      var delta = e.changedTouches[0].clientX - depoimentoTouchStartX;
      if (Math.abs(delta) > 40) window.moveDepoimento(delta < 0 ? 1 : -1);
      depoimentoTouchStartX = null;
    }, { passive: true });
  }

  /* ---------------------------------------------------
     Hero: efeito de apagar e escrever
     --------------------------------------------------- */
  var heroTypewriterStarted = false;

  function startHeroTypewriter() {
    if (heroTypewriterStarted) return;

    var wordElement = document.getElementById('hero-typewriter-word');
    if (!wordElement) return;

    heroTypewriterStarted = true;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var words = ['en un solo lugar', 'por etapa', 'siempre a mano'];

    if (reducedMotion) {
      wordElement.textContent = words[0];
      return;
    }

    var wordIndex = 0;
    var characterIndex = words[0].length;
    var deleting = true;

    function typeNextCharacter() {
      var currentWord = words[wordIndex];

      if (deleting) {
        characterIndex -= 1;
        wordElement.textContent = currentWord.slice(0, Math.max(0, characterIndex));

        if (characterIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          window.setTimeout(typeNextCharacter, 260);
          return;
        }

        window.setTimeout(typeNextCharacter, 55);
        return;
      }

      currentWord = words[wordIndex];
      characterIndex += 1;
      wordElement.textContent = currentWord.slice(0, characterIndex);

      if (characterIndex >= currentWord.length) {
        deleting = true;
        window.setTimeout(typeNextCharacter, 1650);
        return;
      }

      window.setTimeout(typeNextCharacter, 88);
    }

    window.setTimeout(typeNextCharacter, 1800);
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
    var entryQuizPreview = document.getElementById('entry-quiz-preview');
    var entryQuizPreviewText = document.getElementById('entry-quiz-preview-text');
    var ENTRY_AGE_LABELS = {
      'vai-comecar': 'o início da introdução alimentar',
      '6-meses': 'bebês de 6 meses',
      '7-9-meses': 'bebês de 7 a 9 meses',
      '10-12-meses': 'bebês de 10 a 12+ meses'
    };
    var ENTRY_PRIORITY_LABELS = {
      cortes: 'guia visual de cortes e texturas',
      variedade: 'receitas práticas para variar',
      rotina: 'cardápio semanal com lista de compras'
    };
    var ENTRY_SUPPORT_LABELS = {
      'guia-visual': 'consultar alimento por alimento',
      cardapio: 'seguir um plano pronto para cada dia',
      receitas: 'trocar opções e montar combinações'
    };

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Efeito de máquina de escrever: revela o título da etapa letra a letra
    // em vez de aparecer pronto de uma vez. Some com um cursor piscando
    // enquanto digita e o remove ao terminar.
    function typewriterEffect(el) {
      if (!el) return;
      var fullText = el.getAttribute('data-full-text') || el.textContent;
      el.setAttribute('data-full-text', fullText);

      if (prefersReducedMotion) {
        el.textContent = fullText;
        return;
      }

      el.textContent = '';
      var cursor = document.createElement('span');
      cursor.className = 'quiz-headline__cursor';
      cursor.setAttribute('aria-hidden', 'true');
      el.appendChild(cursor);

      var i = 0;
      var speed = 18;
      function typeNext() {
        if (i >= fullText.length) {
          cursor.remove();
          return;
        }
        cursor.insertAdjacentText('beforebegin', fullText.charAt(i));
        i += 1;
        window.setTimeout(typeNext, speed);
      }
      window.setTimeout(typeNext, 120);
    }

    // Prévia dinâmica: atualiza, em tempo real, um pequeno cartão que
    // resume o que já foi escolhido no quiz — não é conteúdo novo, é só um
    // reflexo instantâneo das próprias respostas da pessoa.
    function updateEntryQuizPreview() {
      if (!entryQuizPreview || !entryQuizPreviewText) return;
      var parts = [];
      if (entryQuizAnswers.age) {
        parts.push(ENTRY_AGE_LABELS[entryQuizAnswers.age] || 'a fase escolhida');
      }
      if (entryQuizAnswers.priority) {
        parts.push('com foco em ' + (ENTRY_PRIORITY_LABELS[entryQuizAnswers.priority] || 'suas prioridades'));
      }
      if (entryQuizAnswers.support) {
        parts.push('no formato de ' + (ENTRY_SUPPORT_LABELS[entryQuizAnswers.support] || 'sua preferência'));
      }
      if (!parts.length) {
        entryQuizPreview.classList.add('entry-quiz__preview--empty');
        return;
      }

      var text = 'Sua prévia: guia organizado para ' + parts.join(', ') + '.';
      entryQuizPreview.classList.remove('entry-quiz__preview--empty');
      entryQuizPreview.classList.add('is-updating');
      window.setTimeout(function () {
        entryQuizPreviewText.textContent = text;
        entryQuizPreview.classList.remove('is-updating');
      }, 140);
    }

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
        typewriterEffect(headline);
        window.setTimeout(function () { headline.focus({ preventScroll: true }); }, 40);
      }
    }

    // O percentual reflete perguntas RESPONDIDAS até chegar nesta etapa
    // (stepNumber - 1 de 3), não a etapa atual — por isso a etapa 1 começa
    // em 0%, não 33%. Só depois de responder a 3ª pergunta a barra é levada
    // a 100% (ver runEntryQuizLoading).
    function updateEntryQuizProgress(stepNumber) {
      var percent = Math.round(((stepNumber - 1) / 3) * 100);
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

    function revealLandingFromQuiz() {
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
        startHeroTypewriter();
      }, 520);
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
        content_name: 'Quiz de abertura NutriMama',
        phase: entryQuizAnswers.age,
        priority: entryQuizAnswers.priority,
        support: entryQuizAnswers.support
      });

      applyEntryQuizAge(entryQuizAnswers.age || '6-meses');
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
          'Preparando sua prévia do NutriMama...'
        ];

        entryQuizLoadingText.textContent = messages[0];
        entryQuizLoadingFill.style.transition = 'none';
        entryQuizLoadingFill.style.width = '0%';
        void entryQuizLoadingFill.offsetWidth;
        entryQuizLoadingFill.style.transition = 'width 1.8s linear';
        window.requestAnimationFrame(function () {
          entryQuizLoadingFill.style.width = '100%';
        });

        function changeLoadingMessage(message) {
          entryQuizLoadingText.classList.add('is-changing');
          window.setTimeout(function () {
            entryQuizLoadingText.textContent = message;
            entryQuizLoadingText.classList.remove('is-changing');
          }, 150);
        }

        window.setTimeout(function () { changeLoadingMessage(messages[1]); }, 600);
        window.setTimeout(function () { changeLoadingMessage(messages[2]); }, 1200);
        window.setTimeout(function () {
          entryQuizLoading.setAttribute('aria-busy', 'false');
          finishEntryQuiz();
        }, 1800);

        // Fallback para navegadores in-app que pausam timers em segundo plano.
        window.setTimeout(finishEntryQuiz, 2500);
      }, 200);
    }

    entryQuizSteps[1].querySelectorAll('[data-entry-age]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        markEntryOption(button);
        entryQuizAnswers.age = button.getAttribute('data-entry-age');
        trackEvent('QuizAnswer', { step: 1, question: 'age', answer: entryQuizAnswers.age });
        updateEntryQuizPreview();
        goToEntryQuizStep(1, 2);
      });
    });

    entryQuizSteps[2].querySelectorAll('[data-entry-priority]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        markEntryOption(button);
        entryQuizAnswers.priority = button.getAttribute('data-entry-priority');
        trackEvent('QuizAnswer', { step: 2, question: 'priority', answer: entryQuizAnswers.priority });
        updateEntryQuizPreview();
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
        updateEntryQuizPreview();
        runEntryQuizLoading();
      });
    });

    entryQuiz.querySelectorAll('[data-entry-back]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (entryQuizChanging) return;
        var targetStep = Number(button.getAttribute('data-entry-back'));
        var currentStep = targetStep + 1;
        trackEvent('QuizBack', { from_step: currentStep, to_step: targetStep });
        if (currentStep === 2) entryQuizAnswers.priority = null;
        if (currentStep === 3) entryQuizAnswers.support = null;
        updateEntryQuizPreview();
        goToEntryQuizStep(currentStep, targetStep);
      });
    });

    var entryQuizSkip = document.getElementById('entry-quiz-skip');
    if (entryQuizSkip) {
      entryQuizSkip.addEventListener('click', function () {
        trackEvent('QuizSkipped');
        try {
          window.sessionStorage.setItem('nutrimae_entry_quiz_completed', 'true');
        } catch (e) {}
        revealLandingFromQuiz();
      });
    }

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
        startHeroTypewriter();
      }, 0);
    } else {
      updateEntryQuizProgress(1);
      focusFirstEntryOption(1);
      trackEvent('QuizStart', { source: 'landing-entry' });
    }
  }

  if (!entryQuiz) startHeroTypewriter();

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
     Demonstrações reais do produto: lazy load + loop
     --------------------------------------------------- */
  var productDemoVideos = document.querySelectorAll('[data-product-demo]');
  var productDemoReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadProductDemo(video) {
    if (video.getAttribute('data-loaded') === 'true') return;
    var source = video.querySelector('source[data-src]');
    if (!source) return;

    source.src = source.getAttribute('data-src');
    video.setAttribute('data-loaded', 'true');
    video.load();
  }

  function playProductDemo(video) {
    loadProductDemo(video);
    video.muted = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        // Alguns navegadores in-app podem bloquear autoplay; o poster continua visível.
      });
    }
  }

  function updateProductDemoVisibility(video) {
    var rect = video.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var isNearViewport = rect.top < viewportHeight + 320 && rect.bottom > -180;

    if (isNearViewport) {
      loadProductDemo(video);
      if (!productDemoReducedMotion && video.getAttribute('data-user-paused') !== 'true') {
        playProductDemo(video);
      }
    } else if (!video.paused) {
      video.pause();
    }
  }

  productDemoVideos.forEach(function (video) {
    var placement = video.getAttribute('data-demo-placement') || 'landing';
    var viewed = false;

    video.addEventListener('play', function () {
      if (!viewed) {
        viewed = true;
        trackEvent('ProductDemoViewed', { placement: placement });
      }
    });

    var observer = safeObserve(video, function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadProductDemo(video);
          if (!productDemoReducedMotion && video.getAttribute('data-user-paused') !== 'true') {
            playProductDemo(video);
          }
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { rootMargin: '320px 0px', threshold: 0.01 });

    if (!observer) {
      var scheduled = false;
      var checkWithFallback = function () {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(function () {
          scheduled = false;
          updateProductDemoVisibility(video);
        });
      };
      window.addEventListener('scroll', checkWithFallback, { passive: true });
      window.addEventListener('resize', checkWithFallback);
      checkWithFallback();
    }
  });

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

  /* ---------------------------------------------------
     Dados: fases e alimentos
     --------------------------------------------------- */
  var AGE_CONTENT = {
    'vai-comecar': {
      ctaLabel: 'Ver plan de inicio',
      food: {
        name: 'Plátano', emoji: '🍌', age: 'a partir de los 6 meses',
        cut: 'Bastón grueso, del tamaño del puño cerrado del bebé',
        how: 'En la mano, sin cáscara, con una puntita cortada para dar apoyo'
      }
    },
    '6-meses': {
      ctaLabel: 'Ver plan de 6 meses',
      food: {
        name: 'Frutilla', emoji: '🍓', age: 'a partir de los 6 meses',
        cut: 'Entera, sin el cáliz',
        how: 'En la mano del bebé, sentado y supervisado'
      }
    },
    '7-9-meses': {
      ctaLabel: 'Ver plan de 7 a 9 meses',
      food: {
        name: 'Pollo desmenuzado', emoji: '🍗', age: '7 a 9 meses',
        cut: 'Desmenuzado o en tiras finas y suaves',
        how: 'Junto con el plato, fácil de agarrar con las manos'
      }
    },
    '10-12-meses': {
      ctaLabel: 'Ver plan de 10 a 12+ meses',
      food: {
        name: 'Bolita de verduras', emoji: '🥕', age: '10 a 12+ meses',
        cut: 'Trozos pequeños y suaves',
        how: 'Anima al bebé a agarrar solo, con o sin cubierto'
      }
    }
  };

  var SEARCHABLE_FOODS = [
    { key: 'banana', name: 'Plátano', emoji: '🍌', age: 'a partir de los 6 meses', cut: 'Bastón grueso, del tamaño del puño cerrado del bebé', how: 'En la mano, sin cáscara, con una puntita cortada para dar apoyo' },
    { key: 'abacate', name: 'Palta', emoji: '🥑', age: 'a partir de los 6 meses', cut: 'Rebanadas gruesas con cáscara, para facilitar el agarre', how: 'En la mano, o triturada en una cuchara precargada' },
    { key: 'morango', name: 'Frutilla', emoji: '🍓', age: 'a partir de los 6 meses', cut: 'Entera, sin el cáliz', how: 'En la mano del bebé, sentado y supervisado' }
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
     BLOCO 8: Manual S.O.S. (link para o app)
     --------------------------------------------------- */
  var sosLink = document.getElementById('sos-link');
  if (sosLink) {
    sosLink.href = APP_URL + '/sos';
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
     BLOCO 11: Oferta — Plano Completo/Básico + Checkout
     --------------------------------------------------- */
  // Pivô de 2026-09-08: NutriMama não vende mais assinatura recorrente —
  // Básico e Completo são os dois planos, ambos pagamento único vitalício
  // (offers.active=true, ver migração
  // 202609080001_planos_basico_completo.sql). O botão de compra segue o
  // toggle de verdade, em vez de sempre levar pro Completo.
  var toggleBasico = document.getElementById('toggle-basico');
  var toggleCompleto = document.getElementById('toggle-completo');
  var planCardBasico = document.getElementById('plan-card-basico');
  var planCardCompleto = document.getElementById('plan-card-completo');
  var selectedPlan = 'completo';
  var ctaCheckoutDynamic = document.getElementById('cta-checkout-dynamic');
  var stickyCtaPlan = document.querySelector('.sticky-cta__plan');
  var stickyCtaPrice = document.getElementById('sticky-cta-price');

  function selectPlanToggle(plan) {
    selectedPlan = plan;
    var showBasico = plan === 'basico';
    if (toggleBasico) {
      toggleBasico.classList.toggle('is-active', showBasico);
      toggleBasico.setAttribute('aria-selected', String(showBasico));
    }
    if (toggleCompleto) {
      toggleCompleto.classList.toggle('is-active', !showBasico);
      toggleCompleto.setAttribute('aria-selected', String(!showBasico));
    }
    if (planCardBasico) planCardBasico.hidden = !showBasico;
    if (planCardCompleto) planCardCompleto.hidden = showBasico;
    if (ctaCheckoutDynamic) {
      ctaCheckoutDynamic.textContent = showBasico
        ? 'Quiero el Básico por $3.990'
        : 'Quiero el Completo por $9.900';
    }
    if (stickyCtaPlan) stickyCtaPlan.textContent = showBasico ? 'NutriMama — Plan Básico' : 'NutriMama — Plan Completo';
    if (stickyCtaPrice) {
      stickyCtaPrice.innerHTML = showBasico
        ? '$3.990 <small>pago único</small>'
        : '$9.900 <small>pago único</small>';
    }
  }

  if (toggleBasico) {
    toggleBasico.addEventListener('click', function () { selectPlanToggle('basico'); });
  }
  if (toggleCompleto) {
    toggleCompleto.addEventListener('click', function () { selectPlanToggle('completo'); });
  }

  if (ctaCheckoutDynamic) {
    ctaCheckoutDynamic.textContent = 'Quiero el Completo por $9.900';
  }

  /* ---------------------------------------------------
     Barra de oferta fixa — visível assim que o hero sai da tela, pra
     oferta ficar clara na página inteira (pedido explícito do dono do
     produto), some de novo se ela rolar de volta pro topo.
     --------------------------------------------------- */
  var stickyCta = document.getElementById('sticky-cta');
  var stickyCtaBtn = document.getElementById('sticky-cta-btn');
  var heroSection = document.getElementById('bloco-1');

  safeObserve(heroSection, function (entries) {
    entries.forEach(function (entry) {
      if (stickyCta) stickyCta.classList.toggle('is-visible', !entry.isIntersecting);
    });
  }, { threshold: 0, rootMargin: '-64px 0px 0px 0px' });

  if (stickyCtaBtn) {
    stickyCtaBtn.addEventListener('click', function () {
      trackEvent('StickyCtaClick', { plan: selectedPlan });
      scrollToSection('bloco-6');
    });
  }

  /* ---------------------------------------------------
     BLOCO 11: Oferta — Revelação de desconto (colheres)
     --------------------------------------------------- */
  // Mecânica de gamificação (2026-09-10, visual refeito a partir de um
  // protótipo gerado no Lovable — ver LOVABLE_PROMPT_potecitos.md): a mãe
  // escolhe uma colher e revela um desconto real e FIXO (sempre 57,31%,
  // não é sorteio — ver .jar-reveal__terms no HTML), desbloqueando o Plan
  // Completo. Preço original $23.324 e preço à vista $9.900 confirmados
  // pelo dono do produto; a economia ($13.424) é derivada desses valores.
  (function () {
    var DISCOUNT_LABEL = '57,31% OFF';
    var SAVING_LABEL = '$13.424';
    var STORAGE_KEY = 'nutrimae:offer-reveal:v1';
    var BONUS_LABELS = ['Bono SOS incluido', 'Actualizaciones gratis'];

    var jarButtons = Array.prototype.slice.call(document.querySelectorAll('.jar-piece'));
    var jarShelf = document.getElementById('jar-choices') ? document.getElementById('jar-choices').closest('.jar-shelf') : null;
    var jarProgress = document.getElementById('jar-progress');
    var lockCta = document.getElementById('plan-card-lock-cta');
    var jarSkipLink = document.getElementById('jar-skip-link');
    var chosen = false;
    var pendingTimeouts = [];

    if (!jarButtons.length || !planCardCompleto) return;

    function reducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setBadge(button, text, variant) {
      var badge = button.querySelector('.jar-piece__badge');
      var hint = button.querySelector('.jar-piece__hint');
      if (badge) {
        badge.textContent = text;
        badge.classList.remove('is-discount', 'is-bonus');
        if (variant) badge.classList.add(variant);
      }
      if (hint) hint.textContent = variant === 'is-discount' ? 'Tu cuchara ✨' : variant === 'is-bonus' ? 'También es tuyo' : 'Toca y descubre';
    }

    function unlockCompletePlan() {
      planCardCompleto.classList.remove('is-locked');
      planCardCompleto.setAttribute('data-locked', 'false');
      trackEvent('OfferJarUnlocked', { discount: DISCOUNT_LABEL });
    }

    function finishReveal(index, skipAnimation) {
      var otherCount = 0;
      jarButtons.forEach(function (button, i) {
        button.disabled = true;
        button.classList.remove('is-revealing');
        var place = button.closest('.jar-place');
        if (i === index) {
          button.classList.add('is-selected');
          if (place) place.classList.add('is-chosen');
          setBadge(button, DISCOUNT_LABEL, 'is-discount');
        } else {
          button.classList.add('is-other');
          setBadge(button, '✓ ' + BONUS_LABELS[otherCount % BONUS_LABELS.length], 'is-bonus');
          otherCount++;
        }
      });
      if (jarShelf) jarShelf.classList.add('is-revealed');
      if (jarProgress) jarProgress.textContent = 'Tu descuento fue aplicado al Plan Completo abajo.';
      unlockCompletePlan();

      if (!skipAnimation) {
        var focusDelay = window.setTimeout(function () {
          planCardCompleto.focus({ preventScroll: true });
          planCardCompleto.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'nearest' });
        }, 50);
        pendingTimeouts.push(focusDelay);
      }
    }

    function chooseJar(index) {
      if (chosen) return;
      chosen = true;
      trackEvent('OfferJarSelected', { jar: index + 1 });

      var button = jarButtons[index];
      button.classList.add('is-revealing');
      setBadge(button, '…', null);
      if (jarProgress) jarProgress.textContent = 'Preparando tu sorpresa…';

      var delay = reducedMotion() ? 0 : 1000;
      var revealTimeout = window.setTimeout(function () {
        finishReveal(index, false);
        try { window.sessionStorage.setItem(STORAGE_KEY, String(index)); } catch (e) {}
        trackEvent('OfferJarRevealed', { jar: index + 1, discount: DISCOUNT_LABEL, saving: SAVING_LABEL });
      }, delay);
      pendingTimeouts.push(revealTimeout);
    }

    jarButtons.forEach(function (button, index) {
      button.addEventListener('click', function () { chooseJar(index); });
    });

    if (lockCta) {
      lockCta.addEventListener('click', function () {
        var firstJar = jarButtons.filter(function (b) { return !b.disabled; })[0];
        if (firstJar) firstJar.focus({ preventScroll: true });
        var target = document.getElementById('tu-descuento');
        if (target) target.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' });
      });
    }

    if (jarSkipLink) {
      // O card do Básico fica com `hidden` por padrão (toggle inicia em
      // "completo" — ver selectPlanToggle acima), então um <a href="#...">
      // simples não rolaria pra lugar nenhum. Troca o toggle antes de rolar.
      jarSkipLink.addEventListener('click', function (event) {
        event.preventDefault();
        trackEvent('OfferJarSkip');
        selectPlanToggle('basico');
        var target = document.getElementById('plan-card-basico');
        if (target) target.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'center' });
      });
    }

    // Já revelado nesta sessão: aplica o estado final sem animação, sem
    // permitir escolher de novo (mesmo padrão do offer-puzzle.tsx).
    try {
      var stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored !== null && /^[0-2]$/.test(stored)) {
        chosen = true;
        finishReveal(Number(stored), true);
      }
    } catch (e) { /* a experiência também funciona sem sessionStorage */ }
  })();

  // Checkout hospedado pelo próprio Hotmart (substituiu Stripe/Rebill em
  // 2026-09-11) — dá acesso nativo a todos os meios de pagamento locais do
  // Chile (não só cartão), sem precisar manter checkout próprio. Os
  // códigos de oferta abaixo são os preços JÁ corrigidos para o IVA de 19%
  // do Chile (preço base ÷ 1,19), validados no checkout mostrando
  // exatamente $9.900 / $3.990 com "IVA incluido" — ver
  // src/lib/webhooks/grant-access-hotmart.ts para o mapeamento completo
  // (inclui os códigos antigos, sem a correção de IVA, como fallback).
  var HOTMART_CHECKOUT_URL = {
    completo: 'https://pay.hotmart.com/E8499889N?off=5laftq57',
    basico: 'https://pay.hotmart.com/N8502012G?off=jbqhhgxn',
  };

  function goToOffer(plan) {
    window.location.href = HOTMART_CHECKOUT_URL[plan] || HOTMART_CHECKOUT_URL.completo;
  }

  function goToCheckout() {
    trackEvent('InitiateCheckout', { plan: selectedPlan, age: currentAgeKey });
    goToOffer(selectedPlan);
  }

  if (ctaCheckoutDynamic) {
    ctaCheckoutDynamic.addEventListener('click', goToCheckout);
  }

  /* ---------------------------------------------------
     Nav e CTA final
     --------------------------------------------------- */
  var siteNav = document.getElementById('site-nav');
  var siteMenu = document.getElementById('site-menu');
  var siteMenuToggle = document.getElementById('site-menu-toggle');

  function closeSiteMenu(returnFocus) {
    if (!siteNav || !siteMenuToggle) return;
    siteNav.classList.remove('site-nav--open');
    siteMenuToggle.setAttribute('aria-expanded', 'false');
    siteMenuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
    if (returnFocus) siteMenuToggle.focus();
  }

  if (siteNav && siteMenu && siteMenuToggle) {
    siteMenuToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('site-nav--open');
      siteMenuToggle.setAttribute('aria-expanded', String(isOpen));
      siteMenuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      if (isOpen) trackEvent('NavigationMenuOpen');
    });

    siteMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeSiteMenu(false);
      });
    });

    document.addEventListener('click', function (event) {
      if (siteNav.classList.contains('site-nav--open') && !siteNav.contains(event.target)) {
        closeSiteMenu(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
        closeSiteMenu(true);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 860) closeSiteMenu(false);
    }, { passive: true });
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
     Revelação ao rolar — cards e títulos de seção entram com um
     fade-up sutil ao alcançar a tela (ver CSS: .is-visible). Sem suporte
     a IntersectionObserver, tudo já nasce visível via CSS puro.
     --------------------------------------------------- */
  var revealSelector = [
    '.faq-item', '.comparison__col',
    '.mini-mock', '.plan-card-single',
    '.persona-story__img', '.persona-story__copy',
    'section .section-title'
  ].join(', ');
  var revealTargets = document.querySelectorAll(revealSelector);

  if (!supportsIO) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = null;
    try {
      revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    } catch (e) {
      revealObserver = null;
    }

    if (revealObserver) {
      revealTargets.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  trackEvent('ViewContent', { page: 'oferta' });

});
