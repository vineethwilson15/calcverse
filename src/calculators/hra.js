(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.hra = {
    calculate: function (inputs) {
      var basic = parseFloat(inputs.basicSalary) || 0;
      var hraReceived = parseFloat(inputs.hra) || 0;
      var rent = parseFloat(inputs.rentPaid) || 0;
      var isMetro = inputs.metro === 'yes';
      var actualHRA = hraReceived;
      var salaryPct = isMetro ? basic * 0.50 : basic * 0.40;
      var rentMinusBasic = Math.max(0, rent - basic * 0.10);
      var exemption = Math.min(actualHRA, salaryPct, rentMinusBasic);
      var taxableHRA = hraReceived - exemption;
      return {
        exemption: Math.round(exemption),
        taxableHRA: Math.round(taxableHRA)
      };
    }
  };
})();
