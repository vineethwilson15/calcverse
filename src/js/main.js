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
})();
