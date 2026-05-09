(function () {
  'use strict';

  var formatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  function formatValue(value, format) {
    if (format === 'text' || typeof value === 'string') return value;
    if (format === 'currency') return formatter.format(value);
    if (format === 'percent') return value.toFixed(2) + '%';
    if (format === 'decimal') return value.toFixed(2);
    return formatter.format(value);
  }

  function getInputValues(form) {
    var inputs = form.querySelectorAll('.form-input');
    var values = {};
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var raw = input.value.replace(/,/g, '');
      values[input.name] = raw;
    }
    return values;
  }

  function displayResults(container, results, outputs) {
    container.innerHTML = '';
    for (var i = 0; i < outputs.length; i++) {
      var out = outputs[i];
      var value = results[out.id];
      if (value === undefined) continue;

      var card = document.createElement('div');
      card.className = 'result-card';

      var label = document.createElement('div');
      label.className = 'result-label';
      label.textContent = out.label;

      var val = document.createElement('div');
      val.className = 'result-value' + (i === 0 ? ' highlight' : '');
      val.textContent = formatValue(value, out.format);

      card.appendChild(label);
      card.appendChild(val);
      container.appendChild(card);
    }
  }

  function copyResults(resultsSection) {
    var cards = resultsSection.querySelectorAll('.result-card');
    var lines = [];
    for (var i = 0; i < cards.length; i++) {
      var label = cards[i].querySelector('.result-label').textContent;
      var value = cards[i].querySelector('.result-value').textContent;
      lines.push(label + ': ' + value);
    }
    var text = lines.join('\n');
    navigator.clipboard.writeText(text).then(function () {
      var btn = document.getElementById('copy-results');
      if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = orig; }, 1500);
      }
    });
  }

  function shareResults(title) {
    if (navigator.share) {
      navigator.share({
        title: title + ' | CalcVerse',
        url: window.location.href
      }).catch(function () {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(function () {
        var btn = document.getElementById('share-results');
        if (btn) {
          var orig = btn.textContent;
          btn.textContent = 'Link copied!';
          setTimeout(function () { btn.textContent = orig; }, 1500);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('calc-form');
    var resultsSection = document.getElementById('calc-results');
    var resultsCards = document.getElementById('results-cards');
    if (!form || !resultsSection || !resultsCards) return;

    var calcId = form.getAttribute('data-calculator');
    if (!calcId) return;

    var outputsRaw = form.getAttribute('data-outputs');
    var outputs = [];
    try { outputs = JSON.parse(outputsRaw); } catch (e) { return; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var calc = window.CalcVerse && window.CalcVerse.calculators[calcId];
      if (!calc) return;

      var inputs = getInputValues(form);
      var results = calc.calculate(inputs);

      displayResults(resultsCards, results, outputs);
      resultsSection.hidden = false;

      var chartContainer = document.getElementById('chart-container');
      var chartConfigRaw = form.getAttribute('data-chart');
      if (chartContainer && chartConfigRaw && window.CalcVerse.renderChart) {
        try {
          var chartConfig = JSON.parse(chartConfigRaw);
          chartContainer.hidden = false;
          window.CalcVerse.renderChart('calc-chart', chartConfig, results);
        } catch (e) {}
      }

      var params = new URLSearchParams(inputs);
      history.replaceState(null, '', '?' + params.toString());
    });

    form.addEventListener('reset', function () {
      resultsSection.hidden = true;
      history.replaceState(null, '', window.location.pathname);
    });

    var copyBtn = document.getElementById('copy-results');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () { copyResults(resultsSection); });
    }

    var shareBtn = document.getElementById('share-results');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var title = document.querySelector('.calc-title');
        shareResults(title ? title.textContent : 'Calculator');
      });
    }

    var params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      var inputs = form.querySelectorAll('.form-input');
      var hasValues = false;
      for (var i = 0; i < inputs.length; i++) {
        var val = params.get(inputs[i].name);
        if (val) {
          inputs[i].value = val;
          hasValues = true;
        }
      }
      if (hasValues) {
        form.dispatchEvent(new Event('submit'));
      }
    }
  });
})();
