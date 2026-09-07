const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://fontifyy.netlify.app';
const SITE_NAME = 'Fontify';
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

function buildBreadcrumbSD(segments) {
  var items = [{ position: 1, name: 'Home', item: SITE_URL + '/' }];
  for (var i = 0; i < segments.length; i++) {
    items.push({
      position: i + 2,
      name: segments[i].name,
      item: SITE_URL + segments[i].url
    });
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map(function(item) {
      return {
        '@type': 'ListItem',
        'position': item.position,
        'name': item.name,
        'item': item.item
      };
    })
  });
}

function buildWebAppSD(name, description, url, category) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': name,
    'description': description,
    'url': url,
    'applicationCategory': category || 'UtilitiesApplication',
    'operatingSystem': 'Any',
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
  });
}

function buildFaqSD(faqItems) {
  if (!faqItems || faqItems.length === 0) return '';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(function(item) {
      return {
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.answer }
      };
    })
  });
}

function buildFaqHTML(faqItems) {
  if (!faqItems || faqItems.length === 0) return '';
  var html = '<section class="faq-section">\n<h2>Frequently Asked Questions</h2>\n';
  for (var i = 0; i < faqItems.length; i++) {
    html += '<details class="faq-item">\n';
    html += '  <summary>' + faqItems[i].question + '</summary>\n';
    html += '  <p>' + faqItems[i].answer + '</p>\n';
    html += '</details>\n';
  }
  html += '</section>';
  return html;
}

function buildRelatedHTML(items, currentId) {
  if (!items || items.length === 0) return '';
  var filtered = items.filter(function(item) { return item.id !== currentId; }).slice(0, 6);
  if (filtered.length === 0) return '';
  var html = '<section class="related-section">\n<h2>Related Tools</h2>\n<div class="related-grid">\n';
  for (var i = 0; i < filtered.length; i++) {
    var item = filtered[i];
    var url = item.url || '/font/' + item.id + '/';
    html += '<a href="' + url + '" class="related-card">\n';
    html += '  <span class="related-preview">' + (item.preview || item.name) + '</span>\n';
    html += '  <span class="related-name">' + item.name + '</span>\n';
    html += '</a>\n';
  }
  html += '</div>\n</section>';
  return html;
}

function buildPageLinks(title, items, urlPrefix, currentId, limit) {
  var filtered = (items || []).filter(function(item) { return item.id !== currentId; }).slice(0, limit || 6);
  if (filtered.length === 0) return '';
  var html = '<section class="related-section topic-links">\n<h2>' + title + '</h2>\n<div class="related-grid">\n';
  for (var i = 0; i < filtered.length; i++) {
    var item = filtered[i];
    html += '<a href="' + urlPrefix + item.id + '/" class="related-card">';
    html += '<span class="related-name">' + item.name + '</span>';
    if (item.description) html += '<span class="related-description">' + item.description + '</span>';
    html += '</a>\n';
  }
  html += '</div>\n</section>';
  return html;
}

function buildIndexHubs(fonts, symbols, tools, useCases) {
  function links(items, prefix, limit) {
    return items.slice(0, limit || items.length).map(function(item) {
      return '<a href="' + prefix + item.id + '/">' + item.name + '</a>';
    }).join('');
  }
  return '<section class="container crawlable-hubs">\n' +
    '<div class="hub-block"><h2>Popular font generators</h2><div class="hub-links">' + links(fonts.filter(function(font) { return (font.priority || 0) >= 0.85; }), '/font/', 12) + '</div><a class="hub-more" href="#fonts">Browse all font styles</a></div>\n' +
    '<div class="hub-block"><h2>Text tools</h2><div class="hub-links">' + links(tools, '/tools/') + '</div></div>\n' +
    '<div class="hub-block"><h2>Symbol collections</h2><div class="hub-links">' + links(symbols, '/symbols/') + '</div></div>\n' +
    '<div class="hub-block"><h2>Fonts for platforms</h2><div class="hub-links">' + links(useCases, '/for/') + '</div></div>\n' +
    '</section>';
}

// ── Page Builders ──

