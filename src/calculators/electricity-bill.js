(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['electricity-bill'] = {
    calculate: function (inputs) {
      var units = parseFloat(inputs.units) || 0;
      var rate = parseFloat(inputs.ratePerUnit) || 0;
      var fixed = parseFloat(inputs.fixedCharges) || 0;
      var energyCharge = units * rate;
      return {
        energyCharge: Math.round(energyCharge),
        fixedCharge: Math.round(fixed),
        totalBill: Math.round(energyCharge + fixed)
      };
    }
  };
})();
