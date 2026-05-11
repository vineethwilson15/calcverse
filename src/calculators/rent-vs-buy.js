(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['rent-vs-buy'] = {
    calculate: function (inputs) {
      var homePrice = parseFloat(inputs.homePrice) || 0;
      var downPct = parseFloat(inputs.downPayment) / 100;
      var loanRate = parseFloat(inputs.loanRate) / 100 / 12;
      var loanTerm = parseInt(inputs.loanTerm, 10) || 20;
      var rent = parseFloat(inputs.monthlyRent) || 0;
      var rentInc = parseFloat(inputs.rentIncrease) / 100;
      var appreciation = parseFloat(inputs.appreciation) / 100;
      var years = parseInt(inputs.years, 10) || 20;

      var downPayment = homePrice * downPct;
      var loanAmount = homePrice - downPayment;
      var loanMonths = loanTerm * 12;
      var emi = loanRate > 0 ? loanAmount * loanRate * Math.pow(1 + loanRate, loanMonths) / (Math.pow(1 + loanRate, loanMonths) - 1) : loanAmount / loanMonths;

      var buyData = [];
      var rentData = [];
      var cumBuy = downPayment;
      var cumRent = 0;
      var currentRent = rent;

      for (var y = 1; y <= years; y++) {
        cumBuy += emi * 12;
        cumRent += currentRent * 12;
        currentRent *= (1 + rentInc);
        buyData.push({ label: 'Yr ' + y, value: Math.round(cumBuy) });
        rentData.push({ label: 'Yr ' + y, value: Math.round(cumRent) });
      }

      var futureValue = homePrice * Math.pow(1 + appreciation, years);
      var netBuyCost = Math.round(cumBuy - futureValue);
      var verdict = cumRent > cumBuy - futureValue + downPayment ? 'Buying is more economical over ' + years + ' years.' : 'Renting is more economical over ' + years + ' years.';

      return {
        buyTotalCost: Math.round(cumBuy),
        rentTotalCost: Math.round(cumRent),
        netBuyCost: netBuyCost,
        propertyValue: Math.round(futureValue),
        verdict: verdict,
        chartData: buyData,
        investedData: rentData
      };
    }
  };
})();
