// Makes public/og.jpg, the 1200x630 link-preview image, by photographing the
// certificate on the built page. Run after a build at the root base:
//
//   npm run build && node scripts/og.mjs
import { join } from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import { address, chrome, listen, root, server } from './lib.mjs'

if (!chrome) throw new Error('Chrome not found; set CHROME_PATH')
await listen()
const browser = await puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  // 1.25x the target size, so the certificate fits; scaled down afterwards.
  await page.setViewport({ width: 1500, height: 788, deviceScaleFactor: 1 })
  await page.goto(address, { waitUntil: 'load' })
  await page.addStyleTag({ content: '.navbar,.skip-link,.hero__btn{display:none}.hero{min-height:788px;height:788px;padding:0}.hero__certificate{max-width:1180px}' })
  await page.evaluate(() => document.fonts.ready)
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1500, height: 788 } })
  const info = await sharp(png).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toFile(join(root, 'public', 'og.jpg'))
  console.log('og.jpg', Math.round(info.size / 1024) + ' KB')
} finally {
  await browser.close()
  server.close()
}
