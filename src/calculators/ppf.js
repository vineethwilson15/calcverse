(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.ppf = {
    calculate: function (inputs) {
      var yearly = parseFloat(inputs.yearly) || 0;
      var rate = parseFloat(inputs.rate) / 100;
      var years = parseInt(inputs.years, 10) || 15;
      var balance = 0;
      var chartData = [];
      var investedData = [];
      for (var y = 1; y <= years; y++) {
        balance = (balance + yearly) * (1 + rate);
        chartData.push({ label: 'Yr ' + y, value: Math.round(balance) });
        investedData.push({ label: 'Yr ' + y, value: yearly * y });
      }
      var totalDeposited = yearly * years;
      return {
        maturityValue: Math.round(balance),
        totalDeposited: Math.round(totalDeposited),
        interestEarned: Math.round(balance - totalDeposited),
        chartData: chartData,
        investedData: investedData
      };
    }
  };
})();
