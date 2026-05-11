(function () {
  'use strict';
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatTime(h, m) {
    var period = h >= 12 ? 'PM' : 'AM';
    var hr = h % 12 || 12;
    return hr + ':' + pad(m) + ' ' + period;
  }

  function addMinutes(h, m, mins) {
    var total = h * 60 + m + mins;
    total = ((total % 1440) + 1440) % 1440;
    return { h: Math.floor(total / 60), m: total % 60 };
  }

  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.sleep = {
    calculate: function (inputs) {
      var time = inputs.wakeTime || '07:00';
      var mode = inputs.mode || 'wake';
      var parts = time.split(':');
      var h = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var results = {};
      if (mode === 'wake') {
        for (var c = 6; c >= 3; c--) {
          var t = addMinutes(h, m, -(c * 90 + 15));
          results['cycle' + (7 - c)] = formatTime(t.h, t.m) + ' (' + c + ' cycles, ' + (c * 1.5) + ' hrs)';
        }
      } else {
        for (var c = 3; c <= 6; c++) {
          var t = addMinutes(h, m, c * 90 + 15);
          results['cycle' + (c - 2)] = formatTime(t.h, t.m) + ' (' + c + ' cycles, ' + (c * 1.5) + ' hrs)';
        }
      }
      return results;
    }
  };
})();
