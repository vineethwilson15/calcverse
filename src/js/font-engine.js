(function () {
  'use strict';

  window.Fontify = window.Fontify || {};

  function transformRange(text, ranges) {
    var result = [];
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      var code = chars[i].codePointAt(0);
      if (code >= 65 && code <= 90 && ranges.upper) {
        result.push(String.fromCodePoint(ranges.upper + (code - 65)));
      } else if (code >= 97 && code <= 122 && ranges.lower) {
        result.push(String.fromCodePoint(ranges.lower + (code - 97)));
      } else if (code >= 48 && code <= 57 && ranges.digits) {
        result.push(String.fromCodePoint(ranges.digits + (code - 48)));
      } else {
        result.push(chars[i]);
      }
    }
    return result.join('');
  }

  function transformCombining(text, combiningChar) {
    var result = [];
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') {
        result.push(' ');
      } else {
        result.push(chars[i] + String.fromCodePoint(combiningChar));
      }
    }
    return result.join('');
  }

  function transformTable(text, table) {
    var result = [];
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      result.push(table[chars[i]] || chars[i]);
    }
    return result.join('');
  }

  function transformTableReverse(text, table) {
    var result = [];
    var chars = Array.from(text);
    for (var i = chars.length - 1; i >= 0; i--) {
      result.push(table[chars[i]] || chars[i]);
    }
    return result.join('');
  }

  function transformReverse(text) {
    return Array.from(text).reverse().join('');
  }

  function transformSpaced(text) {
    return Array.from(text).join(' ');
  }

  function transformSeparator(text, separator) {
    var result = [];
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') {
        result.push(' ');
      } else {
        result.push(chars[i]);
        if (i < chars.length - 1 && chars[i + 1] !== ' ') {
          result.push(separator);
        }
      }
    }
    return result.join('');
  }

  function transformWrap(text, left, right) {
    var result = [];
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') {
        result.push(' ');
      } else {
        result.push(left + chars[i] + right);
      }
    }
    return result.join('');
  }

  function transformZalgo(text, intensity) {
    var zalgoUp = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306',
      '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342',
      '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c',
      '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314',
      '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368',
      '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u0346'];
    var zalgoDown = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e',
      '\u031f', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b',
      '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333',
      '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349',
      '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a'];
    var zalgoMid = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322',
      '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d',
      '\u035e', '\u035f', '\u0360', '\u0362', '\u0338'];

    var counts = { low: 2, medium: 5, high: 10 };
    var maxMarks = counts[intensity] || counts.medium;

    var result = [];
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') {
        result.push(' ');
        continue;
      }
      result.push(chars[i]);
      var numUp = Math.floor(Math.random() * maxMarks) + 1;
      var numMid = Math.floor(Math.random() * Math.ceil(maxMarks / 2));
      var numDown = Math.floor(Math.random() * maxMarks) + 1;
      for (var j = 0; j < numUp; j++) {
        result.push(zalgoUp[Math.floor(Math.random() * zalgoUp.length)]);
      }
      for (var j = 0; j < numMid; j++) {
        result.push(zalgoMid[Math.floor(Math.random() * zalgoMid.length)]);
      }
      for (var j = 0; j < numDown; j++) {
        result.push(zalgoDown[Math.floor(Math.random() * zalgoDown.length)]);
      }
    }
    return result.join('');
  }

  function transformVaporwave(text) {
    return transformRange(text, { upper: 65313, lower: 65345, digits: 65296 });
  }

  function transformMorse(text) {
    var morseMap = {
      'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
      'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
      'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
      's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
      'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---',
      '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
      '8': '---..', '9': '----.', ' ': '/'
    };
    return text.toLowerCase().split('').map(function (c) {
      return morseMap[c] || c;
    }).join(' ');
  }

  function transformBinary(text) {
    return Array.from(text).map(function (c) {
      return c.codePointAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  }

  function transformSarcasm(text) {
    var result = [];
    var chars = Array.from(text);
    var upper = false;
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') {
        result.push(' ');
      } else {
        result.push(upper ? chars[i].toUpperCase() : chars[i].toLowerCase());
        upper = !upper;
      }
    }
    return result.join('');
  }

  function transformRepeat(text, count) {
    var result = '';
    for (var i = 0; i < (count || 3); i++) {
      result += text;
      if (i < count - 1) result += '\n';
    }
    return result;
  }

  function transformInvisible() {
    return '\u200B\u200C\u200D\u2060\uFEFF';
  }

  function transformSpoiler(text) {
    return '||' + text + '||';
  }

  function transformHashtag(text) {
    return text.split(/\s+/).map(function (word) {
      return word ? '#' + word : '';
    }).join(' ');
  }

  window.Fontify.transform = function (text, fontData) {
    if (!text) return '';

    var method = fontData.method;

    if (method === 'range') {
      return transformRange(text, fontData.ranges);
    } else if (method === 'combining') {
      return transformCombining(text, fontData.combiningChar);
    } else if (method === 'table') {
      return transformTable(text, fontData.table);
    } else if (method === 'table-reverse') {
      return transformTableReverse(text, fontData.table);
    } else if (method === 'reverse') {
      return transformReverse(text);
    } else if (method === 'spaced') {
      return transformSpaced(text);
    } else if (method === 'separator') {
      return transformSeparator(text, fontData.separator);
    } else if (method === 'wrap') {
      return transformWrap(text, fontData.wrapLeft, fontData.wrapRight);
    } else if (method === 'zalgo') {
      var intensity = (fontData.options && fontData.options.intensity) || 'medium';
      return transformZalgo(text, intensity);
    } else if (method === 'vaporwave') {
      return transformVaporwave(text);
    } else if (method === 'morse') {
      return transformMorse(text);
    } else if (method === 'binary') {
      return transformBinary(text);
    } else if (method === 'sarcasm') {
      return transformSarcasm(text);
    } else if (method === 'repeat') {
      var count = (fontData.options && fontData.options.count) || 3;
      return transformRepeat(text, count);
    } else if (method === 'invisible') {
      return transformInvisible();
    } else if (method === 'spoiler') {
      return transformSpoiler(text);
    } else if (method === 'hashtag') {
      return transformHashtag(text);
    } else if (method === 'tiny') {
      return transformTable(text, fontData.table);
    }

    return text;
  };

  // Auto-init: hook up textarea to output on font/tool pages
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('text-input');
    var output = document.getElementById('output-text');
    var fontData = window.__FONT_DATA__ || window.__TOOL_DATA__;

    if (!input || !output || !fontData) return;

    function update() {
      output.textContent = window.Fontify.transform(input.value, fontData);
    }

    input.addEventListener('input', update);
    update();
  });
})();
