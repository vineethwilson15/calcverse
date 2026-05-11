(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.fd = {
    calculate: function (inputs) {
      var principal = parseFloat(inputs.principal) || 0;
      var rate = parseFloat(inputs.rate) / 100;
      var years = parseFloat(inputs.years) || 1;
      var n = parseInt(inputs.compounding, 10) || 4;
      var maturity = principal * Math.pow(1 + rate / n, n * years);
      var interest = maturity - principal;
      return {
        maturityAmount: Math.round(maturity),
        interestEarned: Math.round(interest),
        principal: Math.round(principal)
      };
    }
  };
})();
