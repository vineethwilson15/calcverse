(function () {
  'use strict';

  function convert(value, data) {
    if (data.type === 'factor') {
      return value * data.factor;
    }
    var base = value;
    if (data.fromConvert && data.fromConvert.toBase) {
      base = Function('x', 'return ' + data.fromConvert.toBase)(value);
    }
    if (data.toConvert && data.toConvert.fromBase) {
      return Function('x', 'return ' + data.toConvert.fromBase)(base);
    }
    return base;
  }

  function reverseConvert(value, data) {
    if (data.type === 'factor') {
      return value / data.factor;
    }
    var base = value;
    if (data.toConvert && data.toConvert.toBase) {
      base = Function('x', 'return ' + data.toConvert.toBase)(value);
    }
    if (data.fromConvert && data.fromConvert.fromBase) {
      return Function('x', 'return ' + data.fromConvert.fromBase)(base);
    }
    return base;
  }

  function formatResult(value) {
    if (Math.abs(value) < 0.0001 && value !== 0) return value.toExponential(4);
    if (Math.abs(value) >= 1000000) return value.toExponential(4);
    var s = parseFloat(value.toPrecision(8));
    return new Intl.NumberFormat('en', { maximumFractionDigits: 6 }).format(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var data = window.__CONVERSION_DATA__;
    if (!data) return;

    var fromInput = document.getElementById('from-value');
    var toInput = document.getElementById('to-value');
    var resultText = document.getElementById('result-text');
    var swapBtn = document.getElementById('swap-btn');
    var copyBtn = document.getElementById('copy-result');

    function doConvert() {
      var val = parseFloat(fromInput.value);
      if (isNaN(val)) {
        toInput.value = '';
        resultText.textContent = '';
        return;
      }
      var result = convert(val, data);
      toInput.value = formatResult(result);
      resultText.textContent = val + ' ' + data.fromSymbol + ' = ' + formatResult(result) + ' ' + data.toSymbol;
    }

    fromInput.addEventListener('input', doConvert);
    doConvert();

    if (swapBtn) {
      swapBtn.addEventListener('click', function () {
        var reverseSlug = data.toId + '-to-' + data.fromId;
        window.location.href = '/convert/' + reverseSlug + '/';
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = resultText.textContent;
        if (text) {
          navigator.clipboard.writeText(text).then(function () {
            var orig = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = orig; }, 1500);
          });
        }
      });
    }
  });
})();
