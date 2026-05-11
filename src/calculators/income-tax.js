(function () {
  'use strict';

  var newSlabs = [
    { min: 0, max: 400000, rate: 0 },
    { min: 400000, max: 800000, rate: 0.05 },
    { min: 800000, max: 1200000, rate: 0.10 },
    { min: 1200000, max: 1600000, rate: 0.15 },
    { min: 1600000, max: 2000000, rate: 0.20 },
    { min: 2000000, max: 2400000, rate: 0.25 },
    { min: 2400000, max: Infinity, rate: 0.30 }
  ];

  var oldSlabsBelow60 = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ];

  var oldSlabs60to80 = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ];

  var oldSlabsAbove80 = [
    { min: 0, max: 500000, rate: 0 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ];

  function calcTax(income, slabs) {
    var tax = 0;
    for (var i = 0; i < slabs.length; i++) {
      var s = slabs[i];
      if (income <= s.min) break;
      var taxable = Math.min(income, s.max) - s.min;
      tax += taxable * s.rate;
    }
    return tax;
  }

  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['income-tax'] = {
    calculate: function (inputs) {
      var income = parseFloat(inputs.income) || 0;
      var deductions = parseFloat(inputs.deductions) || 0;
      var regime = inputs.regime || 'new';
      var age = inputs.ageGroup || 'below60';

      var newTaxableIncome = Math.max(0, income - 75000);
      var newTax = calcTax(newTaxableIncome, newSlabs);
      if (newTaxableIncome <= 1200000) {
        newTax = 0;
      } else {
        var marginalRelief = newTaxableIncome - 1200000;
        newTax = Math.min(newTax, marginalRelief);
      }

      var oldSlabs = oldSlabsBelow60;
      if (age === '60to80') oldSlabs = oldSlabs60to80;
      else if (age === 'above80') oldSlabs = oldSlabsAbove80;
      var oldTaxableIncome = Math.max(0, income - deductions);
      var oldTax = calcTax(oldTaxableIncome, oldSlabs);
      if (oldTaxableIncome <= 500000) oldTax = 0;

      var selectedTax = regime === 'new' ? newTax : oldTax;
      var cess = selectedTax * 0.04;

      return {
        taxPayable: Math.round(selectedTax),
        cess: Math.round(cess),
        totalTax: Math.round(selectedTax + cess),
        effectiveRate: income > 0 ? ((selectedTax + cess) / income * 100).toFixed(2) + '%' : '0.00%',
        newRegimeTax: Math.round(newTax + newTax * 0.04),
        oldRegimeTax: Math.round(oldTax + oldTax * 0.04)
      };
    }
  };
})();
