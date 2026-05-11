(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['gold-price'] = {
    calculate: function (inputs) {
      var weight = parseFloat(inputs.weight) || 0;
      var price24k = parseFloat(inputs.pricePerGram) || 0;
      var purity = parseInt(inputs.purity, 10) || 24;
      var making = parseFloat(inputs.makingCharges) / 100 || 0;
      var purityFactor = purity / 24;
      var goldValue = weight * price24k * purityFactor;
      var makingCost = goldValue * making;
      return {
        goldValue: Math.round(goldValue),
        makingCost: Math.round(makingCost),
        totalPrice: Math.round(goldValue + makingCost)
      };
    }
  };
})();
