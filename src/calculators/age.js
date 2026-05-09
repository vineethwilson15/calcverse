(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.age = { calculate: function (inputs) {
    var birth = new Date(inputs.birthDate);
    var today = new Date();
    var years = today.getFullYear() - birth.getFullYear();
    var months = today.getMonth() - birth.getMonth();
    var days = today.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      var prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    var totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    var nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday <= today) nextBday.setFullYear(nextBday.getFullYear() + 1);
    var daysUntil = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
    return {
      ageString: years + ' years, ' + months + ' months, ' + days + ' days',
      totalDays: totalDays,
      nextBirthday: daysUntil + ' days'
    };
  }};
})();
