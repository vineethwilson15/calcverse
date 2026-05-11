(function () {
  'use strict';
  var pyth = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };

  function reduce(n) {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      var s = 0; var str = String(n);
      for (var i = 0; i < str.length; i++) s += parseInt(str[i], 10);
      n = s;
    }
    return n;
  }

  function nameValue(name) {
    var sum = 0;
    var lower = name.toLowerCase();
    for (var i = 0; i < lower.length; i++) {
      if (pyth[lower[i]]) sum += pyth[lower[i]];
    }
    return reduce(sum);
  }

  var meanings = {
    1: 'The Leader — Independent, ambitious, and pioneering.',
    2: 'The Mediator — Diplomatic, sensitive, and cooperative.',
    3: 'The Communicator — Creative, expressive, and sociable.',
    4: 'The Builder — Practical, disciplined, and hardworking.',
    5: 'The Adventurer — Freedom-loving, versatile, and curious.',
    6: 'The Nurturer — Responsible, caring, and family-oriented.',
    7: 'The Seeker — Analytical, introspective, and spiritual.',
    8: 'The Powerhouse — Ambitious, authoritative, and goal-driven.',
    9: 'The Humanitarian — Compassionate, generous, and idealistic.',
    11: 'Master Number — Intuitive, inspirational, and visionary.',
    22: 'Master Number — Master builder, practical idealist.',
    33: 'Master Number — Master teacher, selfless and devoted.'
  };

  window.CalcVerse = window.CalcVerse || { calculators: {} };
  window.CalcVerse.calculators.numerology = {
    calculate: function (inputs) {
      var name = (inputs.fullName || '').trim();
      if (!name) return { lifePath: 0, meaning: 'Please enter your name.' };
      var num = nameValue(name);
      return {
        lifePath: num,
        meaning: meanings[num] || 'Number ' + num
      };
    }
  };
})();
