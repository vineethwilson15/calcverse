(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.loan = { calculate: function (inputs) {
    var P = parseFloat(inputs.amount);
    var annualRate = parseFloat(inputs.rate);
    var years = parseInt(inputs.term, 10);
    var r = annualRate / 12 / 100;
    var n = years * 12;
    var payment;
    if (r === 0) {
      payment = P / n;
    } else {
      payment = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }
    var totalCost = payment * n;
    var totalInterest = totalCost - P;
    return {
      monthlyPayment: Math.round(payment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      amount: Math.round(P)
    };
  }};
})();
