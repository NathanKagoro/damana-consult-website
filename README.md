# Damana Consult Ltd website

The website of Damana Consult Ltd, a management consulting and audit firm in Dar es Salaam, Tanzania, which also grows and processes sisal. The main page covers who the firm is, a register of past engagements, its sisal operations, its services, and how to reach it.

A second page, `/estate/`, holds the Damana Estate farm accounts: an expected-expenses calendar for the sisal farm and an expense log that is kept in an Excel file. It is not linked from the main page and asks search engines not to index it, but like everything on GitHub Pages it can be opened by anyone who has the address.

- Production site: [damanaconsultant.com](https://damanaconsultant.com)
- Preview of this repository: [nathankagoro.github.io/damana-consult-website](https://nathankagoro.github.io/damana-consult-website/) (GitHub Pages, built from `main`)

The preview is a copy for review. Nothing in this repository deploys to the firm's own domain.

## What is real

Everything the page says about the firm is the firm's own: its name and logo, the figures (20+ years, 300+ engagements, 8 sectors, 15+ staff), the credentials, the eight engagements in the ledger, the services, the three photographs of its sisal operations, the phone numbers, the email address and the office address. None of it is placeholder or sample content.

What was made for the design, and carries no claim: the guilloche borders, rosettes, gold seal, ledger ruling, woven sisal texture and the eight small service glyphs. The seal is an ornament drawn for this page, not a reproduction of the company's registered seal.

## The design

The page is set as an engraved share certificate and an audit ledger, in the firm's navy and gold.

- The opening screen is a certificate on bond paper with a guilloche border, a vignette of the plantation and a gold wafer seal.
- The four headline figures sit in lathe-work counters, as a denomination does on a banknote.
- Past engagements are lines in a ledger, with the year in the margin left of the red rule. It is a plain vertical register, so there is nothing to scroll sideways.
- The sisal section sits on a woven sisal texture.
- The footer is the counterfoil, with a row of perforations along its top.

Nothing moves on its own. Content is visible as soon as it is painted; there are no scroll-triggered reveals. `prefers-reduced-motion` switches off the few hover transitions and smooth scrolling.

All line-work is drawn by a script, not by hand: `scripts/engrave.mjs` writes the SVG files in `src/assets/engraving/` from a few lines of trigonometry (a wavy ring, repeated with a small rotation until the copies interlace).

## Stack

| Tool | Use |
| --- | --- |
| React 19 | Components. The only state is whether the small-screen menu is open. |
| Vite 8 | Build and dev server |
| Plain CSS, one file per component | Styling |
| Node's built-in test runner | Checks on the built site |

No icon library, CSS framework or web-font service is loaded. Fonts (Bodoni Moda, Old Standard TT, Pinyon Script, all under the SIL Open Font License) are self-hosted WOFF2 subsets.

The build renders the page to HTML ahead of time (`scripts/prerender.mjs`), so the content is in `index.html` and does not wait for JavaScript. React then attaches the menu behaviour.

## Layout of the repository

```
index.html                    head, meta tags, link-preview tags
vite.config.js                base path and site URL from the environment
public/                       favicon, touch icon, og.jpg (link-preview image)
src/
  App.jsx, main.jsx           page assembly and entry point
  entry-server.jsx            entry used to render the page at build time
  components/                 Navbar, Hero, Seal, ExperienceSection, TrackRecord (the ledger),
                              SisalFocusSection, ServicesSection, Glyph, ContactCta, Footer
  styles/global.css           fonts, colours, paper and certificate surfaces, lettering
  assets/engraving/           generated SVG: frame, rosettes, line-work, weave
  assets/photos/              WebP photographs at 480 and 960 px
  assets/fonts/               subsetted WOFF2
  assets/logo.svg             the firm's logo
scripts/
  engrave.mjs                 draws the engraving SVGs
  assets.mjs                  makes the WebP photos, favicons and font subsets
  prerender.mjs               writes the rendered page and 404.html into dist/
  screenshots.mjs             photographs the built page at 1440, 390 and 360 px
  og.mjs                      makes public/og.jpg from the built page
tests/build.test.mjs          checks on the built site
estate/index.html             the estate accounts page
src/estate/                   its script, styles and expected-expense data (items.json)
```

## Run, build, test

Needs Node 20 or newer.

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # production build in dist/
npm test             # 7 checks on what is in dist/
npm run preview      # serve dist/ locally
```

The site can be served from the root of a domain or from a subfolder. Two environment variables control this at build time:

| Variable | Default | Meaning |
| --- | --- | --- |
| `BASE_PATH` | `/` | Folder the site is served from |
| `SITE_URL` | `https://damanaconsultant.com/` | Public address, used for the link-preview image URL |

To build and check it exactly as GitHub Pages serves it:

```bash
BASE_PATH=/damana-consult-website/ SITE_URL=https://nathankagoro.github.io/damana-consult-website/ npm run build
BASE_PATH=/damana-consult-website/ npm test
BASE_PATH=/damana-consult-website/ npm run screenshots   # needs Chrome; writes shots/
```

In Git Bash on Windows, prefix those with `MSYS2_ENV_CONV_EXCL=BASE_PATH` so the shell does not rewrite the leading slash into a Windows path.

The tests read the built files. They check that every asset URL sits under the base path and exists, that the page content is in the HTML, that nothing is hidden awaiting a scroll animation, and that the description, link-preview image, menu state and 404 page are present.

Regenerating assets (only needed if a pattern, photo or font changes):

```bash
npm run engrave                          # the SVG line-work
node scripts/assets.mjs <folder>         # WebP, favicons, font subsets; <folder> holds the original JPEGs
npm run build && node scripts/og.mjs     # the link-preview image
```

The original JPEG photographs are in `public/` on the `main` branch.

## Estate accounts page

- **Expected figures** come from `src/estate/items.json`: each regular farm cost with a typical amount, how often it occurs, an expected yearly total and the share of that total falling in each month. They were worked out from the estate's 2021–2026 cashbook. The log starts in October 2026, the month after the cashbook ends, so the calendar shows twelve months at a time from there and never shows the cashbook's months as empty.
- **Logging** happens in the browser; there is no server. Each expense can carry a quantity and unit (acres, litres, meta…), so the page shows the real cost per unit against the expected rate, and can be linked to a harvest batch.
- **Harvest batches** record a harvest from cutting to sale: meta cut, dry fibre produced, fibre lost and why, fibre sold with price and buyer, and short fibre (*biashi*) sold. With the costs linked to it, each batch shows cost per meta and per kilo, loss rate, revenue, profit and break-even price, against the cashbook benchmarks (15 kg of fibre per meta; processing ≈ 43,700 TZS per meta).
- Everything is kept in the browser's storage and written into an `.xlsx` with four sheets: Logged expenses, Harvest batches, By month, and Expected by month.
- **Keeping the Excel file in step:** in Chrome or Edge on a computer, *Create new file* or *Open existing file* connects a workbook, and every entry saved or deleted afterwards is written straight into it. In other browsers, *Download* saves the workbook and *Open existing file* loads one back.
- **On phones** the page is shorter: explanations are hidden, the calendar is a compact grid, and the line-by-line table starts folded. A *How to use* button opens a four-step guide that can jump to each part of the page.
- The page uses the site's original theme (Cormorant Garamond and Inter, self-hosted through Fontsource) and SheetJS (`xlsx`) for the workbook.

## Hosting

- **Preview:** `.github/workflows/pages.yml` builds with `BASE_PATH=/damana-consult-website/` and publishes `dist/` to GitHub Pages on every push to `main`. Pages must be switched on once in the repository: Settings → Pages → Source: GitHub Actions.
- **Production:** build with the defaults (`npm run build`) and publish `dist/` to the host that serves damanaconsultant.com. That step is done by hand and is not automated here.
- **CI:** `.github/workflows/ci.yml` runs on every push and pull request. It builds for the subfolder, runs the tests, and uploads screenshots at 1440, 390 and 360 px as an artifact.

## Contact

Damana Consult Ltd, 4th Floor, Uhuru Financial Tower, Samora Avenue, Dar es Salaam, Tanzania
info@damanaconsult.com
