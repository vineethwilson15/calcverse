# CalcVerse

Free online calculators & unit converters — EMI, SIP, BMI, percentage, and 400+ unit conversions. Fast, mobile-first, no signup.

**Live:** [calcverse-tools.netlify.app](https://calcverse-tools.netlify.app)

## Features

- **10 Calculators** — EMI, SIP, compound interest, loan, percentage, BMI, age, GST, tip, discount
- **264 Unit Converters** — length, weight, temperature, area, volume, speed, data storage, time
- **Dark theme** by default with light mode toggle
- **Mobile-first** responsive design
- **Zero dependencies** — vanilla HTML, CSS, JavaScript
- **SEO optimized** — Schema.org structured data, sitemap, meta tags
- **PWA installable** — service worker, manifest, offline support
- **Privacy-first** — all calculations happen in the browser, no data sent to servers

## Tech Stack

- Static HTML/CSS/JS — no framework, no bundler
- `node build.js` — static site generator using Node.js built-ins only
- Cloudflare Pages — hosting and CDN

## Local Development

```bash
# Clone the repo
git clone https://github.com/vineethwilson15/calcverse.git
cd calcverse

# Build the site
node build.js

# Serve locally (use any static server)
npx serve dist
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
calcverse/
├── build.js              # Static site generator
├── data/
│   ├── calculators.json  # Calculator definitions
│   ├── converters.json   # Unit converter categories & units
│   └── faq.json          # FAQ entries
├── src/
│   ├── calculators/      # One JS module per calculator (pure math)
│   ├── css/              # core, calculator, converter, home styles
│   ├── js/               # main, calculator-ui, converter-ui, chart, i18n
│   ├── pages/            # Static pages (index, about, privacy, 404)
│   ├── templates/        # Page templates with {{TOKEN}} placeholders
│   ├── i18n/             # Translation strings
│   └── assets/           # Favicons, icons, OG image
└── dist/                 # Build output (gitignored)
```

## Adding a Calculator

1. Add an entry to `data/calculators.json` with inputs, outputs, and metadata
2. Create `src/calculators/<id>.js` with a `calculate` function (pure math, no DOM)
3. Add FAQ entries to `data/faq.json`
4. Run `node build.js`

## Adding a Converter Category

1. Add a category to `data/converters.json` with units and conversion factors
2. Run `node build.js` — all unit pair pages are auto-generated

## Deployment

Cloudflare Pages auto-deploys on push to `master`:

| Setting | Value |
|---------|-------|
| Build command | `node build.js` |
| Build output | `dist` |
| Node version | `NODE_VERSION=20` |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and run `node build.js` to verify
4. Commit and push
5. Open a pull request

## License

MIT
