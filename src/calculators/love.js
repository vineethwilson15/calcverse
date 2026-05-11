(function () {
  'use strict';
  function hashNames(a, b) {
    var s = (a + b).toLowerCase().replace(/[^a-z]/g, '');
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h % 100) + 1;
  }

  function getMessage(score) {
    if (score >= 90) return 'You are a perfect match!';
    if (score >= 75) return 'Great compatibility! You complement each other well.';
    if (score >= 50) return 'Good potential! With effort, this could work beautifully.';
    if (score >= 25) return 'There might be some challenges, but love conquers all!';
    return 'Opposites attract! Your differences could make things interesting.';
  }

  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.love = {
    calculate: function (inputs) {
      var n1 = (inputs.name1 || '').trim();
      var n2 = (inputs.name2 || '').trim();
      if (!n1 || !n2) return { score: 0, message: 'Please enter both names.' };
      var score = hashNames(n1, n2);
      return { score: score, message: getMessage(score) };
    }
  };
})();
