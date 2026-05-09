(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.gst = { calculate: function (inputs) {
    var amount = parseFloat(inputs.amount);
    var rate = parseFloat(inputs.gstRate);
    var isInclusive = parseInt(inputs.isInclusive, 10) === 1;
    var baseAmount, gstAmount, totalAmount;
    if (isInclusive) {
      baseAmount = amount / (1 + rate / 100);
      gstAmount = amount - baseAmount;
      totalAmount = amount;
    } else {
      baseAmount = amount;
      gstAmount = amount * rate / 100;
      totalAmount = amount + gstAmount;
    }
    return {
      baseAmount: Math.round(baseAmount),
      gstAmount: Math.round(gstAmount),
      totalAmount: Math.round(totalAmount)
    };
  }};
})();
