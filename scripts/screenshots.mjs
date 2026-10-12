// Serves dist/ under BASE_PATH and photographs the page at the three widths
// the site is checked at. Used by CI; also handy locally.
//
//   BASE_PATH=/damana-consult-website/ npm run build
//   BASE_PATH=/damana-consult-website/ node scripts/screenshots.mjs
//
// Needs Chrome. Set CHROME_PATH if it is not in one of the usual places.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'
import { address, chrome, listen, root, server } from './lib.mjs'

const out = join(root, 'shots')
await listen()
if (!chrome) throw new Error('Chrome not found; set CHROME_PATH')

mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox'] })
let failed = false
try {
  for (const [width, height] of [[1440, 900], [390, 844], [360, 740]]) {
    const page = await browser.newPage()
    const problems = []
    page.on('pageerror', (e) => problems.push(`script error: ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`))
    page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`))
    await page.setViewport({ width, height, deviceScaleFactor: 1 })
    await page.goto(address, { waitUntil: 'load', timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    // Lazy images only load once scrolled to; walk the page so the full shot is complete.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), { timeout: 10000 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 0) problems.push(`horizontal overflow of ${overflow}px`)
    await page.screenshot({ path: join(out, `${width}-top.png`) })
    await page.screenshot({ path: join(out, `${width}-full.png`), fullPage: true })
    console.log(`${width}px`, problems.length ? problems.join('; ') : 'ok')
    if (problems.length) failed = true
    await page.close()
  }
} finally {
  await browser.close()
  server.close()
}
if (failed) process.exit(1)
