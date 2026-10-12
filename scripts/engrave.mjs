// Draws the engraved line-work used across the site and writes it to
// src/assets/engraving/. Everything is plain trigonometry, the same way a
// rose engine lathe makes guilloche: one wavy line, repeated with a small
// phase shift until the copies interlace.
//
//   node scripts/engrave.mjs
//
// The output is committed, so this only needs running when a pattern changes.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'engraving')
mkdirSync(OUT, { recursive: true })

const NAVY = '#0B1F3A'
const GOLD = '#C9A84C'
const BRONZE = '#8A6B1F'

const n = (v) => String(Math.round(v * 10) / 10)
const pathFrom = (pts) => 'M' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')

/** One closed wavy ring: r = R + A·cos(kθ). */
function ring(R, A, k, stepsPerLobe = 10) {
  const steps = k * stepsPerLobe
  const pts = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const r = R + A * Math.cos(k * t)
    pts.push([r * Math.cos(t), r * Math.sin(t)])
  }
  return pathFrom(pts) + 'Z'
}

/** A band of `copies` interlaced rings. Phase shifts are done by rotating one path. */
function band(id, R, A, k, copies, stroke, width) {
  const step = 360 / k / copies
  let out = `<path id="${id}" d="${ring(R, A, k)}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`
  for (let j = 1; j < copies; j++) out += `<use href="#${id}" transform="rotate(${n(step * j)})"/>`
  return out
}

/** Hypotrochoid, the spirograph curve at the heart of a rosette. */
function trochoid(R, r, d, turns, steps) {
  const pts = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns
    pts.push([
      (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t),
      (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t),
    ])
  }
  return pathFrom(pts) + 'Z'
}

function rosette(file, a, b) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">` +
    band('a', 88, 8, 30, 5, a, 0.35) +
    band('b', 70, 9, 18, 6, b, 0.35) +
    `<path d="${trochoid(60, 25, 34, 5, 420)}" fill="none" stroke="${a}" stroke-width="0.35"/>` +
    band('c', 22, 7, 12, 4, b, 0.35) +
    `<circle r="97.5" fill="none" stroke="${a}" stroke-width="0.6"/>` +
    `<circle r="79" fill="none" stroke="${b}" stroke-width="0.3"/>` +
    `</svg>`
  writeFileSync(join(OUT, file), svg)
}

/** Sine strip from -P to L+P so phase-shifted copies still cover 0..L. */
function strip(L, P, mid, A) {
  const pts = []
  for (let x = -P; x <= L + P; x += P / 16) pts.push([x, mid + A * Math.sin((x / P) * Math.PI * 2)])
  return pathFrom(pts)
}

/**
 * The certificate border, built as a 240 px tile for CSS border-image:
 * four 40 px corner squares holding small rosettes, and four 160 px edges
 * that tile cleanly because every wave period divides 160.
 */
function frame(file, ink, metal) {
  const T = 40
  const L = 160
  const S = L + 2 * T
  let edge = `<clipPath id="k"><rect width="${L}" height="${T}"/></clipPath><g id="e" clip-path="url(#k)" fill="none">`
  edge += `<path id="w1" d="${strip(L, 40, 20, 11)}" stroke="${ink}" stroke-width="0.6"/>`
  for (let j = 1; j < 8; j++) edge += `<use href="#w1" x="${j * 5}"/>`
  edge += `<path id="w2" d="${strip(L, 20, 20, 5)}" stroke="${metal}" stroke-width="0.6"/>`
  for (let j = 1; j < 4; j++) edge += `<use href="#w2" x="${j * 5}"/>`
  edge += `<path d="M0 3H${L}M0 37H${L}" stroke="${ink}" stroke-width="1.4"/>`
  edge += `<path d="M0 6H${L}M0 34H${L}" stroke="${metal}" stroke-width="0.6"/></g>`

  let corner = `<g id="c" fill="none"><rect x="3" y="3" width="34" height="34" stroke="${ink}" stroke-width="1.4"/>`
  corner += `<rect x="6" y="6" width="28" height="28" stroke="${metal}" stroke-width="0.6"/><g transform="translate(20 20)">`
  corner += band('ca', 10.5, 2.5, 10, 4, ink, 0.5)
  corner += band('cb', 5, 2.2, 6, 3, metal, 0.5)
  corner += `</g></g>`

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${edge}${corner}</defs>` +
    `<use href="#c"/><use href="#c" x="${S - T}"/><use href="#c" y="${S - T}"/><use href="#c" x="${S - T}" y="${S - T}"/>` +
    `<use href="#e" transform="translate(${T} 0)"/>` +
    `<use href="#e" transform="translate(${S} ${T}) rotate(90)"/>` +
    `<use href="#e" transform="translate(${S - T} ${S}) rotate(180)"/>` +
    `<use href="#e" transform="translate(0 ${S - T}) rotate(-90)"/>` +
    `</svg>`
  writeFileSync(join(OUT, file), svg)
}

/** Fine wavy parallel lines, the ground tint behind a banknote's lettering. */
function linework(file, stroke, opacity) {
  const W = 96
  const H = 12
  const pts = []
  for (let x = 0; x <= W; x += 4) pts.push([x, 3 + 2 * Math.sin((x / W) * Math.PI * 2)])
  const d = pathFrom(pts)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<g fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="0.6">` +
    `<path id="l" d="${d}"/><use href="#l" y="6"/><use href="#l" y="-6"/><use href="#l" y="12"/></g></svg>`
  writeFileSync(join(OUT, file), svg)
}

