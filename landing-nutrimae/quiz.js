/* =====================================================
   NutriMãe — Quiz Rápido (ponte de conversão)
   Página ultraleve e isolada: recebe o clique do anúncio, qualifica em
   3 perguntas e redireciona para index.html. Sem vídeo, sem dependências
   do script.js da landing principal — carrega rápido de propósito.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  function trackEvent(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, params || {});
    }
    console.log('[track]', eventName, params || {});
  }

  var answers = { age: null, challenge: null, plan: null };

  var steps = {
    1: document.getElementById('quiz-step-1'),
    2: document.getElementById('quiz-step-2'),
    3: document.getElementById('quiz-step-3')
  };
  var loading = document.getElementById('quiz-loading');
  var loadingText = document.getElementById('quiz-loading-text');
  var progressFill = document.getElementById('quiz-progress-fill');

  // Barra de progresso "Passo X de 3" no topo — dá à mãe uma noção clara de
  // quanto falta, reduzindo abandono na 2ª pergunta.
  var quizProgress = document.getElementById('quiz-progress');
  var quizProgressFill = document.getElementById('quiz-progress-track-fill');
  var quizProgressLabel = document.getElementById('quiz-progress-label');
  var TOTAL_STEPS = 3;

  function updateQuizProgress(stepNumber) {
    if (!quizProgress) return;
    quizProgressFill.style.width = ((stepNumber / TOTAL_STEPS) * 100) + '%';
    quizProgressLabel.textContent = 'Passo ' + stepNumber + ' de ' + TOTAL_STEPS;
  }

  function goToStep(fromStep, toStep) {
    if (steps[fromStep]) {
      steps[fromStep].classList.add('quiz-step--fade-out');
      setTimeout(function () {
        steps[fromStep].classList.add('quiz-step--hidden');
        steps[fromStep].classList.remove('quiz-step--fade-out');
        if (steps[toStep]) {
          steps[toStep].classList.remove('quiz-step--hidden');
        }
        updateQuizProgress(toStep);
      }, 250);
    } else if (steps[toStep]) {
      steps[toStep].classList.remove('quiz-step--hidden');
      updateQuizProgress(toStep);
    }
  }

  // Pergunta 1 — idade
  steps[1].querySelectorAll('.quiz-option-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      answers.age = btn.getAttribute('data-age');
      trackEvent('QuizAnswer', { step: 1, question: 'age', answer: answers.age });
      goToStep(1, 2);
    });
  });

  // Pergunta 2 — maior desafio/prioridade
  steps[2].querySelectorAll('.quiz-option-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      answers.challenge = btn.getAttribute('data-challenge');
      trackEvent('QuizAnswer', { step: 2, question: 'challenge', answer: answers.challenge });
      goToStep(2, 3);
    });
  });

  // Pergunta 3 — cardápio pronto vs. montar
  steps[3].querySelectorAll('.quiz-option-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      answers.plan = btn.getAttribute('data-plan');
      trackEvent('QuizAnswer', { step: 3, question: 'plan', answer: answers.plan });
      runTransition();
    });
  });

  // Mapeia os 4 grupos de idade deste quiz para as 4 fases usadas na
  // landing principal (index.html), na mesma ordem — usado só para a
  // continuidade visual (pré-seleciona a fase certa lá).
  var AGE_MAP = {
    'vai-comecar': 'vai-comecar',
    '6-8-meses': '6-meses',
    '9-11-meses': '7-9-meses',
    '12-mais': '10-12-meses'
  };

  // Texto legível da idade escolhida, usado só na mensagem de transição —
  // reforça que o que vem a seguir foi montado para a fase exata do bebê.
  var AGE_LABEL = {
    'vai-comecar': 'quem vai começar aos 6 meses',
    '6-8-meses': 'bebês de 6 a 8 meses',
    '9-11-meses': 'bebês de 9 a 11 meses',
    '12-mais': 'bebês de 12 meses ou mais'
  };

  function runTransition() {
    steps[3].classList.add('quiz-step--fade-out');
    if (quizProgress) quizProgress.classList.add('quiz-progress--hidden');
    setTimeout(function () {
      steps[3].classList.add('quiz-step--hidden');
      loading.classList.remove('quiz-loading--hidden');

      var ageLabel = AGE_LABEL[answers.age] || 'a fase do seu bebê';
      var messages = [
        'A processar as suas respostas...',
        'A gerar plano nutricional seguro...',
        'A selecionar cortes ideais para ' + ageLabel + '...'
      ];
      var messageIndex = 0;
      loadingText.textContent = messages[0];

      var totalDuration = 3000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / totalDuration, 1);
        progressFill.style.width = (progress * 100) + '%';

        var newIndex = Math.min(Math.floor(progress * messages.length), messages.length - 1);
        if (newIndex !== messageIndex) {
          messageIndex = newIndex;
          loadingText.textContent = messages[messageIndex];
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          finishQuiz();
        }
      }
      requestAnimationFrame(step);

      // Fallback: garante o redirecionamento mesmo se requestAnimationFrame
      // ficar parado (aba em segundo plano, navegador in-app restrito, etc.).
      setTimeout(finishQuiz, totalDuration + 800);
    }, 250);
  }

  var finished = false;
  function finishQuiz() {
    if (finished) return;
    finished = true;
    trackEvent('QuizComplete', answers);
    var mappedAge = AGE_MAP[answers.age] || '6-meses';

    // Alguns hosts estáticos fazem redirect de /index.html?query para / e
    // derrubam a query string pelo caminho (confirmado em teste local com
    // o servidor "serve"). sessionStorage é a via garantida, já que
    // sobrevive a esse tipo de redirect — a query string fica como reforço,
    // não como única fonte. index.html lê os dois (ver script.js).
    try {
      window.sessionStorage.setItem('nutrimae_fase_from_quiz', mappedAge);
    } catch (e) {
      // sessionStorage indisponível — sem problema, ainda tenta pela query.
    }
    window.location.href = 'index.html?fase=' + encodeURIComponent(mappedAge);
  }

  trackEvent('QuizStart');
});
