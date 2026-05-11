(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['fuel-cost'] = {
    calculate: function (inputs) {
      var distance = parseFloat(inputs.distance) || 0;
      var mileage = parseFloat(inputs.mileage) || 1;
      var price = parseFloat(inputs.fuelPrice) || 0;
      var fuelNeeded = distance / mileage;
      var totalCost = fuelNeeded * price;
      return {
        fuelNeeded: Math.round(fuelNeeded * 100) / 100,
        totalCost: Math.round(totalCost),
        costPerKm: Math.round(totalCost / (distance || 1) * 100) / 100
      };
    }
  };
})();
