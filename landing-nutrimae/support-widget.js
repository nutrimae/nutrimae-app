(function () {
  'use strict';

  var SUPPORT_EMAIL = 'contato@nutrimae.app';
  var wrapper = document.createElement('div');

  wrapper.innerHTML = [
    '<button class="support-launcher" type="button" aria-label="Abrir atendimento humano" aria-expanded="false">',
      '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 21 15Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>',
    '</button>',
    '<aside class="support-widget" role="dialog" aria-modal="false" aria-labelledby="support-widget-title" aria-hidden="true">',
      '<header class="support-widget__hero">',
        '<img class="support-widget__brand" src="assets/logo-192.webp" width="52" height="52" alt="NutriMãe">',
        '<button class="support-widget__close" type="button" aria-label="Fechar atendimento">×</button>',
        '<h2 class="support-widget__title" id="support-widget-title">Oi! Como podemos ajudar? 💗</h2>',
        '<p class="support-widget__subtitle">Consulte respostas rápidas ou escreva para a equipe NutriMãe.</p>',
      '</header>',
      '<div class="support-widget__body">',
        '<div class="support-widget__view" data-support-view="home">',
          '<button class="support-widget__card" type="button" data-open-messages>',
            '<span class="support-widget__card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 21 15Z"/></svg></span>',
            '<span class="support-widget__card-copy"><span class="support-widget__card-title">Falar com o suporte humano</span><span class="support-widget__card-text">Envie sua mensagem. A resposta chega no e-mail informado.</span></span>',
            '<span class="support-widget__card-arrow" aria-hidden="true">›</span>',
          '</button>',
          '<a class="support-widget__card" href="https://app.nutrimae.app/app/suporte">',
            '<span class="support-widget__card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M18 19h-2v-6h4v4a2 2 0 0 1-2 2ZM6 19H4a2 2 0 0 1-2-2v-4h4v6Z"/><path d="M18 19c0 2-2 3-5 3"/></svg></span>',
            '<span class="support-widget__card-copy"><span class="support-widget__card-title">Já tenho acesso ao NutriMãe</span><span class="support-widget__card-text">Abra a central de suporte do app e acompanhe suas mensagens.</span></span>',
            '<span class="support-widget__card-arrow" aria-hidden="true">›</span>',
          '</a>',
          '<a class="support-widget__card" href="faq.html">',
            '<span class="support-widget__card-icon" aria-hidden="true">?</span>',
            '<span class="support-widget__card-copy"><span class="support-widget__card-title">Perguntas frequentes</span><span class="support-widget__card-text">Planos, acesso, cancelamento, garantia e funcionamento.</span></span>',
            '<span class="support-widget__card-arrow" aria-hidden="true">›</span>',
          '</a>',
        '</div>',
        '<div class="support-widget__view" data-support-view="messages" hidden>',
          '<p class="support-widget__human-note"><span aria-hidden="true">👩‍💻</span><span>Esta mensagem é destinada a uma pessoa da equipe. Para acompanhar tickets dentro do app, use a Central de Suporte disponível para clientes.</span></p>',
          '<form class="support-form" id="support-form">',
            '<label>Nome<input name="name" autocomplete="name" required></label>',
            '<label>E-mail<input name="email" type="email" autocomplete="email" required></label>',
            '<label>Como podemos ajudar?<textarea name="message" required></textarea></label>',
            '<button class="support-form__submit" type="submit">Abrir e-mail para enviar</button>',
            '<p class="support-form__status" id="support-form-status" aria-live="polite"></p>',
          '</form>',
        '</div>',
      '</div>',
      '<nav class="support-widget__tabs" aria-label="Navegação do atendimento">',
        '<button class="support-widget__tab is-active" type="button" data-support-tab="home">Início</button>',
        '<button class="support-widget__tab" type="button" data-support-tab="messages">Mensagens</button>',
      '</nav>',
    '</aside>'
  ].join('');

  document.body.appendChild(wrapper);

  var launcher = wrapper.querySelector('.support-launcher');
  var widget = wrapper.querySelector('.support-widget');
  var closeButton = wrapper.querySelector('.support-widget__close');
  var tabs = wrapper.querySelectorAll('[data-support-tab]');
  var views = wrapper.querySelectorAll('[data-support-view]');
  var openMessagesButton = wrapper.querySelector('[data-open-messages]');
  var form = wrapper.querySelector('#support-form');
  var status = wrapper.querySelector('#support-form-status');

  function setView(viewName) {
    views.forEach(function (view) {
      view.hidden = view.getAttribute('data-support-view') !== viewName;
    });
    tabs.forEach(function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-support-tab') === viewName);
    });
    if (viewName === 'messages') {
      window.setTimeout(function () {
        var firstInput = form.querySelector('input');
        if (firstInput) firstInput.focus({ preventScroll: true });
      }, 60);
    }
  }

  function openWidget(viewName) {
    widget.classList.add('is-open');
    widget.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    setView(viewName || 'home');
    closeButton.focus({ preventScroll: true });
  }

  function closeWidget() {
    widget.classList.remove('is-open');
    widget.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus({ preventScroll: true });
  }

  launcher.addEventListener('click', function () {
    if (widget.classList.contains('is-open')) closeWidget();
    else openWidget('home');
  });
  closeButton.addEventListener('click', closeWidget);
  openMessagesButton.addEventListener('click', function () { setView('messages'); });
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { setView(tab.getAttribute('data-support-tab')); });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var name = String(data.get('name') || '').trim();
    var email = String(data.get('email') || '').trim();
    var message = String(data.get('message') || '').trim();
    var subject = 'Suporte NutriMãe — mensagem de ' + name;
    var body = ['Nome: ' + name, 'E-mail para resposta: ' + email, '', 'Mensagem:', message].join('\n');

    status.textContent = 'Abrindo seu aplicativo de e-mail para concluir o envio…';
    window.location.href = 'mailto:' + SUPPORT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && widget.classList.contains('is-open')) closeWidget();
  });
})();
