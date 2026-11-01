// Damana Estate accounts: an expected-expenses calendar built from the
// 2021–2026 cashbook, an expense log with quantities, and harvest batches
// that tie processing costs to what was cut, lost and sold.
//
// The page is static (GitHub Pages), so there is no server to save to.
// Everything is kept in this browser (localStorage) and written into an .xlsx:
// - Chrome and Edge on a computer can connect a file once; each change made
//   afterwards is written straight into it (File System Access API).
// - Elsewhere, "Download" saves the workbook and "Open existing file" loads
//   one back in.
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './estate.css'
import * as XLSX from 'xlsx'
import ITEMS from './items.json'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT = MONTHS.map((m) => m.slice(0, 3))
const STORE = 'damana-estate-log-v1'
const BATCH_STORE = 'damana-estate-batches-v1'
const FILE_NAME = 'Damana_Estate_Expense_Log.xlsx'
const OTHER = {
  debt: { group: 'Other', name: 'Debt repayment', unit: '', rate: 0 },
  capital: { group: 'Other', name: 'Equipment / construction', unit: '', rate: 0 },
  other: { group: 'Other', name: 'Other', unit: '', rate: 0 },
}

// Benchmarks for a harvest batch, from the cashbook: the May 2025 batch gave
// 15 kg of dry fibre per meta and sold at 2,300 TZS per kg. Processing is the
// per-meta steps in items.json plus the cart, which is hired by the day and
// came to about 4,000 TZS per meta (≈43,700 per meta in all).
const BENCH = {
  yield: 15,
  price: 2300,
  perMeta: ITEMS.filter((it) => it.unit === 'meta').reduce((s, it) => s + it.rate, 0) + 4000,
}

// The log starts in October 2026, the first month after the cashbook ends.
// Months before it are in the cashbook, so the calendar only looks forward.
const START = { y: 2026, m: 9 }
const idx = (y, m) => (y - START.y) * 12 + (m - START.m)
const ym = (i) => ({ y: START.y + Math.floor((START.m + i) / 12), m: (START.m + i) % 12 })
const label = (i) => `${MONTHS[ym(i).m]} ${ym(i).y}`

const now = new Date()
const nowIdx = Math.max(0, idx(now.getFullYear(), now.getMonth()))
let win = Math.floor(nowIdx / 12) // which run of twelve months is shown
let sel = nowIdx // selected month, counted from October 2026
let entries = load(STORE, (e) => e && e.id && e.date && e.amount)
let batches = load(BATCH_STORE, (b) => b && b.id && b.start)
let handle = null // connected Excel file, where the browser supports it
let editing = null // id of the batch open in the form

const $ = (id) => document.getElementById(id)
const fmt = (n) => Math.round(n).toLocaleString('en-US')
const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('en-US')
const short = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n)))
const pct = (n) => `${Math.round(n * 1000) / 10}%`
const num = (v) => +String(v ?? '').replace(/[^\d.]/g, '') || 0
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const expected = (it, m) => it.perYear * it.w[m]
const monthExpected = (m) => ITEMS.reduce((s, it) => s + expected(it, m), 0)
const yearExpected = ITEMS.reduce((s, it) => s + it.perYear, 0)
const byId = Object.fromEntries(ITEMS.map((it) => [it.id, it]))
const byName = Object.fromEntries([...ITEMS, ...Object.entries(OTHER).map(([id, o]) => ({ id, ...o }))].map((it) => [it.name.toLowerCase(), it.id]))
const itemInfo = (id) => byId[id] || OTHER[id] || OTHER.other
const inMonth = (e, y, m) => +e.date.slice(0, 4) === y && +e.date.slice(5, 7) - 1 === m
const loggedIn = (y, m) => entries.filter((e) => inMonth(e, y, m))
const sum = (a) => a.reduce((s, e) => s + (+e.amount || 0), 0)
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2))
const pad = (n) => String(n).padStart(2, '0')
const dayMonth = (d) => (d ? `${+d.slice(8, 10)} ${SHORT[+d.slice(5, 7) - 1]}` : '')
const batchById = (id) => batches.find((b) => b.id === id)

// "litre" → "litres"; meta and miraba stay as they are; mraba → miraba.
function units(u, n) {
  if (!u) return ''
  if (n === 1 || u === 'meta' || u === 'kg' || /s$/.test(u) || u === 'miraba') return u
  if (u === 'mraba') return 'miraba'
  return u + 's'
}
const unitKey = (u) => {
  const v = String(u || '').trim().toLowerCase()
  if (v === 'miraba') return 'mraba'
  return v.replace(/s$/, '')
}

function load(key, ok) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v.filter(ok) : []
  } catch {
    return []
  }
}
function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify(entries))
    localStorage.setItem(BATCH_STORE, JSON.stringify(batches))
  } catch {
    /* storage blocked: the Excel file is still the record */
  }
}

// ── form options ──
;(function fillSelect() {
  const sel = $('f-item')
  sel.append(new Option('Choose an expense…', ''))
  const groups = {}
  ITEMS.forEach((it) => (groups[it.group] ||= []).push(it))
  for (const [g, list] of Object.entries(groups)) {
    const og = document.createElement('optgroup')
    og.label = g
    list.forEach((it) => og.append(new Option(it.name, it.id)))
    sel.append(og)
  }
  const og = document.createElement('optgroup')
  og.label = 'Not in the regular list'
  Object.entries(OTHER).forEach(([id, o]) => og.append(new Option(id === 'capital' ? 'Equipment / construction (one-off)' : o.name, id)))
  sel.append(og)
})()

