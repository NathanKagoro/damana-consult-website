// Shared by screenshots.mjs and og.mjs: a static server for dist/ and the path to Chrome.
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
export const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/')
export const port = Number(process.env.PORT || 4319)
export const address = `http://127.0.0.1:${port}${base}`

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
}

export const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (!url.startsWith(base)) {
    res.writeHead(404).end('outside base')
    return
  }
  let file = normalize(join(dist, url.slice(base.length)))
  if (!file.startsWith(dist)) return void res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) return void res.writeHead(404, { 'content-type': types['.html'] }).end(readFileSync(join(dist, '404.html')))
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }).end(readFileSync(file))
})
export const listen = () => new Promise((r) => server.listen(port, '127.0.0.1', r))


export const chrome = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p))
