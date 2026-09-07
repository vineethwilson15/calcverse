(function () {
  'use strict';

  // Theme toggle
  var themeToggle = document.getElementById('theme-toggle');
  var storedTheme = localStorage.getItem('fontify-theme');
  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('fontify-theme', next);
    });
  }

  // Mobile menu toggle
  var menuToggle = document.getElementById('menu-toggle');
  var mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });
  }

  // Filter symbol collections by their human-readable name or Unicode code.
  var symbolSearch = document.getElementById('symbol-search');
  if (symbolSearch) {
    symbolSearch.addEventListener('input', function () {
      var query = symbolSearch.value.trim().toLowerCase();
      var symbols = document.querySelectorAll('.symbol-btn');
      for (var i = 0; i < symbols.length; i++) {
        var matches = !query || symbols[i].getAttribute('data-symbol-name').indexOf(query) !== -1 || symbols[i].getAttribute('data-symbol-code').indexOf(query) !== -1;
        symbols[i].hidden = !matches;
      }
    });
  }
})();
