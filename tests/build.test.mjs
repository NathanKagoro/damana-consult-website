// Checks the built site rather than the source: these are the mistakes that
// only show once the page is served from a subfolder, as it is on GitHub Pages.
//
//   BASE_PATH=/damana-consult-website/ npm run build && npm test
//
// With no BASE_PATH the same checks run against a root build.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/')
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const cssFile = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.css'))
const css = readFileSync(join(dist, 'assets', cssFile), 'utf8')

/** Every local URL in an attribute or srcset: starts with "/" but is not protocol-relative. */
const localUrls = (text) =>
  [...text.matchAll(/(?:href|src|srcset|content)="([^"]*)"/gi)]
    .flatMap((m) => m[1].split(/,\s*/).map((part) => part.trim().split(/\s+/)[0]))
    .filter((u) => u.startsWith('/') && !u.startsWith('//'))

test('every root-absolute URL in the HTML sits under the base path', () => {
  const urls = localUrls(html)
  assert.ok(urls.length > 5, 'expected the page to reference its assets')
  const stray = urls.filter((u) => !u.startsWith(base))
  assert.deepEqual(stray, [])
})

test('every asset the HTML references exists in dist', () => {
  const missing = localUrls(html)
    .map((u) => u.slice(base.length).split(/[?#]/)[0])
    .filter((p) => p && !existsSync(join(dist, p)))
  assert.deepEqual(missing, [])
})

test('the stylesheet reaches its images and fonts without root-absolute paths outside the base', () => {
  const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]).filter((u) => !u.startsWith('data:'))
  assert.ok(urls.length > 5, 'expected the stylesheet to reference fonts and engraving')
  const stray = urls.filter((u) => u.startsWith('/') && !u.startsWith(base))
  assert.deepEqual(stray, [])
})

test('the page is rendered into the HTML, so content does not wait for JavaScript', () => {
  assert.match(html, /<h1[^>]*>.*Damana.*Consult Ltd.*<\/h1>/s)
  for (const id of ['experience', 'track-record', 'sisal-focus', 'services', 'contact']) {
    assert.ok(html.includes(`id="${id}"`), `section #${id} missing from the HTML`)
  }
  assert.equal((html.match(/role="row"/g) || []).length, 9, 'ledger should hold a heading row and eight engagements')
})

test('nothing starts hidden awaiting a scroll animation', () => {
  assert.doesNotMatch(css, /\.reveal\b/)
  assert.doesNotMatch(html, /class="[^"]*\breveal\b/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
})

test('the head carries a description and a link-preview image with an absolute URL', () => {
  assert.match(html, /<meta name="description" content="[^"]{80,}"/)
  assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+\/og\.jpg"/)
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/)
  assert.ok(existsSync(join(dist, 'og.jpg')), 'og.jpg missing from dist')
  assert.ok(existsSync(join(dist, '404.html')), '404.html missing from dist')
})

test('the menu button states whether it is open, and there is a way back to the portfolio', () => {
  assert.match(html, /<button[^>]*aria-expanded="false"[^>]*aria-controls="site-menu"/)
  assert.match(html, /href="https:\/\/nathankagoro\.com"/)
})

test('the estate accounts page is built, kept out of search engines, and reaches its assets under the base path', () => {
  const file = join(dist, 'estate', 'index.html')
  assert.ok(existsSync(file), 'estate/index.html missing from dist')
  const page = readFileSync(file, 'utf8')
  assert.match(page, /<meta name="robots" content="noindex, nofollow"/)
  const urls = localUrls(page)
  assert.ok(urls.length >= 2, 'expected the estate page to reference its script and stylesheet')
  assert.deepEqual(urls.filter((u) => !u.startsWith(base)), [])
  const missing = urls.map((u) => u.slice(base.length).split(/[?#]/)[0]).filter((p) => p && !existsSync(join(dist, p)))
  assert.deepEqual(missing, [])
})
