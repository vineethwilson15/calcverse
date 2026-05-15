const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://calcverse-tools.netlify.app';
const SRC_DIR = path.join(__dirname, 'src');
const DATA_DIR = path.join(__dirname, 'data');
const DIST_DIR = path.join(__dirname, 'dist');
const YEAR = new Date().getFullYear().toString();

function clean() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function readPartials() {
  var partialsDir = path.join(SRC_DIR, 'templates', 'partials');
  var partials = {};
  if (!fs.existsSync(partialsDir)) return partials;
  var files = fs.readdirSync(partialsDir);
  for (var i = 0; i < files.length; i++) {
    if (!files[i].endsWith('.html')) continue;
    var name = files[i].replace('.html', '').replace(/-/g, '_').toUpperCase();
    partials[name] = readFile(path.join(partialsDir, files[i]));
  }
  return partials;
}

function readJSON(filePath) {
  return JSON.parse(readFile(filePath));
}

function render(template, tokens) {
  var result = template;
  for (var key in tokens) {
    var placeholder = '{{' + key + '}}';
    while (result.includes(placeholder)) {
      result = result.replace(placeholder, tokens[key]);
    }
  }
  return result;
}

function copyDir(src, dest) {
  ensureDir(dest);
  var entries = fs.readdirSync(src, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var srcPath = path.join(src, entries[i].name);
    var destPath = path.join(dest, entries[i].name);
    if (entries[i].isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildInputHTML(inputs) {
  var html = '';
  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];

    html += '<div class="form-group">\n';
    html += '  <label class="form-label" for="input-' + inp.id + '">' + inp.label + '</label>\n';

    if (inp.type === 'select') {
      html += '  <select class="form-input form-select" id="input-' + inp.id + '" name="' + inp.id + '">\n';
      var opts = inp.options || [];
      for (var j = 0; j < opts.length; j++) {
        var sel = (String(opts[j].value) === String(inp.default)) ? ' selected' : '';
        html += '    <option value="' + opts[j].value + '"' + sel + '>' + opts[j].label + '</option>\n';
      }
      html += '  </select>\n';
      html += '</div>\n';
      continue;
    }

    if (inp.type === 'text') {
      html += '  <input class="form-input" type="text" id="input-' + inp.id + '" name="' + inp.id + '"';
      if (inp.placeholder) html += ' placeholder="' + inp.placeholder + '"';
      if (inp.default !== undefined) html += ' value="' + inp.default + '"';
      html += '>\n</div>\n';
      continue;
    }

    var inputType = (inp.type === 'currency' || inp.type === 'percent') ? 'number' : inp.type;
    var suffix = '';
    if (inp.type === 'percent') suffix = '%';

    if (suffix) {
      html += '  <div class="input-group">\n';
    }
    html += '  <input class="form-input" type="' + inputType + '" id="input-' + inp.id + '" name="' + inp.id + '"';
    if (inp.default !== undefined) html += ' value="' + inp.default + '"';
    if (inp.min !== undefined) html += ' min="' + inp.min + '"';
    if (inp.max !== undefined) html += ' max="' + inp.max + '"';
    if (inp.step !== undefined) html += ' step="' + inp.step + '"';
    html += ' required>\n';
    if (suffix) {
      html += '    <span class="input-suffix">' + suffix + '</span>\n';
      html += '  </div>\n';
    }
    html += '</div>\n';
  }
  return html;
}

function buildStructuredData(calc) {
  var sd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.title,
    description: calc.description,
    url: SITE_URL + '/calculator/' + calc.id + '/',
    applicationCategory: calc.category === 'financial' ? 'FinanceApplication' : 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    browserRequirements: 'Requires JavaScript'
  };
  return '<script type="application/ld+json">' + JSON.stringify(sd) + '</script>';
}

function buildBreadcrumb(segments) {
  var html = '<a href="/">Home</a>';
  for (var i = 0; i < segments.length; i++) {
    html += '<span class="breadcrumb-sep">›</span>';
    if (segments[i].url) {
      html += '<a href="' + segments[i].url + '">' + segments[i].label + '</a>';
    } else {
      html += '<span>' + segments[i].label + '</span>';
    }
  }
  return html;
}

