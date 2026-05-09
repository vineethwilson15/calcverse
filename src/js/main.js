(function () {
  'use strict';

  var html = document.documentElement;
  var savedTheme = localStorage.getItem('calcverse-theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.setAttribute('data-theme', 'light');
  }

  window.CalcVerse = window.CalcVerse || { calculators: {} };

  document.addEventListener('DOMContentLoaded', function () {
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        var current = html.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('calcverse-theme', next);
      });
    }

    var menuToggle = document.getElementById('menu-toggle');
    var mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
          mainNav.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
          menuToggle.focus();
        }
      });

      document.addEventListener('click', function (e) {
        if (mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
          mainNav.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
        }
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    }
  });
})();
