// One-off asset preparation. Outputs are committed; rerun only when a source changes.
//
//   node scripts/assets.mjs <folder holding the original JPEGs>
//
// The JPEG originals are on the main branch under public/.
//
// - photographs -> WebP at the widths the layout actually uses
// - src/assets/logo.svg -> favicon PNGs cropped to the monogram
// - fonts       -> WOFF2 subsets holding only the characters the page sets in them
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import subsetFont from 'subset-font'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = process.argv[2]
if (!src) throw new Error('give the folder that holds the original images')

const photos = join(root, 'src', 'assets', 'photos')
const fonts = join(root, 'src', 'assets', 'fonts')
mkdirSync(photos, { recursive: true })
mkdirSync(fonts, { recursive: true })

const webp = async (name, widths, quality = 72) => {
  for (const w of widths) {
    const info = await sharp(join(src, `${name}.jpg`)).resize({ width: w, withoutEnlargement: true }).webp({ quality }).toFile(join(photos, `${name}-${w}.webp`))
    console.log(`${name}-${w}.webp`, Math.round(info.size / 1024) + ' KB')
  }
}
await webp('plantation-overview', [480, 960])
await webp('hillside-plantation', [480, 960])
await webp('fiber-drying', [480, 960])

// The monogram sits in the upper middle of the 820x390 logo artwork.
const mark = { left: 190, top: 5, width: 440, height: 305 }
const big = await sharp(join(root, 'src', 'assets', 'logo.svg'), { density: 288 }).resize(3280).png().toBuffer()
const crop = (size) =>
  sharp(big)
    .extract({ left: mark.left * 4, top: mark.top * 4, width: mark.width * 4, height: mark.height * 4 })
    .flatten({ background: '#ffffff' })
    .resize(size, size, { fit: 'contain', background: '#ffffff' })
    .png({ compressionLevel: 9, palette: true })
await crop(48).toFile(join(root, 'public', 'favicon.png'))
await crop(180).toFile(join(root, 'public', 'apple-touch-icon.png'))

const basic = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:&+-–—\'’()/@©·←'
const subset = async (pkg, file, out, text) => {
  const buf = readFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file))
  const res = await subsetFont(buf, text, { targetFormat: 'woff2' })
  writeFileSync(join(fonts, out), res)
  console.log(out, Math.round(res.length / 1024) + ' KB')
}
await subset('bodoni-moda', 'bodoni-moda-latin-600-normal.woff2', 'bodoni-moda-600.woff2', basic)
await subset('old-standard-tt', 'old-standard-tt-latin-400-normal.woff2', 'old-standard-400.woff2', basic)
await subset('old-standard-tt', 'old-standard-tt-latin-400-italic.woff2', 'old-standard-400-italic.woff2', basic)
await subset('pinyon-script', 'pinyon-script-latin-400-normal.woff2', 'pinyon-script-400.woff2', basic)