function buildBreadcrumbSD(segments) {
  var items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }];
  for (var i = 0; i < segments.length; i++) {
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: segments[i].label,
      item: segments[i].url ? SITE_URL + segments[i].url : undefined
    });
  }
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function loadFAQs() {
  var faqPath = path.join(DATA_DIR, 'faq.json');
  if (!fs.existsSync(faqPath)) return {};
  return readJSON(faqPath);
}

function buildFAQHTML(calcId, faqs) {
  var items = faqs[calcId];
  if (!items || items.length === 0) return '';
  var html = '<section class="faq-section">\n<h2>Frequently Asked Questions</h2>\n';
  for (var i = 0; i < items.length; i++) {
    html += '<details class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n';
    html += '<summary itemprop="name">' + items[i].question + '</summary>\n';
    html += '<div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n';
    html += '<p itemprop="text">' + items[i].answer + '</p>\n</div>\n</details>\n';
  }
  html += '</section>';
  return html;
}

function buildFAQSD(calcId, faqs) {
  var items = faqs[calcId];
  if (!items || items.length === 0) return '';
  var sd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(function (item) {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      };
    })
  };
  return '\n<script type="application/ld+json">' + JSON.stringify(sd) + '</script>';
}

function buildRelatedHTML(calc, allCalcs) {
  var related = calc.relatedCalculators || [];
  if (related.length === 0) return '';
  var html = '<section class="related-section">\n<h2>Related Calculators</h2>\n<div class="related-grid">\n';
  for (var i = 0; i < related.length; i++) {
    var rel = allCalcs.find(function (c) { return c.id === related[i]; });
    if (!rel) continue;
    html += '<a href="/calculator/' + rel.id + '/" class="card card-link related-card">';
    html += '<h3>' + rel.title + '</h3>';
    html += '<p>' + rel.description + '</p>';
    html += '</a>\n';
  }
  html += '</div>\n</section>';
  return html;
}