/**
 * Woven sisal: a plain over-and-under basket weave. Each strand is a bundle
 * of slightly uneven fibres, darker where it dips beneath its neighbour.
 */
function weave(file) {
  const C = 28 // one strand crossing
  const S = C * 2
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const tones = ['#D9C48B', '#CDB677', '#E3D2A0', '#C2A964', '#D4BE83']
  let body = `<rect width="${S}" height="${S}" fill="#CDB677"/>`
  for (let cy = 0; cy < 2; cy++) {
    for (let cx = 0; cx < 2; cx++) {
      const horizontal = (cx + cy) % 2 === 0
      let g = ''
      for (let f = 0; f < 9; f++) {
        const across = 1.6 + f * 3.1 + (rnd() - 0.5) * 0.8
        const bow = (rnd() - 0.5) * 1.6
        const tone = tones[Math.floor(rnd() * tones.length)]
        const w = n(1.6 + rnd() * 1.6)
        g += `<path d="M-1 ${n(across)}Q${C / 2} ${n(across + bow)} ${C + 1} ${n(across)}" stroke="${tone}" stroke-width="${w}"/>`
        if (f % 2 === 0) g += `<path d="M-1 ${n(across + 1.4)}Q${C / 2} ${n(across + bow + 1.4)} ${C + 1} ${n(across + 1.4)}" stroke="#7A6328" stroke-opacity="0.35" stroke-width="0.4"/>`
      }
      // shadow where the strand tucks under the crossing strands either side
      g += `<rect width="4" height="${C}" fill="#3B2C0C" fill-opacity="0.28"/><rect x="${C - 4}" width="4" height="${C}" fill="#3B2C0C" fill-opacity="0.28"/>`
      g += `<rect x="4" width="3" height="${C}" fill="#3B2C0C" fill-opacity="0.1"/><rect x="${C - 7}" width="3" height="${C}" fill="#3B2C0C" fill-opacity="0.1"/>`
      const place = horizontal
        ? `translate(${cx * C} ${cy * C})`
        : `translate(${cx * C + C} ${cy * C}) rotate(90)`
      body += `<svg x="${cx * C}" y="${cy * C}" width="${C}" height="${C}" overflow="hidden"><g fill="none" transform="${horizontal ? '' : `translate(${C} 0) rotate(90)`}">${g}</g></svg>`
      void place
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${body}</svg>`
  writeFileSync(join(OUT, file), svg)
}

rosette('rosette-gold.svg', GOLD, '#E2C47A')
rosette('rosette-ink.svg', NAVY, BRONZE)
frame('frame.svg', NAVY, BRONZE)
frame('frame-gold.svg', GOLD, '#7F92AD')
linework('linework-navy.svg', GOLD, 0.11)
linework('linework-paper.svg', NAVY, 0.07)
weave('weave.svg')
console.log('engraving written to', OUT)
