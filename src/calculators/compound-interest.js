(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['compound-interest'] = { calculate: function (inputs) {
    var P = parseFloat(inputs.principal);
    var r = parseFloat(inputs.rate) / 100;
    var t = parseFloat(inputs.time);
    var n = parseInt(inputs.frequency, 10) || 12;
    var A = P * Math.pow(1 + r / n, n * t);
    var interest = A - P;
    return {
      finalAmount: Math.round(A),
      interestEarned: Math.round(interest),
      principal: Math.round(P)
    };
  }};
})();