function categoryLabel(cat) {
  var labels = {
    financial: 'Financial',
    health: 'Health',
    math: 'Math',
    everyday: 'Everyday',
    fun: 'Fun'
  };
  return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

function buildCalculatorPages(partials) {
  var calcsPath = path.join(DATA_DIR, 'calculators.json');
  if (!fs.existsSync(calcsPath)) return [];
  var calcs = readJSON(calcsPath);
  var templatePath = path.join(SRC_DIR, 'templates', 'calculator-page.html');
  if (!fs.existsSync(templatePath)) return [];
  var template = readFile(templatePath);
  var faqs = loadFAQs();
  var urls = [];

  for (var i = 0; i < calcs.length; i++) {
    var calc = calcs[i];
    var catLabel = categoryLabel(calc.category);
    var breadcrumbSegments = [
      { label: catLabel, url: '/category/' + calc.category + '/' },
      { label: calc.title }
    ];

    var chartAttr = '';
    if (calc.hasChart && calc.chartConfig) {
      chartAttr = " data-chart='" + JSON.stringify(calc.chartConfig).replace(/'/g, '&#39;') + "'";
    }

    var formAttrs = 'data-calculator="' + calc.id + '" data-outputs=\'' + JSON.stringify(calc.outputs).replace(/'/g, '&#39;') + "'" + chartAttr;

    var tokens = {
      HEAD: render(partials.HEAD || '', {
        PAGE_TITLE: calc.title,
        META_DESCRIPTION: calc.description,
        CANONICAL_URL: SITE_URL + '/calculator/' + calc.id + '/',
        OG_TITLE: calc.title + ' — Free Online Calculator',
        OG_DESCRIPTION: calc.description,
        EXTRA_CSS: '',
        OG_IMAGE: SITE_URL + '/assets/og-image.png',
        LANG: 'en'
      }),      HEADER: partials.HEADER || '',
      FOOTER: render(partials.FOOTER || '', { YEAR: YEAR }),
      CALC_TITLE: calc.title,
      CALC_DESCRIPTION: calc.description,
      CALC_ID: calc.id,
      CALC_INPUTS: buildInputHTML(calc.inputs),
      BREADCRUMB: buildBreadcrumb(breadcrumbSegments),
      AD_SLOT: partials.AD_SLOT || '',
      FAQ_SECTION: buildFAQHTML(calc.id, faqs),
      RELATED: buildRelatedHTML(calc, calcs),
      CALC_EXPLANATION: calc.explanation || '',
      STRUCTURED_DATA: buildStructuredData(calc) +
        '\n<script type="application/ld+json">' + JSON.stringify(buildBreadcrumbSD(breadcrumbSegments)) + '</script>' +
        buildFAQSD(calc.id, faqs)
    };

    var html = render(template, tokens);

    html = html.replace(
      'id="calc-form" novalidate',
      'id="calc-form" ' + formAttrs + ' novalidate'
    );

    var outDir = path.join(DIST_DIR, 'calculator', calc.id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    urls.push({ url: '/calculator/' + calc.id + '/', priority: calc.priority || 0.8 });
  }

  return urls;
}

function buildConverterPages(partials) {
  var convPath = path.join(DATA_DIR, 'converters.json');
  if (!fs.existsSync(convPath)) return [];
  var templatePath = path.join(SRC_DIR, 'templates', 'converter-page.html');
  if (!fs.existsSync(templatePath)) return [];
  var converters = readJSON(convPath);
  var template = readFile(templatePath);
  var urls = [];

  var categories = Object.keys(converters);
  for (var c = 0; c < categories.length; c++) {
    var catKey = categories[c];
    var cat = converters[catKey];
    var units = cat.units;

    for (var i = 0; i < units.length; i++) {
      for (var j = 0; j < units.length; j++) {
        if (i === j) continue;
        var from = units[i];
        var to = units[j];
        var slug = from.id + '-to-' + to.id;
        var title = from.label + ' to ' + to.label + ' Converter';
        var description = 'Convert ' + from.label + ' (' + from.symbol + ') to ' + to.label + ' (' + to.symbol + '). Free online ' + cat.label.toLowerCase() + ' converter with instant results.';

        var conversionData = {
          fromId: from.id, toId: to.id,
          fromLabel: from.label, toLabel: to.label,
          fromSymbol: from.symbol, toSymbol: to.symbol,
          category: catKey, categoryLabel: cat.label
        };

        if (from.toBase !== undefined && to.toBase !== undefined) {
          conversionData.factor = from.toBase / to.toBase;
          conversionData.type = 'factor';
        } else {
          conversionData.fromConvert = from.convert || (from.toBase !== undefined ? { toBase: 'x * ' + from.toBase, fromBase: 'x / ' + from.toBase } : null);
          conversionData.toConvert = to.convert || (to.toBase !== undefined ? { toBase: 'x * ' + to.toBase, fromBase: 'x / ' + to.toBase } : null);
          conversionData.type = 'formula';
        }

        var tableRows = buildConversionTable(from, to, conversionData);

        var formulaText = '';
        if (conversionData.type === 'factor') {
          var factor = conversionData.factor;
          var display = factor >= 0.001 && factor < 1000000 ? factor.toPrecision(6) : factor.toExponential(4);
          formulaText = '<p class="formula">1 ' + from.symbol + ' = ' + display + ' ' + to.symbol + '</p>';
          formulaText += '<p>Multiply the ' + from.label.toLowerCase() + ' value by ' + display + ' to convert to ' + to.label.toLowerCase() + '.</p>';
        } else {
          formulaText = '<p>This conversion uses a specific formula rather than a simple multiplication factor.</p>';
        }

        var relatedLinks = buildRelatedConverters(units, from, to, catKey);

        var breadcrumbSegments = [
          { label: cat.label, url: '/category/' + catKey + '/' },
          { label: from.label + ' to ' + to.label }
        ];

        var tokens = {
          HEAD: render(partials.HEAD || '', {
            PAGE_TITLE: from.label + ' to ' + to.label,
            META_DESCRIPTION: description,
            CANONICAL_URL: SITE_URL + '/convert/' + slug + '/',
            OG_TITLE: title,
            OG_DESCRIPTION: description,
            EXTRA_CSS: '<link rel="stylesheet" href="/css/converter.css">',
            OG_IMAGE: SITE_URL + '/assets/og-image.png',
            LANG: 'en'
          }),
          HEADER: partials.HEADER || '',
          FOOTER: render(partials.FOOTER || '', { YEAR: YEAR }),
          CONVERTER_TITLE: title,
          FROM_UNIT: from.id,
          TO_UNIT: to.id,
          FROM_LABEL: from.label,
          TO_LABEL: to.label,
          FROM_SYMBOL: from.symbol,
          TO_SYMBOL: to.symbol,
          CATEGORY: cat.label,
          CATEGORY_SLUG: catKey,
          CONVERSION_DATA: JSON.stringify(conversionData).replace(/</g, '\\u003c'),
          CONVERSION_TABLE: tableRows,
          FORMULA_EXPLANATION: formulaText,
          RELATED_CONVERTERS: relatedLinks,
          BREADCRUMB: buildBreadcrumb(breadcrumbSegments),
          AD_SLOT: partials.AD_SLOT || '',
          STRUCTURED_DATA: '<script type="application/ld+json">' + JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: title,
            description: description,
            url: SITE_URL + '/convert/' + slug + '/',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
          }) + '</script>'
        };

        var html = render(template, tokens);

        var outDir = path.join(DIST_DIR, 'convert', slug);
        ensureDir(outDir);
        fs.writeFileSync(path.join(outDir, 'index.html'), html);
        urls.push({ url: '/convert/' + slug + '/', priority: 0.6 });
      }
    }
  }

  return urls;
}

function convertValue(value, from, to, conversionData) {
  if (conversionData.type === 'factor') {
    return value * conversionData.factor;
  }
  var baseValue = value;
  if (from.convert && from.convert.toBase) {
    baseValue = evalFormula(from.convert.toBase, value);
  } else if (from.toBase !== undefined) {
    baseValue = value * from.toBase;
  }
  if (to.convert && to.convert.fromBase) {
    return evalFormula(to.convert.fromBase, baseValue);
  } else if (to.toBase !== undefined) {
    return baseValue / to.toBase;
  }
  return value;
}

function evalFormula(formula, x) {
  return Function('x', 'return ' + formula)(x);
}

function buildConversionTable(from, to, conversionData) {
  var sampleValues = [1, 2, 5, 10, 20, 50, 100, 500, 1000];
  var rows = '';
  for (var i = 0; i < sampleValues.length; i++) {
    var val = sampleValues[i];
    var converted;
    if (conversionData.type === 'factor') {
      converted = val * conversionData.factor;
    } else {
      converted = convertValue(val, from, to, conversionData);
    }
    var display = converted >= 0.001 && Math.abs(converted) < 1000000
      ? parseFloat(converted.toPrecision(6))
      : converted.toExponential(4);
    rows += '<tr><td>' + val + ' ' + from.symbol + '</td><td>' + display + ' ' + to.symbol + '</td></tr>\n';
  }
  return rows;
}

function buildRelatedConverters(units, fromUnit, toUnit, catKey) {
  var links = '';
  var count = 0;
  for (var i = 0; i < units.length && count < 6; i++) {
    if (units[i].id === fromUnit.id) continue;
    var slug = fromUnit.id + '-to-' + units[i].id;
    if (units[i].id === toUnit.id) continue;
    links += '<a href="/convert/' + slug + '/" class="card card-link related-card"><h3>' + fromUnit.label + ' to ' + units[i].label + '</h3><p>' + fromUnit.symbol + ' → ' + units[i].symbol + '</p></a>';
    count++;
  }
  return links;
}

function buildCategoryPages(partials) {
  var convPath = path.join(DATA_DIR, 'converters.json');
  if (!fs.existsSync(convPath)) return [];
  var templatePath = path.join(SRC_DIR, 'templates', 'category-page.html');
  if (!fs.existsSync(templatePath)) return [];
  var converters = readJSON(convPath);
  var template = readFile(templatePath);
  var urls = [];

  var categories = Object.keys(converters);
  for (var c = 0; c < categories.length; c++) {
    var catKey = categories[c];
    var cat = converters[catKey];
    var units = cat.units;

    var cards = '';
    for (var i = 0; i < units.length; i++) {
      for (var j = 0; j < units.length; j++) {
        if (i === j) continue;
        var slug = units[i].id + '-to-' + units[j].id;
        cards += '<a href="/convert/' + slug + '/" class="card card-link converter-card">';
        cards += '<h3>' + units[i].label + ' to ' + units[j].label + '</h3>';
        cards += '<p>' + units[i].symbol + ' → ' + units[j].symbol + '</p>';
        cards += '</a>\n';
      }
    }

    var breadcrumbSegments = [{ label: cat.label }];

    var tokens = {
      HEAD: render(partials.HEAD || '', {
        PAGE_TITLE: cat.label + ' Converter',
        META_DESCRIPTION: 'Convert between ' + cat.label.toLowerCase() + ' units. Free online ' + cat.label.toLowerCase() + ' converter with instant results.',
        CANONICAL_URL: SITE_URL + '/category/' + catKey + '/',
        OG_TITLE: cat.label + ' Unit Converter',
        OG_DESCRIPTION: 'Convert between ' + cat.label.toLowerCase() + ' units online. Fast, free, no signup.',
        EXTRA_CSS: '<link rel="stylesheet" href="/css/converter.css">',
        OG_IMAGE: SITE_URL + '/assets/og-image.png',
        LANG: 'en'
      }),
      HEADER: partials.HEADER || '',
      FOOTER: render(partials.FOOTER || '', { YEAR: YEAR }),
      CATEGORY_TITLE: cat.label + ' Converter',
      CATEGORY_DESCRIPTION: 'Convert between ' + cat.label.toLowerCase() + ' units instantly. Choose a conversion below.',
      CATEGORY_CARDS: cards,
      BREADCRUMB: buildBreadcrumb(breadcrumbSegments),
      STRUCTURED_DATA: ''
    };

    var html = render(template, tokens);

    var outDir = path.join(DIST_DIR, 'category', catKey);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    urls.push({ url: '/category/' + catKey + '/', priority: 0.7 });
  }

  // Generate "converters" hub page listing all converter categories
  var hubCards = '';
  for (var h = 0; h < categories.length; h++) {
    var hKey = categories[h];
    var hCat = converters[hKey];
    var unitCount = hCat.units.length;
    var pairCount = unitCount * (unitCount - 1);
    hubCards += '<a href="/category/' + hKey + '/" class="card card-link converter-card">';
    hubCards += '<h3>' + hCat.label + '</h3>';
    hubCards += '<p>' + unitCount + ' units &middot; ' + pairCount + ' conversions</p>';
    hubCards += '</a>\n';
  }
  var hubTokens = {
    HEAD: render(partials.HEAD || '', {
      PAGE_TITLE: 'Unit Converters',
      META_DESCRIPTION: 'Free online unit converters for length, weight, temperature, area, volume, speed, data, and time.',
      CANONICAL_URL: SITE_URL + '/category/converters/',
      OG_TITLE: 'Unit Converters | CalcVerse',
      OG_DESCRIPTION: 'Convert between units of length, weight, temperature, and more. Free, fast, no signup.',
      EXTRA_CSS: '<link rel="stylesheet" href="/css/converter.css">',
      LANG: 'en'
    }),
    HEADER: partials.HEADER || '',
    FOOTER: render(partials.FOOTER || '', { YEAR: YEAR }),
    CATEGORY_TITLE: 'Unit Converters',
    CATEGORY_DESCRIPTION: 'Choose a category below to convert between units.',
    CATEGORY_CARDS: hubCards,
    BREADCRUMB: buildBreadcrumb([{ label: 'Converters' }]),
    STRUCTURED_DATA: ''
  };
  var hubHtml = render(template, hubTokens);
  var hubDir = path.join(DIST_DIR, 'category', 'converters');
  ensureDir(hubDir);
  fs.writeFileSync(path.join(hubDir, 'index.html'), hubHtml);
  urls.push({ url: '/category/converters/', priority: 0.8 });

  var calcsPath = path.join(DATA_DIR, 'calculators.json');
  if (fs.existsSync(calcsPath) && fs.existsSync(templatePath)) {
    var calcs = readJSON(calcsPath);
    var catMap = {};
    for (var i = 0; i < calcs.length; i++) {
      var cat2 = calcs[i].category;
      if (!catMap[cat2]) catMap[cat2] = [];
      catMap[cat2].push(calcs[i]);
    }
    var catKeys = Object.keys(catMap);
    for (var k = 0; k < catKeys.length; k++) {
      var ck = catKeys[k];
      if (fs.existsSync(path.join(DIST_DIR, 'category', ck))) continue;
      var calcCards = '';
      var items = catMap[ck];
      for (var m = 0; m < items.length; m++) {
        calcCards += '<a href="/calculator/' + items[m].id + '/" class="card card-link converter-card">';
        calcCards += '<h3>' + items[m].title + '</h3>';
        calcCards += '<p>' + items[m].description + '</p>';
        calcCards += '</a>\n';
      }
      var catName = categoryLabel(ck);
      var tokens2 = {
        HEAD: render(partials.HEAD || '', {
          PAGE_TITLE: catName + ' Calculators',
          META_DESCRIPTION: 'Free online ' + catName.toLowerCase() + ' calculators. Fast, accurate, no signup required.',
          CANONICAL_URL: SITE_URL + '/category/' + ck + '/',
          OG_TITLE: catName + ' Calculators',
          OG_DESCRIPTION: 'Free online ' + catName.toLowerCase() + ' calculators.',
          EXTRA_CSS: '',
          OG_IMAGE: SITE_URL + '/assets/og-image.png',
          LANG: 'en'
        }),
        HEADER: partials.HEADER || '',
        FOOTER: render(partials.FOOTER || '', { YEAR: YEAR }),
        CATEGORY_TITLE: catName + ' Calculators',
        CATEGORY_DESCRIPTION: 'Free online ' + catName.toLowerCase() + ' calculators. Choose a calculator below.',
        CATEGORY_CARDS: calcCards,
        BREADCRUMB: buildBreadcrumb([{ label: catName }]),
        STRUCTURED_DATA: ''
      };
      var html2 = render(template, tokens2);
      var outDir2 = path.join(DIST_DIR, 'category', ck);
      ensureDir(outDir2);
      fs.writeFileSync(path.join(outDir2, 'index.html'), html2);
      urls.push({ url: '/category/' + ck + '/', priority: 0.7 });
    }
  }

  return urls;
}

function buildStaticPages(partials) {
  var pagesDir = path.join(SRC_DIR, 'pages');
  if (!fs.existsSync(pagesDir)) return [];
  var urls = [];
  var files = fs.readdirSync(pagesDir);

  for (var i = 0; i < files.length; i++) {
    if (!files[i].endsWith('.html')) continue;
    var content = readFile(path.join(pagesDir, files[i]));
    var slug = files[i].replace('.html', '');

    var tokens = {
      HEAD: render(partials.HEAD || '', {
        PAGE_TITLE: slug === 'index' ? 'Free Online Calculators & Unit Converters' : slugToTitle(slug),
        META_DESCRIPTION: getPageDescription(slug),
        CANONICAL_URL: SITE_URL + (slug === 'index' ? '/' : '/' + slug + '/'),
        OG_TITLE: slug === 'index' ? 'CalcVerse — Free Online Calculators & Unit Converters' : slugToTitle(slug) + ' | CalcVerse',
        OG_DESCRIPTION: getPageDescription(slug),
        EXTRA_CSS: '<link rel="stylesheet" href="/css/home.css">',
        OG_IMAGE: SITE_URL + '/assets/og-image.png',
        LANG: 'en'
      }),
      HEADER: partials.HEADER || '',
      FOOTER: render(partials.FOOTER || '', { YEAR: YEAR }),
      AD_SLOT: partials.AD_SLOT || '',
      YEAR: YEAR
    };

    if (slug === 'index') {
      tokens.CALCULATOR_CARDS = buildHomepageCalcCards();
      tokens.CONVERTER_CATEGORIES = buildHomepageConverterCards();
      var calcs = readJSON(path.join(DATA_DIR, 'calculators.json'));
      var converters = readJSON(path.join(DATA_DIR, 'converters.json'));
      var totalConversions = 0;
      var cats = Object.keys(converters);
      for (var c = 0; c < cats.length; c++) {
        var u = converters[cats[c]].units.length;
        totalConversions += u * (u - 1);
      }
      tokens.CALC_COUNT = String(calcs.length);
      tokens.CONVERTER_COUNT = String(totalConversions);
    }

    var html = render(content, tokens);

    if (slug === 'index') {
      fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
      urls.push({ url: '/', priority: 1.0 });
    } else if (slug === '404') {
      fs.writeFileSync(path.join(DIST_DIR, '404.html'), html);
    } else {
      var outDir = path.join(DIST_DIR, slug);
      ensureDir(outDir);
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
      urls.push({ url: '/' + slug + '/', priority: 0.3 });
    }
  }

  return urls;
}

function slugToTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function getPageDescription(slug) {
  var descs = {
    index: 'Free online calculators and unit converters — EMI, SIP, PPF, income tax, BMI, and 500+ unit conversions. Fast, mobile-first, no signup required.',
    about: 'About CalcVerse — free, open-source online calculators and unit converters. All calculations happen in your browser.',
    'privacy-policy': 'CalcVerse privacy policy. No personal data collected. All calculations are performed client-side.'
  };
  return descs[slug] || 'CalcVerse — Free online calculators and unit converters.';
}

function buildHomepageCalcCards() {
  var calcsPath = path.join(DATA_DIR, 'calculators.json');
  if (!fs.existsSync(calcsPath)) return '';
  var calcs = readJSON(calcsPath);
  var groups = {};
  var order = ['financial', 'health', 'everyday', 'fun', 'math'];
  for (var i = 0; i < calcs.length; i++) {
    var cat = calcs[i].category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(calcs[i]);
  }
  var html = '';
  for (var o = 0; o < order.length; o++) {
    var key = order[o];
    if (!groups[key] || groups[key].length === 0) continue;
    html += '<section class="home-section" id="section-' + key + '">\n';
    html += '<h2>' + categoryLabel(key) + ' Calculators</h2>\n';
    html += '<div class="card-grid">\n';
    for (var j = 0; j < groups[key].length; j++) {
      var c = groups[key][j];
      html += '<a href="/calculator/' + c.id + '/" class="card card-link calc-card">';
      html += '<h3>' + c.title + '</h3>';
      html += '<p>' + c.description + '</p>';
      html += '</a>\n';
    }
    html += '</div>\n</section>\n';
  }
  return html;
}

function buildHomepageConverterCards() {
  var convPath = path.join(DATA_DIR, 'converters.json');
  if (!fs.existsSync(convPath)) return '';
  var converters = readJSON(convPath);
  var html = '';
  var categories = Object.keys(converters);
  for (var i = 0; i < categories.length; i++) {
    var cat = converters[categories[i]];
    html += '<a href="/category/' + categories[i] + '/" class="card card-link converter-category-card">';
    html += '<h3>' + cat.label + '</h3>';
    html += '<p>' + cat.units.length + ' units · ' + (cat.units.length * (cat.units.length - 1)) + ' conversions</p>';
    html += '</a>\n';
  }
  return html;
}

function generateSitemap(allUrls) {
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  var today = new Date().toISOString().split('T')[0];
  for (var i = 0; i < allUrls.length; i++) {
    xml += '  <url>\n';
    xml += '    <loc>' + SITE_URL + allUrls[i].url + '</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '    <priority>' + (allUrls[i].priority || 0.5) + '</priority>\n';
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
}

function generateRobotsTxt() {
  var txt = 'User-agent: *\nAllow: /\n\n';
  txt += 'Sitemap: ' + SITE_URL + '/sitemap.xml\n';
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), txt);
}

function generateHeaders() {
  var h = '/*\n';
  h += '  X-Content-Type-Options: nosniff\n';
  h += '  X-Frame-Options: DENY\n';
  h += '  Referrer-Policy: strict-origin-when-cross-origin\n';
  h += '  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n';
  h += '/calculator/*\n';
  h += '  Cache-Control: public, max-age=3600, s-maxage=86400\n\n';
  h += '/convert/*\n';
  h += '  Cache-Control: public, max-age=86400, s-maxage=604800\n\n';
  h += '/css/*\n';
  h += '  Cache-Control: public, max-age=31536000, immutable\n\n';
  h += '/js/*\n';
  h += '  Cache-Control: public, max-age=31536000, immutable\n\n';
  h += '/assets/*\n';
  h += '  Cache-Control: public, max-age=31536000, immutable\n';
  fs.writeFileSync(path.join(DIST_DIR, '_headers'), h);
}

function generateRedirects() {
  var r = '/calculator/:id  /calculator/:id/  301\n';
  r += '/convert/:id  /convert/:id/  301\n';
  r += '/category/:id  /category/:id/  301\n';
  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), r);
}

