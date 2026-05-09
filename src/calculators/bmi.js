(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.bmi = { calculate: function (inputs) {
    var weight = parseFloat(inputs.weight);
    var heightCm = parseFloat(inputs.height);
    var heightM = heightCm / 100;
    var bmi = weight / (heightM * heightM);
    var category;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    var lowWeight = 18.5 * heightM * heightM;
    var highWeight = 24.9 * heightM * heightM;
    var healthyRange = lowWeight.toFixed(1) + ' – ' + highWeight.toFixed(1) + ' kg';
    return {
      bmi: parseFloat(bmi.toFixed(1)),
      category: category,
      healthyRange: healthyRange
    };
  }};
})();
