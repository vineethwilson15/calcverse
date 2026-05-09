(function () {
  'use strict';

  function getColors() {
    var style = getComputedStyle(document.documentElement);
    return [
      style.getPropertyValue('--color-primary').trim() || '#3B82F6',
      style.getPropertyValue('--color-secondary').trim() || '#10B981',
      style.getPropertyValue('--color-accent').trim() || '#F59E0B',
      style.getPropertyValue('--color-danger').trim() || '#EF4444',
      '#8B5CF6',
      '#EC4899'
    ];
  }

  function renderPieChart(canvasId, config, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var radius = Math.min(cx, cy) - 10;
    var colors = getColors();

    var values = [];
    var labels = config.labels || [];
    var keys = config.dataKeys || [];
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
      var v = parseFloat(data[keys[i]]) || 0;
      values.push(v);
      total += v;
    }
    if (total === 0) return;

    ctx.clearRect(0, 0, w, h);
    var startAngle = -Math.PI / 2;
    for (var i = 0; i < values.length; i++) {
      var sliceAngle = (values[i] / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    }

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, 2 * Math.PI);
    var bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim() || '#141825';
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Render legend as HTML below the canvas
    var container = canvas.parentElement;
    var existing = container.querySelector('.chart-legend');
    if (existing) existing.remove();

    var legend = document.createElement('div');
    legend.className = 'chart-legend';
    for (var i = 0; i < labels.length; i++) {
      var item = document.createElement('span');
      item.className = 'chart-legend-item';

      var swatch = document.createElement('span');
      swatch.className = 'chart-legend-swatch';
      swatch.style.backgroundColor = colors[i % colors.length];

      var pct = ((values[i] / total) * 100).toFixed(1);
      var text = document.createTextNode(labels[i] + ' (' + pct + '%)');

      item.appendChild(swatch);
      item.appendChild(text);
      legend.appendChild(item);
    }
    container.appendChild(legend);
  }

  window.CalcVerse = window.CalcVerse || {};
  window.CalcVerse.renderChart = function (canvasId, config, data) {
    renderPieChart(canvasId, config, data);
  };
})();