function buildFontPages(fonts, template, partials, faqData, allFonts, useCases) {
  var urls = [];
  for (var i = 0; i < fonts.length; i++) {
    var font = fonts[i];
    var pageUrl = '/font/' + font.id + '/';
    var canonicalUrl = SITE_URL + pageUrl;
    var title = font.name + ' Text Generator — Copy & Paste ' + font.name + ' Font | ' + SITE_NAME;
    var supportedPlatforms = (font.platforms || []).slice(0, 4).join(', ');
    var metaDesc = 'Generate ' + font.name.toLowerCase() + ' text (' + font.preview + ') instantly. Copy and paste this Unicode style for ' + (supportedPlatforms || 'social media and messaging apps') + '.';

    var relatedFonts = (font.relatedFonts || []).map(function(id) {
      return allFonts.find(function(f) { return f.id === id; });
    }).filter(Boolean);

    var faqItems = faqData[font.id] || [];

    var breadcrumbs = [{ name: 'Fonts', url: '/#fonts' }, { name: font.name, url: pageUrl }];

    var structuredData = '';
    structuredData += '<script type="application/ld+json">' + buildWebAppSD(font.name + ' Text Generator', metaDesc, canonicalUrl) + '</script>\n';
    structuredData += '<script type="application/ld+json">' + buildBreadcrumbSD(breadcrumbs) + '</script>\n';
    var faqSD = buildFaqSD(faqItems);
    if (faqSD) structuredData += '<script type="application/ld+json">' + faqSD + '</script>';

    var fontDataScript = '<script>window.__FONT_DATA__=' + JSON.stringify({
      id: font.id,
      name: font.name,
      method: font.method,
      ranges: font.ranges || null,
      combiningChar: font.combiningChar || null,
      table: font.table || null,
      separator: font.separator || null,
      wrapLeft: font.wrapLeft || null,
      wrapRight: font.wrapRight || null,
      options: font.options || null
    }) + ';</script>';

    var platformLinks = (font.platforms || []).map(function(platform) {
      return useCases.find(function(uc) { return uc.name.toLowerCase() === platform.toLowerCase(); });
    }).filter(Boolean);
    var topicLinks = buildPageLinks('Use this style on', platformLinks, '/for/', '', 4);

    var tokens = Object.assign({}, partials, {
      PAGE_TITLE: title,
      META_DESCRIPTION: metaDesc,
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: font.name + ' Text Generator — Free Online Tool',
      OG_DESCRIPTION: metaDesc,
      OG_IMAGE: SITE_URL + '/assets/og-image.png',
      SITE_URL: SITE_URL,
      SITE_NAME: SITE_NAME,
      YEAR: YEAR,
      FONT_NAME: font.name,
      FONT_ID: font.id,
      FONT_PREVIEW: font.preview,
      FONT_DESCRIPTION: font.description || '',
      FONT_CONTENT: font.content || '',
      FONT_TIPS: font.tips || '',
      FONT_PLATFORMS: (font.platforms || []).join(', '),
      FONT_COMPATIBILITY: 'Unicode styling works in most modern text fields, but support varies by app, device, and screen reader. Use it for visual emphasis rather than information that must be available as plain text, and keep a regular-text version for accessibility.',
      FONT_DATA_SCRIPT: fontDataScript,
      STRUCTURED_DATA: structuredData,
      BREADCRUMB_HTML: buildBreadcrumbHTML(breadcrumbs),
      FAQ_SECTION: buildFaqHTML(faqItems),
      RELATED: buildRelatedHTML(relatedFonts, font.id) + topicLinks,
      PAGE_CSS: 'tool'
    });

    var html = render(template, tokens);
    var outDir = path.join(DIST_DIR, 'font', font.id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    urls.push({ url: pageUrl, priority: font.priority || 0.8 });
  }
  return urls;
}

function buildSymbolPages(symbols, template, partials, faqData) {
  var urls = [];
  for (var i = 0; i < symbols.length; i++) {
    var cat = symbols[i];
    var pageUrl = '/symbols/' + cat.id + '/';
    var canonicalUrl = SITE_URL + pageUrl;
    var title = cat.name + ' — Copy & Paste ' + cat.name + ' | ' + SITE_NAME;
    var metaDesc = 'Browse and copy ' + cat.name.toLowerCase() + '. Click any symbol to copy it to your clipboard instantly. Free online tool.';

    var faqItems = faqData[cat.id] || [];
    var breadcrumbs = [{ name: 'Symbols', url: '/#symbols' }, { name: cat.name, url: pageUrl }];

    var structuredData = '';
    structuredData += '<script type="application/ld+json">' + buildWebAppSD(cat.name + ' — Copy & Paste', metaDesc, canonicalUrl) + '</script>\n';
    structuredData += '<script type="application/ld+json">' + buildBreadcrumbSD(breadcrumbs) + '</script>\n';
    var faqSD = buildFaqSD(faqItems);
    if (faqSD) structuredData += '<script type="application/ld+json">' + faqSD + '</script>';

    var symbolsHTML = '<div class="symbols-grid">\n';
    for (var j = 0; j < cat.symbols.length; j++) {
      var sym = cat.symbols[j];
      symbolsHTML += '<button class="symbol-btn" data-symbol="' + sym.char + '" data-symbol-name="' + sym.name.toLowerCase() + '" data-symbol-code="' + sym.code.toLowerCase() + '" aria-label="Copy ' + sym.name + ', ' + sym.code + '" title="' + sym.name + ' (' + sym.code + ')">' + sym.char + '</button>\n';
    }
    symbolsHTML += '</div>';

    var symbolReferenceHTML = '<div class="symbol-reference"><h3>Symbol names and Unicode codes</h3><div class="symbol-reference-grid">';
    for (var k = 0; k < cat.symbols.length; k++) {
      symbolReferenceHTML += '<div class="symbol-reference-item"><span class="symbol-reference-char">' + cat.symbols[k].char + '</span><span><strong>' + cat.symbols[k].name + '</strong><small>' + cat.symbols[k].code + '</small></span></div>';
    }
    symbolReferenceHTML += '</div></div>';

    var tokens = Object.assign({}, partials, {
      PAGE_TITLE: title,
      META_DESCRIPTION: metaDesc,
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: cat.name + ' — Copy & Paste Symbols',
      OG_DESCRIPTION: metaDesc,
      OG_IMAGE: SITE_URL + '/assets/og-image.png',
      SITE_URL: SITE_URL,
      SITE_NAME: SITE_NAME,
      YEAR: YEAR,
      SYMBOL_CATEGORY: cat.name,
      SYMBOL_DESCRIPTION: cat.description || '',
      SYMBOLS_GRID: symbolsHTML,
      SYMBOL_REFERENCE: symbolReferenceHTML,
      SYMBOL_CONTENT: cat.content || '',
      STRUCTURED_DATA: structuredData,
      BREADCRUMB_HTML: buildBreadcrumbHTML(breadcrumbs),
      FAQ_SECTION: buildFaqHTML(faqItems),
      RELATED: buildPageLinks('Explore more symbol collections', symbols, '/symbols/', cat.id, 6),
      PAGE_CSS: 'tool'
    });

    var html = render(template, tokens);
    var outDir = path.join(DIST_DIR, 'symbols', cat.id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    urls.push({ url: pageUrl, priority: cat.priority || 0.7 });
  }
  return urls;
}

function buildToolPages(tools, template, partials, faqData, fonts) {
  var urls = [];
  for (var i = 0; i < tools.length; i++) {
    var tool = tools[i];
    var pageUrl = '/tools/' + tool.id + '/';
    var canonicalUrl = SITE_URL + pageUrl;
    var title = tool.name + ' Generator — ' + tool.preview + ' | ' + SITE_NAME;
    var metaDesc = tool.description + '. Generate ' + tool.name.toLowerCase() + ' text online and copy it instantly for ' + ((tool.platforms || []).slice(0, 3).join(', ') || 'social media and messages') + '.';

    var faqItems = faqData[tool.id] || [];
    var breadcrumbs = [{ name: 'Tools', url: '/#tools' }, { name: tool.name, url: pageUrl }];

    var structuredData = '';
    structuredData += '<script type="application/ld+json">' + buildWebAppSD(tool.name + ' Generator', metaDesc, canonicalUrl) + '</script>\n';
    structuredData += '<script type="application/ld+json">' + buildBreadcrumbSD(breadcrumbs) + '</script>\n';
    var faqSD = buildFaqSD(faqItems);
    if (faqSD) structuredData += '<script type="application/ld+json">' + faqSD + '</script>';

    var toolDataScript = '<script>window.__TOOL_DATA__=' + JSON.stringify({
      id: tool.id,
      name: tool.name,
      method: tool.method,
      combiningChar: tool.combiningChar || null,
      table: tool.table || null,
      separator: tool.separator || null,
      wrapLeft: tool.wrapLeft || null,
      wrapRight: tool.wrapRight || null,
      options: tool.options || null
    }) + ';</script>';

    var tokens = Object.assign({}, partials, {
      PAGE_TITLE: title,
      META_DESCRIPTION: metaDesc,
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: tool.name + ' Generator — Free Online Tool',
      OG_DESCRIPTION: metaDesc,
      OG_IMAGE: SITE_URL + '/assets/og-image.png',
      SITE_URL: SITE_URL,
      SITE_NAME: SITE_NAME,
      YEAR: YEAR,
      TOOL_NAME: tool.name,
      TOOL_ID: tool.id,
      TOOL_PREVIEW: tool.preview,
      TOOL_DESCRIPTION: tool.description || '',
      TOOL_CONTENT: tool.content || '',
      TOOL_PLATFORMS: (tool.platforms || []).join(', '),
      TOOL_DATA_SCRIPT: toolDataScript,
      STRUCTURED_DATA: structuredData,
      BREADCRUMB_HTML: buildBreadcrumbHTML(breadcrumbs),
      FAQ_SECTION: buildFaqHTML(faqItems),
      RELATED: buildPageLinks('More text tools', tools, '/tools/', tool.id, 6) +
        buildPageLinks('Try a font style', fonts, '/font/', '', 4),
      PAGE_CSS: 'tool'
    });

    var html = render(template, tokens);
    var outDir = path.join(DIST_DIR, 'tools', tool.id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    urls.push({ url: pageUrl, priority: tool.priority || 0.75 });
  }
  return urls;
}

function buildUseCasePages(useCases, template, partials, faqData, allFonts) {
  var urls = [];
  for (var i = 0; i < useCases.length; i++) {
    var uc = useCases[i];
    var pageUrl = '/for/' + uc.id + '/';
    var canonicalUrl = SITE_URL + pageUrl;
    var title = uc.title + ' | ' + SITE_NAME;
    var metaDesc = uc.description;

    var faqItems = faqData[uc.id] || [];
    var breadcrumbs = [{ name: 'Use Cases', url: '/#use-cases' }, { name: uc.name, url: pageUrl }];

    var structuredData = '';
    structuredData += '<script type="application/ld+json">' + buildBreadcrumbSD(breadcrumbs) + '</script>\n';
    var faqSD = buildFaqSD(faqItems);
    if (faqSD) structuredData += '<script type="application/ld+json">' + faqSD + '</script>';

    var recommendedFonts = (uc.recommendedFonts || []).map(function(id) {
      return allFonts.find(function(f) { return f.id === id; });
    }).filter(Boolean);

    var fontsForGrid = recommendedFonts.map(function(f) {
      return {
        id: f.id, name: f.name, method: f.method,
        ranges: f.ranges || null, combiningChar: f.combiningChar || null,
        table: f.table || null, separator: f.separator || null,
        wrapLeft: f.wrapLeft || null, wrapRight: f.wrapRight || null,
        options: f.options || null
      };
    });
    var fontsScript = '<script>window.__USE_CASE_FONTS__=' + JSON.stringify(fontsForGrid) + ';</script>';

    var tokens = Object.assign({}, partials, {
      PAGE_TITLE: title,
      META_DESCRIPTION: metaDesc,
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: uc.title,
      OG_DESCRIPTION: metaDesc,
      OG_IMAGE: SITE_URL + '/assets/og-image.png',
      SITE_URL: SITE_URL,
      SITE_NAME: SITE_NAME,
      YEAR: YEAR,
      USE_CASE_NAME: uc.name,
      USE_CASE_TITLE: uc.title,
      USE_CASE_CONTENT: uc.content || '',
      STRUCTURED_DATA: structuredData,
      BREADCRUMB_HTML: buildBreadcrumbHTML(breadcrumbs),
      FAQ_SECTION: buildFaqHTML(faqItems),
      RELATED: buildRelatedHTML(recommendedFonts, ''),
      FONTS_SCRIPT: fontsScript,
      PAGE_CSS: 'tool'
    });

    var html = render(template, tokens);
    var outDir = path.join(DIST_DIR, 'for', uc.id);
    ensureDir(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    urls.push({ url: pageUrl, priority: uc.priority || 0.7 });
  }
  return urls;
}

function buildStaticPages(partials, fonts, symbols, tools, useCases) {
  var pageMeta = {
    'index': {
      title: 'Fontify — Free Fancy Text Generator & Unicode Fonts',
      description: 'Transform text into stylish Unicode fonts. Bold, italic, cursive, gothic & 50+ styles. Copy & paste anywhere — Instagram, Twitter, Discord. Free online tool.',
      css: 'home'
    },
    'about': {
      title: 'About Fontify — Free Online Text Tools',
      description: 'Learn about Fontify, a free online fancy text generator that uses Unicode characters to style text for social media and messaging.',
      css: 'tool'
    },
    'privacy-policy': {
      title: 'Privacy Policy | Fontify',
      description: 'Fontify privacy policy. All text transformations happen in your browser. We never store or transmit your text.',
      css: 'tool'
    }
  };

  var urls = [];
  var pagesDir = path.join(SRC_DIR, 'pages');
  if (!fs.existsSync(pagesDir)) return urls;
  var files = fs.readdirSync(pagesDir);
  for (var i = 0; i < files.length; i++) {
    if (!files[i].endsWith('.html')) continue;
    var content = readFile(path.join(pagesDir, files[i]));
    var slug = files[i].replace('.html', '');
    var pageUrl = slug === 'index' ? '/' : '/' + slug + '/';
    var canonicalUrl = SITE_URL + pageUrl;
    var meta = pageMeta[slug] || { title: SITE_NAME, description: '', css: 'tool' };

    var structuredData = '';
    if (slug === 'index') {
      structuredData = '<script type="application/ld+json">' + JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': SITE_NAME,
        'url': SITE_URL + '/',
        'description': meta.description
      }) + '</script>';
    }

    var tokens = Object.assign({}, partials, {
      SITE_URL: SITE_URL,
      SITE_NAME: SITE_NAME,
      YEAR: YEAR,
      CANONICAL_URL: canonicalUrl,
      PAGE_TITLE: meta.title,
      META_DESCRIPTION: meta.description,
      OG_TITLE: meta.title,
      OG_DESCRIPTION: meta.description,
      OG_IMAGE: SITE_URL + '/assets/og-image.png',
      STRUCTURED_DATA: structuredData,
      PAGE_CSS: meta.css
    });
    if (slug === 'index') tokens.INDEX_HUBS = buildIndexHubs(fonts, symbols, tools, useCases);

    var html = render(content, tokens);

    if (slug === 'index') {
      fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
    } else {
      var outDir = path.join(DIST_DIR, slug);
      ensureDir(outDir);
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
    }

    var priority = slug === 'index' ? 1.0 : 0.5;
    urls.push({ url: pageUrl, priority: priority });
  }
  return urls;
}

function buildBreadcrumbHTML(segments) {
  var html = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>';
  html += '<li><a href="/">Home</a></li>';
  for (var i = 0; i < segments.length; i++) {
    if (i === segments.length - 1) {
      html += '<li aria-current="page">' + segments[i].name + '</li>';
    } else {
      html += '<li><a href="' + segments[i].url + '">' + segments[i].name + '</a></li>';
    }
  }
  html += '</ol></nav>';
  return html;
}

// ── SEO Generation ──

function generateSitemap(allUrls) {
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (var i = 0; i < allUrls.length; i++) {
    xml += '  <url>\n';
    xml += '    <loc>' + SITE_URL + allUrls[i].url + '</loc>\n';
    xml += '  </url>\n';
  }
  xml += '</urlset>';
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
}

function generateRobotsTxt() {
  var txt = 'User-agent: *\nAllow: /\n\nSitemap: ' + SITE_URL + '/sitemap.xml\n';
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), txt);
}

