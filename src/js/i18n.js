(function () {
  'use strict';

  var translations = {};
  var currentLang = document.documentElement.lang || 'en';

  function t(key, params) {
    var text = translations[key] || key;
    if (params) {
      for (var i = 0; i < params.length; i++) {
        text = text.replace('{' + i + '}', params[i]);
      }
    }
    return text;
  }

  function applyTranslations() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      var text = t(key);
      if (text !== key) {
        if (els[i].hasAttribute('data-i18n-attr')) {
          els[i].setAttribute(els[i].getAttribute('data-i18n-attr'), text);
        } else {
          els[i].textContent = text;
        }
      }
    }
  }

  function loadTranslations(lang) {
    fetch('/i18n/' + lang + '.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) {
        translations = data;
        applyTranslations();
      })
      .catch(function () {});
  }

  window.CalcVerse = window.CalcVerse || {};
  window.CalcVerse.i18n = { t: t, load: loadTranslations, apply: applyTranslations };

  document.addEventListener('DOMContentLoaded', function () {
    loadTranslations(currentLang);
  });
})();
