(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.epf = {
    calculate: function (inputs) {
      var salary = parseFloat(inputs.salary) || 0;
      var empPct = parseFloat(inputs.employeePercent) / 100;
      var erPct = parseFloat(inputs.employerPercent) / 100;
      var rate = parseFloat(inputs.rate) / 100 / 12;
      var years = parseInt(inputs.years, 10) || 25;
      var months = years * 12;
      var empMonthly = salary * empPct;
      var erMonthly = salary * erPct;
      var monthly = empMonthly + erMonthly;
      var balance = 0;
      for (var m = 0; m < months; m++) {
        balance = (balance + monthly) * (1 + rate);
      }
      var totalEmployee = Math.round(empMonthly * months);
      var totalEmployer = Math.round(erMonthly * months);
      var totalInterest = Math.round(balance - totalEmployee - totalEmployer);
      return {
        totalCorpus: Math.round(balance),
        totalEmployee: totalEmployee,
        totalEmployer: totalEmployer,
        totalInterest: totalInterest
      };
    }
  };
})();
