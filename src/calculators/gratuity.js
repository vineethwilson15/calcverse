(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.gratuity = {
    calculate: function (inputs) {
      var salary = parseFloat(inputs.salary) || 0;
      var years = parseFloat(inputs.years) || 0;
      var gratuity = (15 * salary * years) / 26;
      return { gratuity: Math.round(gratuity) };
    }
  };
})();
