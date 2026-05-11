(function () {
  'use strict';
  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators['due-date'] = {
    calculate: function (inputs) {
      var lmp = inputs.lmpDate;
      if (!lmp) return { dueDate: 'Please enter a date', currentWeek: '-', trimester: '-', daysRemaining: '-' };
      var lmpDate = new Date(lmp);
      var due = new Date(lmpDate.getTime() + 280 * 86400000);
      var today = new Date();
      var daysSinceLMP = Math.floor((today - lmpDate) / 86400000);
      var currentWeek = Math.floor(daysSinceLMP / 7);
      var daysRemaining = Math.max(0, Math.floor((due - today) / 86400000));
      var trimester = currentWeek < 13 ? '1st Trimester' : currentWeek < 27 ? '2nd Trimester' : '3rd Trimester';
      if (currentWeek < 0) { currentWeek = 0; trimester = 'Not yet started'; }
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var dueDateStr = months[due.getMonth()] + ' ' + due.getDate() + ', ' + due.getFullYear();
      return {
        dueDate: dueDateStr,
        currentWeek: 'Week ' + currentWeek,
        trimester: trimester,
        daysRemaining: daysRemaining + ' days'
      };
    }
  };
})();
