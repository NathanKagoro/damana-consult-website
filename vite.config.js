import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is the folder the site is served from. The default, "/", is the
// client's own domain. The GitHub Pages preview sets "/damana-consult-website/".
// SITE_URL is the public address, needed because link previews (Open Graph)
// only accept absolute image URLs.
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/')
const siteUrl = (process.env.SITE_URL || 'https://damanaconsultant.com/').replace(/\/?$/, '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl).replaceAll('%BASE%', base),
    },
  ],
  build: {
    // Small engraving SVGs stay as files: they are reused across sections and cache better than inlined copies.
    assetsInlineLimit: 1024,
  },
})