function generateManifest() {
  var manifest = {
    name: 'CalcVerse — Calculators & Converters',
    short_name: 'CalcVerse',
    description: 'Free online calculators and unit converters',
    start_url: '/',
    display: 'standalone',
    background_color: '#0C0F1A',
    theme_color: '#0C0F1A',
    icons: [
      { src: '/assets/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/favicon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
  fs.writeFileSync(path.join(DIST_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

function generateServiceWorker() {
  var sw = "var CACHE_NAME = 'calcverse-v1';\n";
  sw += "var PRECACHE_URLS = [\n  '/',\n  '/css/core.css',\n  '/css/calculator.css',\n  '/js/main.js',\n  '/js/calculator-ui.js'\n];\n\n";
  sw += "self.addEventListener('install', function (e) {\n";
  sw += "  e.waitUntil(caches.open(CACHE_NAME).then(function (cache) {\n";
  sw += "    return cache.addAll(PRECACHE_URLS);\n";
  sw += "  }));\n});\n\n";
  sw += "self.addEventListener('activate', function (e) {\n";
  sw += "  e.waitUntil(caches.keys().then(function (names) {\n";
  sw += "    return Promise.all(names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); }));\n";
  sw += "  }));\n});\n\n";
  sw += "self.addEventListener('fetch', function (e) {\n";
  sw += "  var url = new URL(e.request.url);\n";
  sw += "  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {\n";
  sw += "    e.respondWith(fetch(e.request).catch(function () { return caches.match(e.request); }));\n";
  sw += "  } else {\n";
  sw += "    e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));\n";
  sw += "  }\n});\n";
  fs.writeFileSync(path.join(DIST_DIR, 'sw.js'), sw);
}

function copyStaticAssets() {
  var dirs = ['css', 'js', 'calculators', 'assets', 'i18n'];
  for (var i = 0; i < dirs.length; i++) {
    var srcDir = path.join(SRC_DIR, dirs[i]);
    if (fs.existsSync(srcDir)) {
      copyDir(srcDir, path.join(DIST_DIR, dirs[i]));
    }
  }
}

function main() {
  var start = Date.now();
  console.log('Building CalcVerse...\n');

  clean();

  var partials = readPartials();

  var allUrls = [];

  var calcUrls = buildCalculatorPages(partials);
  allUrls = allUrls.concat(calcUrls);
  console.log('  Calculators: ' + calcUrls.length + ' pages');

  var convUrls = buildConverterPages(partials);
  allUrls = allUrls.concat(convUrls);
  console.log('  Converters:  ' + convUrls.length + ' pages');

  var catUrls = buildCategoryPages(partials);
  allUrls = allUrls.concat(catUrls);
  console.log('  Categories:  ' + catUrls.length + ' pages');

  var staticUrls = buildStaticPages(partials);
  allUrls = allUrls.concat(staticUrls);
  console.log('  Static:      ' + staticUrls.length + ' pages');

  generateSitemap(allUrls);
  generateRobotsTxt();
  generateHeaders();
  generateRedirects();
  generateManifest();
  generateServiceWorker();
  copyStaticAssets();

  var elapsed = Date.now() - start;
  console.log('\nBuild complete: ' + allUrls.length + ' total pages in ' + elapsed + 'ms');
  console.log('Sitemap: ' + allUrls.length + ' URLs');
  console.log('Output:  ' + DIST_DIR);
}

main();