function generateHeaders() {
  var headers = '';
  headers += '/css/*\n  Cache-Control: public, max-age=31536000, immutable\n\n';
  headers += '/js/*\n  Cache-Control: public, max-age=31536000, immutable\n\n';
  headers += '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n';
  headers += '/font/*\n  Cache-Control: public, max-age=3600, s-maxage=86400\n\n';
  headers += '/symbols/*\n  Cache-Control: public, max-age=3600, s-maxage=86400\n\n';
  headers += '/tools/*\n  Cache-Control: public, max-age=3600, s-maxage=86400\n\n';
  fs.writeFileSync(path.join(DIST_DIR, '_headers'), headers);
}

// ── Main Build ──

function build() {
  console.log('Building ' + SITE_NAME + '...');
  clean();

  var partials = readPartials();
  partials.YEAR = YEAR;
  partials.SITE_URL = SITE_URL;
  partials.SITE_NAME = SITE_NAME;

  var fonts = readJSON(path.join(DATA_DIR, 'fonts.json'));
  var symbols = readJSON(path.join(DATA_DIR, 'symbols.json'));
  var tools = readJSON(path.join(DATA_DIR, 'tools.json'));
  var useCases = readJSON(path.join(DATA_DIR, 'use-cases.json'));
  var faqData = readJSON(path.join(DATA_DIR, 'faq.json'));

  var fontTemplate = readFile(path.join(SRC_DIR, 'templates', 'font-page.html'));
  var symbolTemplate = readFile(path.join(SRC_DIR, 'templates', 'symbol-page.html'));
  var toolTemplate = readFile(path.join(SRC_DIR, 'templates', 'tool-page.html'));
  var useCaseTemplate = readFile(path.join(SRC_DIR, 'templates', 'use-case-page.html'));

  var allUrls = [];

  console.log('  Generating ' + fonts.length + ' font pages...');
  allUrls = allUrls.concat(buildFontPages(fonts, fontTemplate, partials, faqData, fonts, useCases));

  console.log('  Generating ' + symbols.length + ' symbol pages...');
  allUrls = allUrls.concat(buildSymbolPages(symbols, symbolTemplate, partials, faqData));

  console.log('  Generating ' + tools.length + ' tool pages...');
  allUrls = allUrls.concat(buildToolPages(tools, toolTemplate, partials, faqData, fonts));

  console.log('  Generating ' + useCases.length + ' use-case pages...');
  allUrls = allUrls.concat(buildUseCasePages(useCases, useCaseTemplate, partials, faqData, fonts));

  console.log('  Processing static pages...');
  allUrls = allUrls.concat(buildStaticPages(partials, fonts, symbols, tools, useCases));

  console.log('  Generating sitemap (' + allUrls.length + ' URLs)...');
  generateSitemap(allUrls);
  generateRobotsTxt();
  generateHeaders();

  // Copy static assets
  var cssSrc = path.join(SRC_DIR, 'css');
  var jsSrc = path.join(SRC_DIR, 'js');
  var assetsSrc = path.join(SRC_DIR, 'assets');

  if (fs.existsSync(cssSrc)) copyDir(cssSrc, path.join(DIST_DIR, 'css'));
  if (fs.existsSync(jsSrc)) copyDir(jsSrc, path.join(DIST_DIR, 'js'));
  if (fs.existsSync(assetsSrc)) copyDir(assetsSrc, path.join(DIST_DIR, 'assets'));

  console.log('Done! Generated ' + allUrls.length + ' pages in dist/');
}

build();
