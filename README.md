# Damana Consult Ltd — Company Website

Official website for **Damana Consult Ltd**, a Tanzanian management consulting and professional services firm based in Dar es Salaam. The site presents the company's experience, sisal operations, services, and contact information.

Live site: [damanaconsult.com](https://damanaconsult.com)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React](https://react.dev) | UI component framework |
| [Vite](https://vitejs.dev) | Build tool and dev server |
| CSS Modules (plain CSS per component) | Scoped styling |
| [Lucide React](https://lucide.dev) | Service section icons |
| [Netlify](https://netlify.com) | Hosting and deployment |

---

## Project Structure

```
src/
  App.jsx                     # Root component — assembles all page sections
  main.jsx                    # React entry point
  components/
    Navbar.jsx / .css          # Sticky nav with scroll-aware background + mobile burger menu
    Hero.jsx / .css            # Full-screen background hero with gold frame headline
    ExperienceSection.jsx/.css # Stats grid + credentials list with scroll-reveal
    TrackRecord.jsx / .css     # Horizontally scrolling project cards carousel
    SisalFocusSection.jsx/.css # Two-panel sisal cultivation & processing section
    ServicesSection.jsx / .css # 8-service icon grid
    ContactCta.jsx / .css      # Contact section with phone and email links
    Footer.jsx / .css          # Footer with brand, nav links, and copyright
    GoldFrame.jsx / .css       # Reusable decorative gold corner-bracket wrapper
  styles/
    global.css                 # CSS reset, base typography, utility classes
    tokens.css                 # Design tokens — colours, spacing, font scales
    sculpted.css               # Shared sculpted-panel dark background style
public/
  plantation-overview.jpg      # Hero background image
  hillside-plantation.jpg      # Sisal cultivation panel image
  fiber-drying.jpg             # Sisal processing panel image
  logo.svg                     # Damana Consult logo
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & run locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with hot module replacement.

### Build for production

```bash
npm run build
```

Output is written to `dist/`. Netlify picks this up automatically on every push to `main`.

### Preview production build locally

```bash
npm run preview
```

---

## Deployment

The site is deployed on **Netlify** with automatic deploys from the `main` branch. No additional configuration is required — `vite.config.js` and the `dist/` output are sufficient.

Custom domain: `damanaconsult.com` (DNS managed via Netlify nameservers).

---

## Design System

The visual identity is built around a dark sculpted aesthetic with gold accents:

- **Tokens** — defined in `src/styles/tokens.css` (gold palette, navy backgrounds, type scale)
- **Scroll-reveal** — elements carry a `.reveal` class; an `IntersectionObserver` in each section adds `.visible` when they enter the viewport, triggering CSS transitions
- **Staggered delays** — `.reveal-delay-1` through `.reveal-delay-4` offset animations within a section
- **GoldFrame** — a reusable component that renders four CSS corner brackets around any content block
- **`sculpted-panel`** — shared dark inset panel style imported from `sculpted.css`

---

## Contact

**Damana Consult Ltd**  
Dar es Salaam, Tanzania  
info@damanaconsult.com
