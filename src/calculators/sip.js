(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.sip = { calculate: function (inputs) {
    var P = parseFloat(inputs.monthlyInvestment);
    var annualReturn = parseFloat(inputs.expectedReturn);
    var years = parseInt(inputs.years, 10);
    var r = annualReturn / 12 / 100;
    var n = years * 12;
    var futureValue = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    var totalInvested = P * n;
    return {
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      wealthGained: Math.round(futureValue - totalInvested)
    };
  }};
})();
