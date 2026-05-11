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

  function formatChartNumber(n) {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(1) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toFixed(0);
  }

  function renderLineChart(canvasId, config, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentElement.clientWidth || 400;
    var cssH = 300;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.scale(dpr, dpr);

    var colors = getColors();
    var points = data[config.dataKey] || [];
    if (points.length === 0) return;

    var points2 = config.dataKey2 ? (data[config.dataKey2] || []) : [];

    var pad = { top: 20, right: 20, bottom: 40, left: 65 };
    var w = cssW - pad.left - pad.right;
    var h = cssH - pad.top - pad.bottom;

    var maxVal = 0;
    for (var i = 0; i < points.length; i++) {
      if (points[i].value > maxVal) maxVal = points[i].value;
    }
    for (var i = 0; i < points2.length; i++) {
      if (points2[i].value > maxVal) maxVal = points2[i].value;
    }
    maxVal = maxVal * 1.1 || 1;

    var textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#94A3B8';
    var gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#1E2433';
    var bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim() || '#141825';

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (var g = 0; g <= 5; g++) {
      var gy = pad.top + h - (g / 5) * h;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(pad.left + w, gy);
      ctx.stroke();
      ctx.fillText(formatChartNumber((g / 5) * maxVal), pad.left - 8, gy + 4);
    }

    ctx.textAlign = 'center';
    var maxLabels = 8;
    var step = Math.max(1, Math.ceil(points.length / maxLabels));
    for (var i = 0; i < points.length; i += step) {
      var lx = pad.left + (i / (points.length - 1)) * w;
      ctx.fillText(points[i].label, lx, cssH - pad.bottom + 20);
    }

    function drawLine(pts, color, dashed) {
      if (pts.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash(dashed ? [6, 4] : []);
      for (var i = 0; i < pts.length; i++) {
        var px = pad.left + (pts.length > 1 ? (i / (pts.length - 1)) * w : w / 2);
        var py = pad.top + h - (pts[i].value / maxVal) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawFill(pts, color) {
      if (pts.length === 0) return;
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var px = pad.left + (pts.length > 1 ? (i / (pts.length - 1)) * w : w / 2);
        var py = pad.top + h - (pts[i].value / maxVal) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineTo(pad.left + w, pad.top + h);
      ctx.lineTo(pad.left, pad.top + h);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.15;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (points2.length > 0) {
      drawFill(points2, colors[1]);
      drawLine(points2, colors[1], true);
    }
    drawFill(points, colors[0]);
    drawLine(points, colors[0], false);

    var container = canvas.parentElement;
    var existing = container.querySelector('.chart-legend');
    if (existing) existing.remove();

    var labels = config.labels || [];
    if (labels.length > 0) {
      var legend = document.createElement('div');
      legend.className = 'chart-legend';
      for (var i = 0; i < labels.length; i++) {
        var item = document.createElement('span');
        item.className = 'chart-legend-item';
        var swatch = document.createElement('span');
        swatch.className = 'chart-legend-swatch';
        swatch.style.backgroundColor = colors[i % colors.length];
        if (i === 1) swatch.style.opacity = '0.7';
        item.appendChild(swatch);
        item.appendChild(document.createTextNode(labels[i]));
        legend.appendChild(item);
      }
      container.appendChild(legend);
    }
  }

  window.CalcVerse = window.CalcVerse || {};
  window.CalcVerse.renderChart = function (canvasId, config, data) {
    if (config.chartType === 'line') {
      renderLineChart(canvasId, config, data);
    } else {
      renderPieChart(canvasId, config, data);
    }
  };
})();
