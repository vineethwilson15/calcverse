(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['water-intake'] = {
    calculate: function (inputs) {
      var weight = parseFloat(inputs.weight) || 70;
      var activity = inputs.activity || 'moderate';
      var climate = inputs.climate || 'temperate';
      var base = weight * 0.033;
      var activityMult = { sedentary: 0.9, moderate: 1.0, active: 1.2, athlete: 1.4 };
      var climateMult = { cold: 0.9, temperate: 1.0, hot: 1.2 };
      var liters = base * (activityMult[activity] || 1) * (climateMult[climate] || 1);
      var glasses = Math.round(liters / 0.25);
      return {
        dailyIntake: liters.toFixed(1) + ' liters',
        glasses: glasses
      };
    }
  };
})();
