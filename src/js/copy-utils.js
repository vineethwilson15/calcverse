(function () {
  'use strict';

  function showToast(message) {
    var existing = document.querySelector('.toast.show');
    if (existing) existing.classList.remove('show');

    var toast = document.getElementById('copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copy-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message || 'Copied!';
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied to clipboard!');
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var copyBtn = document.getElementById('copy-btn');
    var output = document.getElementById('output-text');
    if (copyBtn && output) {
      copyBtn.addEventListener('click', function () {
        var text = output.textContent || output.innerText;
        if (text) copyText(text);
      });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.symbol-btn');
      if (btn) {
        var symbol = btn.getAttribute('data-symbol');
        if (symbol) copyText(symbol);
      }
    });
  });

  window.Fontify = window.Fontify || {};
  window.Fontify.copy = copyText;
  window.Fontify.showToast = showToast;
})();
