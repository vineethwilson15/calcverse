(function () {
  'use strict';

  function calculateEMI(principal, annualRate, tenureMonths) {
    var monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
      var emi = principal / tenureMonths;
      return { emi: Math.round(emi), totalInterest: 0, totalPayment: Math.round(principal), principal: Math.round(principal) };
    }
    var pow = Math.pow(1 + monthlyRate, tenureMonths);
    var emi = principal * monthlyRate * pow / (pow - 1);
    var totalPayment = emi * tenureMonths;
    var totalInterest = totalPayment - principal;
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principal: Math.round(principal)
    };
  }

  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.emi = { calculate: function (inputs) {
    return calculateEMI(
      parseFloat(inputs.principal),
      parseFloat(inputs.rate),
      parseInt(inputs.tenure, 10)
    );
  }};
})();
