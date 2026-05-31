# Fontify

Free online fancy text generator & symbol copy-paste tool. Static HTML/CSS/JS, zero dependencies, built with `node build.js`.

## Tech Stack

- **Static HTML/CSS/JS** — no framework, no bundler
- **Build**: `node build.js` (Node.js built-ins only, zero npm dependencies)
- **Hosting**: Netlify at `fontifyy.netlify.app`
- **Pipeline**: `src/` + `data/` → `dist/` (dist/ is gitignored, Netlify builds on deploy)

## Directory Structure

```
fontify/
├── build.js                    # Static site generator
├── data/
│   ├── fonts.json              # Unicode font mappings (50+ styles)
│   ├── symbols.json            # Symbol categories (30+)
│   ├── tools.json              # Special text tool definitions
│   ├── use-cases.json          # Platform-specific pages
│   └── faq.json                # FAQ entries per page type
├── src/
│   ├── pages/                  # Static page sources (index, about, privacy-policy)
│   ├── templates/
│   │   ├── font-page.html
│   │   ├── symbol-page.html
│   │   ├── tool-page.html
│   │   ├── use-case-page.html
│   │   └── partials/           # head, header, footer, ad-slot
│   ├── css/                    # core.css, home.css, tool.css
│   ├── js/                     # main.js, font-engine.js, copy-utils.js, home.js
│   └── assets/                 # favicon, og-image
└── dist/                       # Build output (gitignored)
```

## Build System

```bash
node build.js
```

Outputs everything to `dist/`. Safe to run repeatedly (wipes dist/ first).

### What build.js does:
1. Reads `data/fonts.json` → generates `dist/font/<id>/index.html`
2. Reads `data/symbols.json` → generates `dist/symbols/<id>/index.html`
3. Reads `data/tools.json` → generates `dist/tools/<id>/index.html`
4. Reads `data/use-cases.json` → generates `dist/for/<id>/index.html`
5. Processes `src/pages/*.html` with partial injection → `dist/`
6. Generates sitemap.xml, robots.txt, _headers
7. Copies css/, js/, assets/ to dist/

### Configurable constant at top of build.js:
```js
const SITE_URL = 'https://fontify.netlify.app';
```

## Template System

Templates use `{{TOKEN}}` placeholders. Partials are injected as `{{HEAD}}`, `{{HEADER}}`, `{{FOOTER}}`, etc.

## Font Engine (font-engine.js)

Three core transformation methods:
- **Range-based**: Sequential Unicode blocks (bold, italic, monospace, etc.)
- **Combining characters**: Diacritical marks added to each char (strikethrough, underline)
- **Lookup table**: Character-by-character mapping (upside-down, small caps, etc.)

Additional methods: reverse, spaced, separator, wrap, zalgo, vaporwave, morse, binary, sarcasm.

## URL Structure

- `/` — homepage (main generator with all fonts)
- `/font/<id>/` — individual font generator pages
- `/symbols/<id>/` — symbol category pages
- `/tools/<id>/` — special text tool pages
- `/for/<platform>/` — use-case/platform pages
- `/about/`, `/privacy-policy/` — static pages

## Local Development

```bash
node build.js
npx serve dist
```

## Deployment

Netlify auto-deploys on push to `master`:
- Build command: `node build.js`
- Build output: `dist`
- Node version: 20 (set in `netlify.toml`)

## Adding a New Font

1. Add entry to `data/fonts.json` with id, name, method, ranges/table
2. Add FAQ entries to `data/faq.json` (optional)
3. Run `node build.js`

## Adding a New Symbol Category

1. Add category to `data/symbols.json` with symbols array
2. Run `node build.js`

## CSS Conventions

- Dark theme by default, CSS variables in `:root`
- Primary: `#8B5CF6` (purple), Secondary: `#06B6D4` (cyan), Accent: `#F59E0B` (amber)
- Background: `#0C0F1A`, Cards: `#141825`
- Font: Inter, mobile-first responsive
- Light mode: `[data-theme="light"]`
