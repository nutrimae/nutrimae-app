(function () {
  'use strict';

  var search = document.getElementById('faq-search');
  var categoryButtons = document.querySelectorAll('[data-faq-category]');
  var entries = document.querySelectorAll('[data-faq-entry]');
  var emptyState = document.getElementById('faq-empty');
  var currentCategory = 'all';

  if (!entries.length) return;

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function filterFaq() {
    var query = normalize(search ? search.value : '');
    var visibleCount = 0;

    entries.forEach(function (entry) {
      var category = entry.getAttribute('data-category');
      var content = normalize(entry.textContent);
      var matchesCategory = currentCategory === 'all' || category === currentCategory;
      var matchesQuery = !query || content.indexOf(query) !== -1;
      var visible = matchesCategory && matchesQuery;
      entry.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentCategory = button.getAttribute('data-faq-category');
      categoryButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filterFaq();
    });
  });

  if (search) search.addEventListener('input', filterFaq);

  entries.forEach(function (entry) {
    entry.addEventListener('toggle', function () {
      if (!entry.open) return;
      entries.forEach(function (other) {
        if (other !== entry) other.removeAttribute('open');
      });
    });
  });
})();
