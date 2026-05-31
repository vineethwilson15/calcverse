# Fontify

Free online fancy text generator & Unicode font tool. Type text, get styled Unicode output, copy and paste anywhere — Instagram, Twitter, Discord, and more.

**Live:** [fontifyy.netlify.app](https://fontifyy.netlify.app)

## Features

- **50+ Font Styles** — Bold, italic, cursive, gothic, bubble, monospace, and more
- **18 Symbol Categories** — Arrows, stars, hearts, math, currency, and more
- **15 Text Tools** — Zalgo, strikethrough, vaporwave, upside-down, mirror, morse code
- **10 Use-Case Pages** — Platform-specific guides for Instagram, Discord, Twitter, etc.
- **96 Total Pages** — Each targeting specific long-tail keywords
- **Dark/light theme** with toggle
- **Mobile-first** responsive design
- **Zero dependencies** — vanilla HTML, CSS, JavaScript
- **SEO optimized** — Schema.org structured data, sitemap, FAQ schema
- **Privacy-first** — all transformations happen in the browser, no data sent to servers

## Tech Stack

- Static HTML/CSS/JS — no framework, no bundler
- `node build.js` — static site generator using Node.js built-ins only (zero npm deps)
- Netlify — hosting with auto-deploy on push

## Local Development

```bash
node build.js
npx serve dist
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
fontify/
├── build.js              # Static site generator
├── data/
│   ├── fonts.json        # Unicode font mappings (50+ styles)
│   ├── symbols.json      # Symbol categories & characters
│   ├── tools.json        # Special text tool definitions
│   ├── use-cases.json    # Platform-specific pages
│   └── faq.json          # FAQ entries per page type
├── src/
│   ├── css/              # core, home, tool styles
│   ├── js/               # main, font-engine, copy-utils, home
│   ├── pages/            # Static pages (index, about, privacy-policy)
│   ├── templates/        # Page templates with {{TOKEN}} placeholders
│   └── assets/           # Favicon
└── dist/                 # Build output (gitignored)
```

## Adding a New Font

1. Add an entry to `data/fonts.json` with id, name, method, ranges/table
2. Optionally add FAQ entries to `data/faq.json`
3. Run `node build.js`

## Adding a New Symbol Category

1. Add a category to `data/symbols.json` with symbols array
2. Run `node build.js`

## Deployment

Netlify auto-deploys on push to `master`:

| Setting | Value |
|---------|-------|
| Build command | `node build.js` |
| Build output | `dist` |
| Node version | `20` |

## License

MIT
