(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.percentage = { calculate: function (inputs) {
    var v1 = parseFloat(inputs.value1);
    var v2 = parseFloat(inputs.value2);
    var percentOf = v1 * v2 / 100;
    var whatPercent = v2 !== 0 ? (v1 / v2) * 100 : 0;
    var percentChange = v1 !== 0 ? ((v2 - v1) / v1) * 100 : 0;
    return {
      percentOf: parseFloat(percentOf.toFixed(4)),
      whatPercent: parseFloat(whatPercent.toFixed(4)),
      percentChange: parseFloat(percentChange.toFixed(4))
    };
  }};
})();
