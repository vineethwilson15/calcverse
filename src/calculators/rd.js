(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.rd = {
    calculate: function (inputs) {
      var monthly = parseFloat(inputs.monthly) || 0;
      var rate = parseFloat(inputs.rate) / 100;
      var months = parseInt(inputs.months, 10) || 12;
      var n = 4;
      var maturity = 0;
      for (var m = 1; m <= months; m++) {
        var remaining = (months - m) / 12;
        maturity += monthly * Math.pow(1 + rate / n, n * remaining);
      }
      var totalDeposited = monthly * months;
      return {
        maturityAmount: Math.round(maturity),
        totalDeposited: Math.round(totalDeposited),
        interestEarned: Math.round(maturity - totalDeposited)
      };
    }
  };
})();
