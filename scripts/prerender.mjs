// Writes the rendered page into dist/index.html so that the content is in the
// HTML itself and does not wait for JavaScript. Also writes a 404 page.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { render } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href)

const file = join(root, 'dist', 'index.html')
const html = readFileSync(file, 'utf8')
if (!html.includes('<!--app-->')) throw new Error('index.html has lost its <!--app--> marker')
writeFileSync(file, html.replace('<!--app-->', render()))

const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/')
writeFileSync(
  join(root, 'dist', '404.html'),
  `<!doctype html><html lang="en-GB"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | Damana Consult Ltd</title><meta name="robots" content="noindex"><link rel="icon" type="image/png" href="${base}favicon.png"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B1F3A;color:#EFE6CF;font:1.125rem/1.6 Georgia,serif;text-align:center;padding:1.5rem}h1{font-size:1.5rem;letter-spacing:.12em;text-transform:uppercase;font-weight:400;color:#E2C47A}a{color:#E2C47A;display:inline-block;padding:.75rem 0}</style></head><body><main><h1>No such page</h1><p>This address is not entered in our register.</p><p><a href="${base}">Return to Damana Consult Ltd</a></p></main></body></html>\n`,
)
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log('prerendered dist/index.html and dist/404.html')
