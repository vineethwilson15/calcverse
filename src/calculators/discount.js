(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.discount = { calculate: function (inputs) {
    var original = parseFloat(inputs.originalPrice);
    var pct = parseFloat(inputs.discountPercent);
    var discountAmount = original * pct / 100;
    var finalPrice = original - discountAmount;
    return {
      discountAmount: Math.round(discountAmount),
      finalPrice: Math.round(finalPrice)
    };
  }};
})();
