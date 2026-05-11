(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.nps = {
    calculate: function (inputs) {
      var monthly = parseFloat(inputs.monthly) || 0;
      var rate = parseFloat(inputs.rate) / 100 / 12;
      var years = parseInt(inputs.years, 10) || 25;
      var annuityPct = parseFloat(inputs.annuityPercent) / 100;
      var months = years * 12;
      var balance = 0;
      var chartData = [];
      var investedData = [];
      for (var m = 1; m <= months; m++) {
        balance = (balance + monthly) * (1 + rate);
        if (m % 12 === 0) {
          chartData.push({ label: 'Yr ' + (m / 12), value: Math.round(balance) });
          investedData.push({ label: 'Yr ' + (m / 12), value: monthly * m });
        }
      }
      var totalInvested = monthly * months;
      var annuityAmount = Math.round(balance * annuityPct);
      var lumpsumAmount = Math.round(balance * (1 - annuityPct));
      return {
        totalCorpus: Math.round(balance),
        totalInvested: Math.round(totalInvested),
        wealthGained: Math.round(balance - totalInvested),
        annuityAmount: annuityAmount,
        lumpsumAmount: lumpsumAmount,
        chartData: chartData,
        investedData: investedData
      };
    }
  };
})();
