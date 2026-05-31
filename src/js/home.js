(function () {
  'use strict';

  var FONTS = [
    { id: 'bold', name: 'Bold', method: 'range', ranges: { upper: 120276, lower: 120302, digits: 120782 } },
    { id: 'italic', name: 'Italic', method: 'range', ranges: { upper: 120328, lower: 120354, digits: null } },
    { id: 'bold-italic', name: 'Bold Italic', method: 'range', ranges: { upper: 120380, lower: 120406, digits: null } },
    { id: 'cursive', name: 'Cursive', method: 'range', ranges: { upper: 119964, lower: 119990, digits: null } },
    { id: 'cursive-bold', name: 'Bold Cursive', method: 'range', ranges: { upper: 120016, lower: 120042, digits: null } },
    { id: 'old-english', name: 'Old English', method: 'range', ranges: { upper: 120068, lower: 120094, digits: null } },
    { id: 'double-struck', name: 'Double-Struck', method: 'range', ranges: { upper: 120120, lower: 120146, digits: 120792 } },
    { id: 'monospace', name: 'Monospace', method: 'range', ranges: { upper: 120432, lower: 120458, digits: 120822 } },
    { id: 'fullwidth', name: 'Fullwidth', method: 'range', ranges: { upper: 65313, lower: 65345, digits: 65296 } },
    { id: 'circled', name: 'Circled', method: 'range', ranges: { upper: 9398, lower: 9424, digits: null } },
    { id: 'negative-squared', name: 'Neg. Squared', method: 'range', ranges: { upper: 127344, lower: null, digits: null } },
    { id: 'bold-serif', name: 'Bold Serif', method: 'range', ranges: { upper: 119808, lower: 119834, digits: 120782 } },
    { id: 'small-caps', name: 'Small Caps', method: 'table', table: { a: '\u1D00', b: '\u0299', c: '\u1D04', d: '\u1D05', e: '\u1D07', f: '\u0493', g: '\u0262', h: '\u029C', i: '\u026A', j: '\u1D0A', k: '\u1D0B', l: '\u029F', m: '\u1D0D', n: '\u0274', o: '\u1D0F', p: '\u1D18', q: '\u01EB', r: '\u0280', s: 's', t: '\u1D1B', u: '\u1D1C', v: '\u1D20', w: '\u1D21', x: 'x', y: '\u028F', z: '\u1D22' } },
    { id: 'superscript', name: 'Tiny/Superscript', method: 'table', table: { a: '\u1D43', b: '\u1D47', c: '\u1D9C', d: '\u1D48', e: '\u1D49', f: '\u1DA0', g: '\u1D4D', h: '\u02B0', i: '\u2071', j: '\u02B2', k: '\u1D4F', l: '\u02E1', m: '\u1D50', n: '\u207F', o: '\u1D52', p: '\u1D56', q: '\u1D60', r: '\u02B3', s: '\u02E2', t: '\u1D57', u: '\u1D58', v: '\u1D5B', w: '\u02B7', x: '\u02E3', y: '\u02B8', z: '\u1DBB' } },
    { id: 'strikethrough', name: 'Strikethrough', method: 'combining', combiningChar: 822 },
    { id: 'underline', name: 'Underline', method: 'combining', combiningChar: 818 }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('hero-input');
    var grid = document.getElementById('font-grid');
    if (!input || !grid) return;

    function renderAll() {
      var text = input.value || 'Hello World';
      var html = '';
      for (var i = 0; i < FONTS.length; i++) {
        var font = FONTS[i];
        var transformed = window.Fontify.transform(text, font);
        html += '<div class="font-card" data-text="' + escapeAttr(transformed) + '">';
        html += '<div class="font-card-name">' + font.name + '</div>';
        html += '<div class="font-card-preview">' + escapeHtml(transformed) + '</div>';
        html += '<button class="font-card-copy">Copy</button>';
        html += '</div>';
      }
      grid.innerHTML = html;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeAttr(str) {
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    input.addEventListener('input', renderAll);
    renderAll();

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.font-card');
      if (!card) return;
      var text = card.getAttribute('data-text');
      if (text) window.Fontify.copy(text);
    });
  });
})();
