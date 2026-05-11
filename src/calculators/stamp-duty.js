(function () {
  'use strict';

  var rates = {
    maharashtra:  { residential: { stamp: 5, reg: 1 }, commercial: { stamp: 6, reg: 1 } },
    karnataka:    { residential: { stamp: 5, reg: 1 }, commercial: { stamp: 5, reg: 1 } },
    delhi:        { residential: { stamp: 6, reg: 1 }, commercial: { stamp: 6, reg: 1 } },
    tamilnadu:    { residential: { stamp: 7, reg: 1 }, commercial: { stamp: 7, reg: 1 } },
    up:           { residential: { stamp: 7, reg: 1 }, commercial: { stamp: 7, reg: 1 } },
    gujarat:      { residential: { stamp: 4.9, reg: 1 }, commercial: { stamp: 4.9, reg: 1 } },
    rajasthan:    { residential: { stamp: 6, reg: 1 }, commercial: { stamp: 6, reg: 1 } },
    telangana:    { residential: { stamp: 5, reg: 0.5 }, commercial: { stamp: 6, reg: 0.5 } },
    kerala:       { residential: { stamp: 8, reg: 2 }, commercial: { stamp: 8, reg: 2 } },
    westbengal:   { residential: { stamp: 6, reg: 1 }, commercial: { stamp: 7, reg: 1 } }
  };

  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['stamp-duty'] = {
    calculate: function (inputs) {
      var value = parseFloat(inputs.propertyValue) || 0;
      var state = inputs.state || 'maharashtra';
      var type = inputs.propertyType || 'residential';
      var r = (rates[state] && rates[state][type]) || { stamp: 5, reg: 1 };
      var stampDuty = Math.round(value * r.stamp / 100);
      var registration = Math.round(value * r.reg / 100);
      return {
        stampDuty: stampDuty,
        registrationCharge: registration,
        totalCost: stampDuty + registration
      };
    }
  };
})();
