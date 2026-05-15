# CalcVerse

Free online calculators & unit converters. Static HTML/CSS/JS, zero dependencies, built with `node build.js`.

## Tech Stack

- **Static HTML/CSS/JS** — no framework, no bundler
- **Build**: `node build.js` (Node.js built-ins only, zero npm dependencies)
- **Hosting**: Netlify at `calcverse-tools.netlify.app`
- **Pipeline**: `src/` + `data/` → `dist/` (dist/ is gitignored, Netlify builds on deploy)

## Directory Structure

```
calcverse/
├── build.js                    # Static site generator
├── data/
│   ├── calculators.json        # Calculator definitions (metadata + input/output schema)
│   ├── converters.json         # Unit converter definitions (categories, units, formulas)
│   └── faq.json                # FAQ entries per calculator/converter
├── src/
│   ├── pages/                  # Static page sources (index, about, privacy, 404)
│   ├── templates/
│   │   ├── calculator-page.html
│   │   ├── converter-page.html
│   │   ├── category-page.html
│   │   └── partials/           # head, header, footer, ad-slot, faq-section, related
│   ├── css/                    # core.css, calculator.css, converter.css, home.css
│   ├── js/                     # main.js, calculator-ui.js, converter-ui.js, chart.js, i18n.js
│   ├── calculators/            # One JS module per calculator (pure math, no DOM)
│   ├── i18n/                   # translations.json
│   └── assets/                 # favicon, icons, og-image
└── dist/                       # Build output (gitignored)
```

## Build System

```bash
node build.js
```

Outputs everything to `dist/`. Safe to run repeatedly (wipes dist/ first).

### What build.js does:
1. Reads `data/calculators.json` → generates `dist/calculator/<id>/index.html`
2. Reads `data/converters.json` → generates `dist/convert/<from>-to-<to>/index.html` for ALL unit pairs
3. Generates category pages at `dist/category/<slug>/index.html`
4. Processes `src/pages/*.html` with partial injection → `dist/`
5. Generates sitemap.xml, robots.txt, manifest.json, sw.js
6. Generates `_headers` and `_redirects`
7. Copies css/, js/, calculators/, assets/ to dist/

### Configurable constant at top of build.js:
```js
const SITE_URL = 'https://calcverse-tools.netlify.app';
```

## Template System

Templates use `{{TOKEN}}` placeholders. Partials are injected as `{{HEAD}}`, `{{HEADER}}`, `{{FOOTER}}`, etc.

### Partial tokens:
- `{{HEAD}}` — `<head>` content (meta, CSS, OG tags)
- `{{HEADER}}` — navigation bar
- `{{FOOTER}}` — site footer
- `{{AD_SLOT}}` — AdSense placeholder
- `{{FAQ_SECTION}}` — FAQ accordion with Schema.org markup
- `{{RELATED}}` — related calculators/converters grid

### Calculator page tokens:
`{{CALC_TITLE}}`, `{{CALC_DESCRIPTION}}`, `{{CALC_INPUTS}}`, `{{CALC_SCRIPT}}`, `{{STRUCTURED_DATA}}`, `{{BREADCRUMB}}`, `{{CANONICAL_URL}}`, `{{OG_TITLE}}`, `{{OG_DESCRIPTION}}`

### Converter page tokens:
`{{FROM_UNIT}}`, `{{TO_UNIT}}`, `{{FROM_LABEL}}`, `{{TO_LABEL}}`, `{{FROM_SYMBOL}}`, `{{TO_SYMBOL}}`, `{{CATEGORY}}`, `{{CONVERSION_TABLE}}`, `{{FORMULA_EXPLANATION}}`

### Shared tokens:
`{{PAGE_TITLE}}`, `{{META_DESCRIPTION}}`, `{{CANONICAL_URL}}`, `{{PAGE_CSS}}`, `{{LANG}}`

## Adding a New Calculator

1. Add entry to `data/calculators.json`:
   ```json
   {
     "id": "my-calc",
     "title": "My Calculator",
     "description": "...",
     "category": "financial",
     "inputs": [{ "id": "amount", "label": "Amount", "type": "currency", "default": 1000 }],
     "outputs": ["result"],
     "hasChart": false,
     "relatedCalculators": ["emi"],
     "priority": 0.8
   }
   ```
2. Create `src/calculators/my-calc.js` with a `calculate` function
3. Add FAQ entries to `data/faq.json`
4. Run `node build.js`

## Adding a New Converter Category

1. Add category to `data/converters.json`:
   ```json
   {
     "label": "Pressure",
     "units": [
       { "id": "pascal", "label": "Pascals", "symbol": "Pa", "toBase": 1 },
       { "id": "bar", "label": "Bar", "symbol": "bar", "toBase": 100000 }
     ]
   }
   ```
2. For temperature-style conversions, use `convert` functions instead of `toBase`
3. Run `node build.js` — all pair pages auto-generate

## Calculator Module Interface

Each calculator in `src/calculators/<id>.js`:
- Defines a function and attaches to `window.CalcVerse.calculators.<id>`
- Takes an object of input values, returns an object of output values
- Pure math — NO DOM manipulation
- `calculator-ui.js` handles all DOM interaction

## CSS Conventions

- Dark theme by default, CSS variables in `:root`
- Primary: `#3B82F6`, Secondary: `#10B981`, Accent: `#F59E0B`
- Background: `#0C0F1A`, Cards: `#141825`
- Font: Inter, `font-variant-numeric: tabular-nums` for numbers
- Mobile-first: base styles are mobile, `@media (min-width: 768px)` for desktop
- Border radius: 12px cards, 8px inputs

## URL Structure

- `/` — homepage
- `/calculator/<id>/` — calculator pages
- `/convert/<from>-to-<to>/` — converter pages
- `/category/<slug>/` — category listing pages
- `/about/`, `/privacy-policy/` — static pages

## Local Development

```bash
node build.js
# Then serve dist/ with any static server:
npx serve dist
# or: python -m http.server -d dist
```

## Deployment

Netlify auto-deploys on push to `master`:
- Build command: `node build.js`
- Build output: `dist`
- Node version: 20 (set in `netlify.toml`)

## Key Gotchas

- Temperature conversions use formulas, not simple `toBase` multiplication
- `dist/` is gitignored — never commit generated files
- All URLs are root-relative (no subpath prefix)
- Service worker: network-first for HTML (preserves ad impressions), cache-first for assets
- Don't precache all 400+ converter pages in SW — only top calculators
- Windows line endings: normalize `\r\n` → `\n` early in build pipeline
