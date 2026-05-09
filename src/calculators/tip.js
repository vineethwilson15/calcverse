(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.tip = { calculate: function (inputs) {
    var bill = parseFloat(inputs.billAmount);
    var tipPct = parseFloat(inputs.tipPercent);
    var split = parseInt(inputs.splitCount, 10) || 1;
    var tipAmount = bill * tipPct / 100;
    var totalBill = bill + tipAmount;
    var perPerson = totalBill / split;
    return {
      tipAmount: Math.round(tipAmount),
      totalBill: Math.round(totalBill),
      perPerson: Math.round(perPerson)
    };
  }};
})();