// The batch picker lists open batches first. Processing costs default to the
// most recent open batch.
function batchCode(b) {
  return `${b.code}${b.block ? ' · ' + b.block : ''}`
}
function fillBatchSelect() {
  const s = $('f-batch')
  const keep = s.value
  s.textContent = ''
  s.append(new Option('Not linked to a harvest', ''))
  const open = batches.filter((b) => econ(b).status !== 'Sold').sort((a, b) => b.start.localeCompare(a.start))
  const done = batches.filter((b) => econ(b).status === 'Sold').sort((a, b) => b.start.localeCompare(a.start))
  open.forEach((b) => s.append(new Option(batchCode(b), b.id)))
  if (done.length) {
    const og = document.createElement('optgroup')
    og.label = 'Sold batches'
    done.forEach((b) => og.append(new Option(batchCode(b), b.id)))
    s.append(og)
  }
  if ([...s.options].some((o) => o.value === keep)) s.value = keep
}

function resetDate() {
  const { y, m } = ym(sel)
  const d = sel === idx(now.getFullYear(), now.getMonth()) ? now : new Date(y, m, 1)
  $('f-date').value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// When an expense is chosen: suggest its unit, and for processing costs the
// latest open harvest batch.
$('f-item').addEventListener('change', () => {
  const info = itemInfo($('f-item').value)
  $('f-unit').value = info.unit ? units(info.unit, 2) : ''
  if (info.group === 'Sisal processing' && !$('f-batch').value) {
    const open = batches.filter((b) => econ(b).status !== 'Sold').sort((a, b) => b.start.localeCompare(a.start))
    if (open[0]) $('f-batch').value = open[0].id
  }
  rateHint()
})
// Live cost per unit while typing, next to the expected rate.
function rateHint() {
  const info = itemInfo($('f-item').value)
  const amount = num($('f-amt').value)
  const qn = num($('f-qn').value)
  const u = $('f-unit').value.trim()
  const out = $('f-rate')
  out.className = 'rate-hint'
  if (!amount || !qn) {
    out.textContent = info.rate ? `Expected rate ≈ ${fmt(info.rate)} per ${info.unit}` : ''
    return
  }
  const r = amount / qn
  const same = info.rate && unitKey(u) === unitKey(info.unit)
  out.textContent = `${fmt(r)} per ${unitKey(u) || 'unit'}${same ? ` · expected ≈ ${fmt(info.rate)}` : ''}`
  if (same) out.classList.add(r > info.rate * 1.1 ? 'over' : r < info.rate * 0.9 ? 'under' : 'ok')
}
;['f-amt', 'f-qn', 'f-unit'].forEach((id) => $(id).addEventListener('input', rateHint))

// ── harvest economics ──
function econ(b) {
  const costs = entries.filter((e) => e.batch === b.id)
  const total = sum(costs)
  const meta = +b.meta || 0
  const produced = +b.kg || 0
  const lost = +b.lost || 0
  const good = Math.max(0, produced - lost)
  const sold = +b.sold || 0
  const store = Math.max(0, good - sold)
  const fibreRev = sold * (+b.price || 0)
  const towRev = (+b.tow || 0) * (+b.towPrice || 0)
  const revenue = fibreRev + towRev
  const steps = {}
  costs.forEach((e) => (steps[e.item] = (steps[e.item] || 0) + (+e.amount || 0)))
  const status = sold && !store ? 'Sold' : sold ? 'Part sold' : good ? 'In store' : produced ? 'Processing' : meta ? 'Cutting' : 'Started'
  return {
    costs, total, meta, produced, lost, good, sold, store, revenue, towRev, steps, status,
    perMeta: meta ? total / meta : 0,
    perKg: produced ? total / produced : 0,
    perKgSold: sold ? total / sold : 0,
    yield: meta && produced ? produced / meta : 0,
    loss: produced ? lost / produced : 0,
    profit: revenue - total,
    breakEven: good ? (total - towRev) / good : 0,
    price: +b.price || 0,
  }
}

function renderHarvests() {
  const list = $('hv-list')
  const tot = $('hv-totals')
  list.textContent = ''
  tot.textContent = ''
  if (!batches.length) {
    list.innerHTML = '<p class="hv-empty">No harvest batches yet. Start one when cutting begins, then link cutting, decorticating, washing and transport costs to it as you log them.</p>'
    return
  }
  // all batches together
  const E = batches.map(econ)
  const T = E.reduce((a, e) => ({ meta: a.meta + e.meta, produced: a.produced + e.produced, lost: a.lost + e.lost, sold: a.sold + e.sold, revenue: a.revenue + e.revenue, total: a.total + e.total, fibreRev: a.fibreRev + (e.revenue - e.towRev) }), { meta: 0, produced: 0, lost: 0, sold: 0, revenue: 0, total: 0, fibreRev: 0 })
  const tiles = [
    ['Meta cut', T.meta ? fmt1(T.meta) : '–'],
    ['Fibre produced', T.produced ? `${fmt(T.produced)} kg` : '–'],
    ['Lost', T.produced ? pct(T.lost / T.produced) : '–'],
    ['Cost per kg sold', T.sold ? fmt(T.total / T.sold) : '–'],
    ['Average price per kg', T.sold ? fmt(T.fibreRev / T.sold) : '–'],
    ['Profit on harvests', T.revenue || T.total ? (T.revenue - T.total < 0 ? `(${short(T.total - T.revenue)})` : short(T.revenue - T.total)) : '–'],
  ]
  tiles.forEach(([k, v], i) => {
    const li = document.createElement('li')
    li.innerHTML = `<b class="num"></b><span></span>`
    li.querySelector('b').textContent = v
    li.querySelector('span').textContent = k
    if (i === 5 && T.revenue - T.total < 0) li.classList.add('neg')
    tot.append(li)
  })

  batches
    .slice()
    .sort((a, b) => b.start.localeCompare(a.start))
    .forEach((b) => {
      const e = econ(b)
      const card = document.createElement('article')
      card.className = 'hv-card'
      const cmp = (actual, bench, lowerIsGood) => {
        if (!actual || !bench) return ''
        const better = lowerIsGood ? actual <= bench : actual >= bench
        return `<em class="${better ? 'under' : 'over'}">expected ${fmt(bench)}</em>`
      }
      const flow = [
        ['Meta cut', e.meta ? fmt1(e.meta) : '–', ''],
        ['Dry fibre', e.produced ? `${fmt(e.produced)} kg` : '–', e.yield ? `<em class="${e.yield >= BENCH.yield ? 'under' : 'over'}">${fmt1(e.yield)} kg per meta · expected ${BENCH.yield}</em>` : ''],
        ['Lost', e.produced ? `${fmt(e.lost)} kg` : '–', e.lost ? `<em class="over">${pct(e.loss)}${b.why ? ' · ' + esc(b.why) : ''}</em>` : ''],
        ['Sold', e.sold ? `${fmt(e.sold)} kg` : '–', e.sold && e.price ? `<em>at ${fmt(e.price)} per kg${b.buyer ? ' · ' + esc(b.buyer) : ''}</em>` : e.store ? `<em>${fmt(e.store)} kg in store</em>` : ''],
      ]
      const money = [
        ['Costs linked', e.total ? fmt(e.total) : '–', `<em>${e.costs.length} ${e.costs.length === 1 ? 'entry' : 'entries'}</em>`],
        ['Cost per meta', e.perMeta ? fmt(e.perMeta) : '–', cmp(e.perMeta, BENCH.perMeta, true)],
        ['Cost per kg', e.perKg ? fmt(e.perKg) : '–', e.perKgSold ? `<em>${fmt(e.perKgSold)} per kg sold</em>` : ''],
        ['Revenue', e.revenue ? fmt(e.revenue) : '–', e.towRev ? `<em>incl. ${fmt(e.towRev)} short fibre</em>` : ''],
        ['Profit / (loss)', e.revenue ? (e.profit < 0 ? `(${fmt(-e.profit)})` : fmt(e.profit)) : '–', e.revenue && e.sold ? `<em>${e.profit / e.sold < 0 ? '(' + fmt(-e.profit / e.sold) + ')' : fmt(e.profit / e.sold)} per kg sold</em>` : ''],
        ['Break-even price', e.breakEven ? `${fmt(e.breakEven)} / kg` : '–', e.breakEven && e.price ? `<em class="${e.price >= e.breakEven ? 'under' : 'over'}">selling at ${fmt(e.price)}</em>` : ''],
      ]
      const cell = ([k, v, sub], cls) => `<div class="${cls || ''}"><dt>${k}</dt><dd class="num">${v}</dd>${sub ? `<dd class="sub">${sub}</dd>` : ''}</div>`
      const steps = Object.entries(e.steps).sort((a, b) => b[1] - a[1])
      card.innerHTML = `
        <header class="hv-head">
          <div><p class="script">${esc(b.code)} · from ${dayMonth(b.start)} ${b.start.slice(0, 4)}</p><h3 class="engraved">${esc(b.block || 'Harvest batch')}</h3></div>
          <span class="chip chip--${e.status.toLowerCase().replace(' ', '-')}">${e.status}</span>
        </header>
        <dl class="hv-flow">${flow.map((c) => cell(c)).join('')}</dl>
        <dl class="hv-money">${money.map((c) => cell(c)).join('')}</dl>
        ${steps.length ? `<details class="more hv-steps"><summary>Cost by step · ${steps.length}</summary><table class="lg"><thead><tr><th>Step</th><th class="r">Cost</th><th class="r">Per meta</th><th class="r">Share</th></tr></thead><tbody>${steps.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r">${fmt(v)}</td><td class="r">${e.meta ? fmt(v / e.meta) : '–'}</td><td class="r">${pct(v / e.total)}</td></tr>`).join('')}</tbody></table></details>` : '<p class="hint">No costs linked yet. Choose this batch under Harvest batch when you log cutting, decorticating, washing or transport.</p>'}
        ${b.notes ? `<p class="hint">${esc(b.notes)}</p>` : ''}
        <div class="hv-actions"><button class="ghost" type="button" data-act="edit">Update batch</button><button class="del" type="button" data-act="del">Delete</button></div>`
      card.querySelector('[data-act="edit"]').addEventListener('click', () => openBatch(b.id))
      const del = card.querySelector('[data-act="del"]')
      del.addEventListener('click', async () => {
        if (!del.classList.contains('confirm')) {
          del.classList.add('confirm')
          del.textContent = 'Confirm delete'
          setTimeout(() => {
            del.classList.remove('confirm')
            del.textContent = 'Delete'
          }, 4000)
          return
        }
        batches = batches.filter((x) => x.id !== b.id)
        entries = entries.map((x) => (x.batch === b.id ? { ...x, batch: '' } : x))
        persist()
        renderAll()
        await sync()
      })
      list.append(card)
    })
}

// ── batch form ──
const bd = $('bd')
const BF = { start: 'b-start', meta: 'b-meta', block: 'b-block', kg: 'b-kg', lost: 'b-lost', why: 'b-why', sold: 'b-sold', price: 'b-price', buyer: 'b-buyer', saleDate: 'b-sdate', tow: 'b-tow', towPrice: 'b-towp', notes: 'b-notes' }
const NUMERIC = ['meta', 'kg', 'lost', 'sold', 'price', 'tow', 'towPrice']
function openBatch(id) {
  editing = id || null
  const b = id ? batchById(id) : null
  $('bd-kicker').textContent = b ? `${b.code} · update` : 'New batch'
  $('bd-title').textContent = b ? b.block || 'Harvest batch' : 'Harvest batch'
  for (const [k, el] of Object.entries(BF)) {
    const v = b ? b[k] : ''
    $(el).value = v === undefined || v === null || v === 0 ? '' : NUMERIC.includes(k) ? fmt1(v) : v
  }
  if (!b) $('b-start').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  $('b-status').textContent = ''
  bd.showModal()
}
$('hv-new').addEventListener('click', () => openBatch(null))
$('b-cancel').addEventListener('click', () => bd.close())
$('bd-close').addEventListener('click', () => bd.close())
bd.addEventListener('click', (e) => {
  if (e.target === bd) bd.close()
})
$('bf').addEventListener('submit', async (ev) => {
  ev.preventDefault()
  const st = $('b-status')
  const v = {}
  for (const [k, el] of Object.entries(BF)) v[k] = NUMERIC.includes(k) ? num($(el).value) : $(el).value.trim()
  const fail = (t) => {
    st.textContent = t
    st.className = 'status err'
  }
  if (!v.start) return fail('Add the date cutting started.')
  if (v.lost > v.kg && v.kg) return fail('Lost fibre cannot be more than the fibre produced.')
  if (v.sold > v.kg - v.lost && v.kg) return fail(`Sold is more than the ${fmt(v.kg - v.lost)} kg left after losses. Check the figures.`)
  if (v.sold && !v.price) return fail('Add the price per kg for the fibre sold.')
  if (editing) {
    batches = batches.map((b) => (b.id === editing ? { ...b, ...v } : b))
  } else {
    const n = batches.reduce((m, b) => Math.max(m, +String(b.code).replace(/\D/g, '') || 0), 0) + 1
    batches.push({ id: newId(), code: `H${n}`, ...v, createdAt: new Date().toISOString() })
  }
  persist()
  bd.close()
  renderAll()
  await sync()
})

// ── render ──
function render() {
  const { y: year, m: month } = ym(sel)
  const first = win * 12
  $('yr').textContent = `${SHORT[ym(first).m]} ${ym(first).y} – ${SHORT[ym(first + 11).m]} ${ym(first + 11).y}`
  $('yr-prev').disabled = win === 0
  const exp = monthExpected(month)
  const logs = loggedIn(year, month)
  const lg = sum(logs)
  $('sum-month').textContent = `${MONTHS[month]} ${year}`
  $('c-exp').textContent = short(exp)
  $('c-log').textContent = lg ? short(lg) : '0'
  const d = $('c-diff')
  if (lg) {
    const left = exp - lg
    d.textContent = left >= 0 ? `${short(left)} below expected` : `${short(-left)} over expected`
    d.className = left >= 0 ? 'under' : 'over'
  } else {
    d.textContent = 'nothing logged yet'
    d.className = ''
  }
  $('c-ylog').textContent = short(sum(entries.filter((e) => { const i = idx(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1); return i >= first && i < first + 12 })))
  $('c-yexp').textContent = short(yearExpected)

  // calendar
  const cal = $('cal')
  cal.textContent = ''
  for (let i = first; i < first + 12; i++) {
    const { y, m } = ym(i)
    const e = monthExpected(m)
    const l = sum(loggedIn(y, m))
    const peaks = ITEMS.filter((it) => it.w[m] > 0.13 && expected(it, m) >= 60000)
      .sort((a, b) => expected(b, m) - expected(a, m))
      .slice(0, 3)
      .map((it) => it.name)
    const li = document.createElement('li')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mo'
    b.setAttribute('aria-pressed', i === sel ? 'true' : 'false')
    const isNow = i === idx(now.getFullYear(), now.getMonth())
    b.setAttribute('aria-label', `${MONTHS[m]} ${y}: ${fmt(e)} expected, ${l ? fmt(l) + ' logged' : 'nothing logged'}`)
    b.innerHTML = `<span class="mname"><span class="full">${MONTHS[m]} ${y}</span><span class="abbr">${SHORT[m]} ${String(y).slice(2)}</span>${isNow ? '<span class="now">this month</span>' : ''}</span>
      <span class="exp num"><span class="full">${fmt(e)}</span><span class="abbr">${short(e)}</span><em>expected</em></span>
      <span class="bar" aria-hidden="true"><i style="width:${Math.min(100, (l / e) * 100)}%"${l > e ? ' class="over"' : ''}></i></span>
      <span class="logged num">${l ? fmt(l) + ' logged' : 'Nothing logged'}</span>
      <span class="peaks">${peaks.length ? peaks.join(' · ') : 'Steady running costs only'}</span>`
    b.addEventListener('click', () => {
      sel = i
      resetDate()
      render()
    })
    li.append(b)
    cal.append(li)
  }

  // month detail: expected against logged, with the real cost per unit
  $('det-script').textContent = `${MONTHS[month]} ${year}`
  const body = $('det-body')
  body.textContent = ''
  const loggedBy = {}
  const qtyBy = {}
  logs.forEach((e) => {
    loggedBy[e.itemId] = (loggedBy[e.itemId] || 0) + (+e.amount || 0)
    const info = itemInfo(e.itemId)
    if (e.qn && info.unit && unitKey(e.unit) === unitKey(info.unit)) {
      const q = (qtyBy[e.itemId] ||= { qn: 0, amt: 0 })
      q.qn += +e.qn
      q.amt += +e.amount
    }
  })
  const groups = {}
  ITEMS.forEach((it) => {
    const x = expected(it, month)
    if (x >= 1000 || loggedBy[it.id]) (groups[it.group] ||= []).push([it, x])
  })
  Object.keys(OTHER).forEach((k) => {
    if (loggedBy[k]) (groups.Other ||= []).push([{ id: k, ...OTHER[k], sw: '', how: 'Not expected' }, 0])
  })
  let te = 0
  let tl = 0
  for (const [g, rows] of Object.entries(groups)) {
    const gr = document.createElement('tr')
    gr.className = 'grp'
    gr.innerHTML = '<td colspan="5"></td>'
    gr.cells[0].textContent = g
    body.append(gr)
    rows
      .sort((a, b) => b[1] - a[1])
      .forEach(([it, x]) => {
        const l = loggedBy[it.id] || 0
        te += x
        tl += l
        const tr = document.createElement('tr')
        tr.innerHTML = '<td><span class="nm"></span><span class="sw"></span><span class="rate"></span></td><td class="c-how"></td><td class="r"></td><td class="r"></td><td class="r bal c-left"></td>'
        tr.querySelector('.nm').textContent = it.name
        tr.querySelector('.sw').textContent = it.sw ? `${it.sw} · ${it.basis}` : ''
        const q = qtyBy[it.id]
        if (q) {
          const r = q.amt / q.qn
          const rate = tr.querySelector('.rate')
          rate.textContent = `${fmt1(q.qn)} ${units(it.unit, q.qn)} at ${fmt(r)} each · expected ${fmt(it.rate)}`
          rate.classList.add(r > it.rate * 1.1 ? 'over' : r < it.rate * 0.9 ? 'under' : 'ok')
        }
        tr.cells[1].textContent = it.how
        tr.cells[2].textContent = fmt(x)
        tr.cells[3].textContent = l ? fmt(l) : '–'
        const left = x - l
        tr.cells[4].textContent = l ? (left < 0 ? `(${fmt(-left)})` : fmt(left)) : ''
        if (l) tr.cells[4].classList.add(left < 0 ? 'over' : 'under')
        body.append(tr)
      })
  }
  const tt = document.createElement('tr')
  tt.className = 'tot'
  tt.innerHTML = '<td>Total</td><td class="c-how"></td><td class="r"></td><td class="r"></td><td class="r bal c-left"></td>'
  tt.cells[2].textContent = fmt(te)
  tt.cells[3].textContent = tl ? fmt(tl) : '–'
  if (tl) {
    tt.cells[4].textContent = te - tl < 0 ? `(${fmt(tl - te)})` : fmt(te - tl)
    tt.cells[4].classList.add(te - tl < 0 ? 'over' : 'under')
  }
  body.append(tt)
  $('det-sum').textContent = `Line by line · ${body.querySelectorAll('tr:not(.grp):not(.tot)').length} items`

  // entries for the month
  $('ent-h').textContent = `Entries for ${MONTHS[month]} ${year}`
  $('ent-sub').textContent = logs.length ? `${logs.length} ${logs.length === 1 ? 'entry' : 'entries'} · ${fmt(lg)} TZS` : 'Choose a month in the calendar to see its entries'
  const eb = $('ent-body')
  eb.textContent = ''
  if (!logs.length) {
    const tr = document.createElement('tr')
    tr.innerHTML = '<td colspan="4" class="empty"></td>'
    tr.cells[0].textContent = `Nothing logged for ${MONTHS[month]} yet. Use the form to add the first entry.`
    eb.append(tr)
  }
  logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)))
    .forEach((e) => {
      const tr = document.createElement('tr')
      tr.innerHTML = '<td class="num"></td><td><span class="nm"></span><span class="sw"></span></td><td class="r"></td><td class="r"><button type="button" class="del">Delete</button></td>'
      tr.cells[0].textContent = dayMonth(e.date)
      tr.querySelector('.nm').textContent = e.item
      const b = e.batch && batchById(e.batch)
      const q = e.qn ? `${fmt1(e.qn)} ${units(e.unit, e.qn)} · ${fmt(e.amount / e.qn)} each` : e.qty
      tr.querySelector('.sw').textContent = [q, b ? b.code : '', e.note, e.method].filter(Boolean).join(' · ')
      tr.cells[2].textContent = fmt(e.amount)
      const btn = tr.querySelector('.del')
      btn.addEventListener('click', async () => {
        if (!btn.classList.contains('confirm')) {
          btn.classList.add('confirm')
          btn.textContent = 'Confirm'
          setTimeout(() => {
            btn.classList.remove('confirm')
            btn.textContent = 'Delete'
          }, 4000)
          return
        }
        entries = entries.filter((x) => x.id !== e.id)
        persist()
        renderAll()
        await sync()
      })
      eb.append(tr)
    })
}

function renderAll() {
  fillBatchSelect()
  renderHarvests()
  render()
}

// ── workbook ──
function buildWorkbook() {
  const rows = [['ID', 'Date', 'Group', 'Expense', 'Amount (TZS)', 'Quantity', 'Unit', 'Cost per unit (TZS)', 'Expected per unit (TZS)', 'Harvest batch', 'Paid by', 'Note', 'Item code', 'Batch ID']]
  entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((e) => {
      const info = itemInfo(e.itemId)
      const b = e.batch && batchById(e.batch)
      rows.push([e.id, e.date, e.group, e.item, +e.amount, e.qn || e.qty || '', e.qn ? e.unit || '' : '', e.qn ? Math.round(e.amount / e.qn) : '', info.rate && unitKey(e.unit) === unitKey(info.unit) ? info.rate : '', b ? batchCode(b) : '', e.method, e.note || '', e.itemId, e.batch || ''])
    })
  const hv = [['ID', 'Code', 'Cutting started', 'Block or field', 'Meta cut', 'Dry fibre produced (kg)', 'Lost or rejected (kg)', 'Why lost', 'Fibre sold (kg)', 'Price per kg (TZS)', 'Buyer', 'Sale date', 'Short fibre sold (kg)', 'Short fibre price per kg (TZS)', 'Notes', 'Status', 'Costs linked (TZS)', 'Cost per meta (TZS)', 'Kg per meta', 'Loss (%)', 'Cost per kg produced (TZS)', 'Cost per kg sold (TZS)', 'Revenue (TZS)', 'Profit or loss (TZS)', 'Break-even price per kg (TZS)']]
  batches
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start))
    .forEach((b) => {
      const e = econ(b)
      const r = (n) => (n ? Math.round(n) : '')
      hv.push([b.id, b.code, b.start, b.block || '', b.meta || '', b.kg || '', b.lost || '', b.why || '', b.sold || '', b.price || '', b.buyer || '', b.saleDate || '', b.tow || '', b.towPrice || '', b.notes || '', e.status, r(e.total), r(e.perMeta), e.yield ? Math.round(e.yield * 10) / 10 : '', e.produced ? Math.round(e.loss * 1000) / 10 : '', r(e.perKg), r(e.perKgSold), r(e.revenue), e.revenue ? Math.round(e.profit) : '', r(e.breakEven)])
    })
  const last = Math.max(nowIdx, win * 12 + 11, ...entries.map((e) => idx(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1)))
  const months = [['Month', 'Expected (TZS)', 'Logged (TZS)', 'Difference (TZS)']]
  for (let i = 0; i <= last; i++) {
    const { y, m } = ym(i)
    const x = Math.round(monthExpected(m))
    const l = sum(loggedIn(y, m))
    months.push([label(i), x, l, x - l])
  }
  const exp = [['Group', 'Expense', 'Swahili in cashbook', 'Typical cost each time (TZS)', 'Unit', 'Expected per unit (TZS)', 'Basis', 'How often', 'Expected per year (TZS)', ...SHORT]]
  ITEMS.forEach((it) => exp.push([it.group, it.name, it.sw, it.cost, it.unit, it.rate || '', it.basis, it.how, Math.round(it.perYear), ...it.w.map((w) => Math.round(it.perYear * w))]))
  const wb = XLSX.utils.book_new()
  const add = (aoa, name, cols) => {
    const s = XLSX.utils.aoa_to_sheet(aoa)
    s['!cols'] = cols.map((wch) => ({ wch }))
    XLSX.utils.book_append_sheet(wb, s, name)
  }
  add(rows, 'Logged expenses', [10, 12, 16, 30, 14, 10, 10, 14, 14, 22, 14, 40, 10, 10])
  add(hv, 'Harvest batches', [10, 6, 12, 22, 9, 12, 12, 18, 12, 12, 18, 12, 12, 12, 30, 10, 14, 12, 10, 8, 14, 14, 14, 14, 14])
  add(months, 'By month', [16, 16, 16, 16])
  add(exp, 'Expected by month', [16, 30, 26, 14, 10, 12, 30, 20, 14])
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function cellDate(v) {
  if (typeof v === 'number') {
    const p = XLSX.SSF.parse_date_code(v)
    return `${p.y}-${pad(p.m)}-${pad(p.d)}`
  }
  return String(v || '').slice(0, 10)
}

function readWorkbook(buf) {
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets['Logged expenses']
  if (!ws) throw new Error('This file has no "Logged expenses" sheet.')
  const fileEntries = XLSX.utils.sheet_to_json(ws, { defval: '' }).flatMap((r) => {
    const date = cellDate(r.Date)
    const amount = num(r['Amount (TZS)'])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !amount) return []
    const itemId = r['Item code'] || byName[String(r.Expense).toLowerCase()] || 'other'
    const info = itemInfo(itemId)
    const qRaw = r.Quantity
    const qn = typeof qRaw === 'number' ? qRaw : /^[\d.,\s]+$/.test(String(qRaw)) ? num(qRaw) : 0
    return [{ id: String(r.ID || newId()), date, itemId, item: r.Expense || info.name, group: r.Group || info.group, amount, qn, unit: qn ? String(r.Unit || info.unit || '') : '', qty: qn ? '' : String(qRaw || ''), batch: String(r['Batch ID'] || ''), method: r['Paid by'] || '', note: String(r.Note || ''), createdAt: '' }]
  })
  const hs = wb.Sheets['Harvest batches']
  const fileBatches = hs
    ? XLSX.utils.sheet_to_json(hs, { defval: '' }).flatMap((r) => {
        const start = cellDate(r['Cutting started'])
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return []
        return [{ id: String(r.ID || newId()), code: String(r.Code || 'H?'), start, block: String(r['Block or field'] || ''), meta: num(r['Meta cut']), kg: num(r['Dry fibre produced (kg)']), lost: num(r['Lost or rejected (kg)']), why: String(r['Why lost'] || ''), sold: num(r['Fibre sold (kg)']), price: num(r['Price per kg (TZS)']), buyer: String(r.Buyer || ''), saleDate: r['Sale date'] ? cellDate(r['Sale date']) : '', tow: num(r['Short fibre sold (kg)']), towPrice: num(r['Short fibre price per kg (TZS)']), notes: String(r.Notes || '') }]
      })
    : []
  return { fileEntries, fileBatches }
}

function setFileState() {
  const on = !!handle
  $('file-dot').classList.toggle('on', on)
  $('file-text').innerHTML = on ? `Connected to <b></b>. Each change you save is written into this file.` : 'No Excel file connected. Entries are kept in this browser.'
  if (on) $('file-text').querySelector('b').textContent = handle.name
}
const note = (t, err) => {
  const n = $('xl-note')
  n.textContent = t
  n.style.color = err ? 'var(--over)' : ''
}

async function writeToHandle() {
  if ((await handle.queryPermission({ mode: 'readwrite' })) !== 'granted' && (await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') {
    throw Object.assign(new Error('permission'), { code: 'permission' })
  }
  const w = await handle.createWritable()
  await w.write(buildWorkbook())
  await w.close()
}

// Write everything into the connected file, if there is one.
async function sync() {
  if (!handle) return
  try {
    await writeToHandle()
    note(`Saved to ${handle.name}.`)
  } catch (e) {
    note(e.code === 'permission' ? `${handle.name} was not updated: permission to edit it was refused. Choose Open existing file to reconnect.` : `${handle.name} could not be updated. If it is open in Excel, close it and save again.`, true)
  }
}

function download() {
  const blob = new Blob([buildWorkbook()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = FILE_NAME
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  note(`${FILE_NAME} downloaded.`)
}

// The file wins for anything it holds; anything only in this browser is kept.
function merge({ fileEntries, fileBatches }) {
  const eIds = new Set(fileEntries.map((e) => e.id))
  const bIds = new Set(fileBatches.map((b) => b.id))
  const extraE = entries.filter((e) => !eIds.has(e.id))
  const extraB = batches.filter((b) => !bIds.has(b.id))
  entries = [...fileEntries, ...extraE]
  batches = [...fileBatches, ...extraB]
  persist()
  renderAll()
  return extraE.length + extraB.length
}
const loaded = ({ fileEntries, fileBatches }) => `${fileEntries.length} ${fileEntries.length === 1 ? 'entry' : 'entries'}${fileBatches.length ? ` and ${fileBatches.length} harvest ${fileBatches.length === 1 ? 'batch' : 'batches'}` : ''}`

const xlTypes = [{ description: 'Excel workbook', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]

$('xl-open').addEventListener('click', async () => {
  if (!window.showOpenFilePicker) {
    $('xl-input').click()
    return
  }
  try {
    const [h] = await window.showOpenFilePicker({ types: xlTypes })
    const data = readWorkbook(await (await h.getFile()).arrayBuffer())
    handle = h
    const extra = merge(data)
    setFileState()
    note(`Loaded ${loaded(data)} from ${h.name}.${extra ? ` Adding ${extra} more from this browser.` : ''}`)
    if (extra) await sync()
  } catch (e) {
    if (e.name !== 'AbortError') note(e.message.includes('Logged expenses') ? e.message : 'That file could not be read as an Excel workbook.', true)
  }
})

$('xl-input').addEventListener('change', async (ev) => {
  const file = ev.target.files[0]
  ev.target.value = ''
  if (!file) return
  try {
    const data = readWorkbook(await file.arrayBuffer())
    merge(data)
    note(`Loaded ${loaded(data)} from ${file.name}. This browser cannot write back to the file, so use Download after making changes.`)
  } catch (e) {
    note(e.message.includes('Logged expenses') ? e.message : 'That file could not be read as an Excel workbook.', true)
  }
})

$('xl-new').addEventListener('click', async () => {
  if (!window.showSaveFilePicker) {
    download()
    note(`${FILE_NAME} downloaded. This browser cannot keep a file connected, so download again after making changes.`)
    return
  }
  try {
    handle = await window.showSaveFilePicker({ suggestedName: FILE_NAME, types: xlTypes })
    await writeToHandle()
    setFileState()
    note(`Created ${handle.name}. New entries and batches will be written into it.`)
  } catch (e) {
    if (e.name !== 'AbortError') note('The file could not be created. Try again, or use Download.', true)
  }
})

$('xl-download').addEventListener('click', download)

// ── save an entry ──
$('f-amt').addEventListener('blur', (e) => {
  const n = num(e.target.value)
  if (n) e.target.value = fmt(n)
})
$('f').addEventListener('submit', async (ev) => {
  ev.preventDefault()
  const st = $('f-status')
  const date = $('f-date').value
  const itemId = $('f-item').value
  const amount = num($('f-amt').value)
  const qn = num($('f-qn').value)
  const unit = $('f-unit').value.trim()
  const fail = (t) => {
    st.textContent = t
    st.className = 'status err'
  }
  if (!date) return fail('Add the date the money was spent.')
  if (!itemId) return fail('Choose which expense this was.')
  if (!amount) return fail('Enter the amount in shillings.')
  if (qn && !unit) return fail('Add a unit for the quantity, such as acres, litres or meta.')
  if (idx(+date.slice(0, 4), +date.slice(5, 7) - 1) < 0) return fail('The log starts in October 2026. Earlier spending is in the cashbook.')
  const info = itemInfo(itemId)
  entries.push({ id: newId(), date, itemId, item: info.name, group: info.group, amount, qn, unit: qn ? unit : '', qty: '', batch: $('f-batch').value, method: $('f-method').value, note: $('f-note').value.trim(), createdAt: new Date().toISOString() })
  persist()
  const b = $('f-batch').value && batchById($('f-batch').value)
  st.textContent = `Saved: ${info.name}, ${fmt(amount)} TZS${qn ? ` for ${fmt1(qn)} ${units(unit, qn)}` : ''}${b ? `, linked to ${b.code}` : ''}.${handle ? '' : ' Download the Excel file to keep a copy.'}`
  st.className = 'status'
  $('f-amt').value = ''
  $('f-qn').value = ''
  $('f-note').value = ''
  rateHint()
  sel = idx(+date.slice(0, 4), +date.slice(5, 7) - 1)
  win = Math.floor(sel / 12)
  renderAll()
  await sync()
})

const showWindow = (w) => {
  win = Math.max(0, w)
  sel = nowIdx >= win * 12 && nowIdx < win * 12 + 12 ? nowIdx : win * 12
  resetDate()
  render()
}
$('yr-prev').addEventListener('click', () => showWindow(win - 1))
$('yr-next').addEventListener('click', () => showWindow(win + 1))
$('f-date').min = '2026-10-01'

if (!window.showOpenFilePicker) {
  $('xl-new').textContent = 'Download new file'
}

// ── tutorial ──
const STEPS = [
  { title: 'Log what you spend', body: 'Fill in the date, the expense and the amount. Add the quantity it paid for, such as 5 acres or 20 litres, and the page shows the cost per unit against the expected rate.', target: 'log-h' },
  { title: 'Keep it in Excel', body: 'On a computer, in Chrome or Edge, tap Create new file once. Every change is then written into that workbook. On a phone, tap Download to save it, and Open existing file to load it back.', target: 'xl-h' },
  { title: 'Track each harvest', body: 'Start a batch when cutting begins and record the meta cut. Link processing costs to it as you log them. When the fibre is weighed and sold, update the batch with the kilos produced, lost and sold, and the price.', target: 'hv-h' },
  { title: 'Read the unit economics', body: 'Each batch shows its cost per meta and per kilo, the share lost, profit and the break-even price, set against the cashbook benchmarks: 15 kg of fibre per meta and about 43,700 TZS of processing per meta.', target: 'hv-h' },
  { title: 'Plan ahead', body: 'The calendar covers the twelve months from October 2026. Tap a month to see each expected cost line by line, with the real cost per unit wherever you logged a quantity.', target: 'cal-h' },
]
let step = 0
const tut = $('tut')
function showStep() {
  const st = STEPS[step]
  $('tut-count').textContent = `Step ${step + 1} of ${STEPS.length}`
  $('tut-title').textContent = st.title
  $('tut-body').textContent = st.body
  $('tut-dots').innerHTML = STEPS.map((_, i) => `<span${i === step ? ' class="on"' : ''}></span>`).join('')
  $('tut-back').disabled = step === 0
  $('tut-next').textContent = step === STEPS.length - 1 ? 'Done' : 'Next'
}
$('tut-open').addEventListener('click', () => {
  step = 0
  showStep()
  tut.showModal()
})
$('tut-back').addEventListener('click', () => {
  step = Math.max(0, step - 1)
  showStep()
})
$('tut-next').addEventListener('click', () => {
  if (step === STEPS.length - 1) return tut.close()
  step++
  showStep()
})
$('tut-show').addEventListener('click', () => {
  tut.close()
  const el = $(STEPS[step].target).closest('section')
  el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  el.classList.remove('flash')
  void el.offsetWidth
  el.classList.add('flash')
})
$('tut-close').addEventListener('click', () => tut.close())
tut.addEventListener('click', (e) => {
  if (e.target === tut) tut.close()
})

// On a phone the line-by-line table starts folded away.
if (matchMedia('(max-width: 560px)').matches) $('det-more').open = false

resetDate()
setFileState()
renderAll()
rateHint()
