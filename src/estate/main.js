// Damana Estate accounts: an expected-expenses calendar built from the
// 2021–2026 cashbook, and an expense log kept in an Excel file.
//
// The page is static (GitHub Pages), so there is no server to save to.
// Entries are kept in this browser (localStorage) and written into an .xlsx:
// - Chrome and Edge on a computer can connect a file once; each entry saved
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
const FILE_NAME = 'Damana_Estate_Expense_Log.xlsx'
const OTHER = {
  debt: { group: 'Other', name: 'Debt repayment' },
  capital: { group: 'Other', name: 'Equipment / construction' },
  other: { group: 'Other', name: 'Other' },
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
let entries = load()
let handle = null // connected Excel file, where the browser supports it

const $ = (id) => document.getElementById(id)
const fmt = (n) => Math.round(n).toLocaleString('en-US')
const short = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n)))
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

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) || '[]')
    return Array.isArray(v) ? v.filter((e) => e && e.id && e.date && e.amount) : []
  } catch {
    return []
  }
}
function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify(entries))
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

function resetDate() {
  const { y, m } = ym(sel)
  const d = sel === idx(now.getFullYear(), now.getMonth()) ? now : new Date(y, m, 1)
  $('f-date').value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

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

  // month detail
  $('det-script').textContent = `${MONTHS[month]} ${year}`
  const body = $('det-body')
  body.textContent = ''
  const loggedBy = {}
  logs.forEach((e) => (loggedBy[e.itemId] = (loggedBy[e.itemId] || 0) + (+e.amount || 0)))
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
        tr.innerHTML = '<td><span class="nm"></span><span class="sw"></span></td><td class="c-how"></td><td class="r"></td><td class="r"></td><td class="r bal c-left"></td>'
        tr.querySelector('.nm').textContent = it.name
        tr.querySelector('.sw').textContent = it.sw ? `${it.sw} · ${it.basis}` : ''
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
      tr.cells[0].textContent = `${+e.date.slice(8, 10)} ${SHORT[+e.date.slice(5, 7) - 1]}`
      tr.querySelector('.nm').textContent = e.item
      tr.querySelector('.sw').textContent = [e.qty, e.note, e.method].filter(Boolean).join(' · ')
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
        render()
        await sync()
      })
      eb.append(tr)
    })
}

// ── workbook ──
function buildWorkbook() {
  const rows = [['ID', 'Date', 'Group', 'Expense', 'Amount (TZS)', 'Paid by', 'Quantity', 'Note', 'Item code']]
  entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((e) => rows.push([e.id, e.date, e.group, e.item, +e.amount, e.method, e.qty || '', e.note || '', e.itemId]))
  const last = Math.max(nowIdx, win * 12 + 11, ...entries.map((e) => idx(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1)))
  const months = [['Month', 'Expected (TZS)', 'Logged (TZS)', 'Difference (TZS)']]
  for (let i = 0; i <= last; i++) {
    const { y, m } = ym(i)
    const x = Math.round(monthExpected(m))
    const l = sum(loggedIn(y, m))
    months.push([label(i), x, l, x - l])
  }
  const exp = [['Group', 'Expense', 'Swahili in cashbook', 'Typical cost each time (TZS)', 'Basis', 'How often', 'Expected per year (TZS)', ...SHORT]]
  ITEMS.forEach((it) => exp.push([it.group, it.name, it.sw, it.cost, it.basis, it.how, Math.round(it.perYear), ...it.w.map((w) => Math.round(it.perYear * w))]))
  const wb = XLSX.utils.book_new()
  const s1 = XLSX.utils.aoa_to_sheet(rows)
  s1['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 40 }, { wch: 10 }]
  const s2 = XLSX.utils.aoa_to_sheet(months)
  s2['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }]
  const s3 = XLSX.utils.aoa_to_sheet(exp)
  s3['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 26 }, { wch: 14 }, { wch: 30 }, { wch: 20 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, s1, 'Logged expenses')
  XLSX.utils.book_append_sheet(wb, s2, 'By month')
  XLSX.utils.book_append_sheet(wb, s3, 'Expected by month')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function readWorkbook(buf) {
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets['Logged expenses']
  if (!ws) throw new Error('This file has no "Logged expenses" sheet.')
  return XLSX.utils.sheet_to_json(ws, { defval: '' }).flatMap((r) => {
    let date = r.Date
    if (typeof date === 'number') {
      const p = XLSX.SSF.parse_date_code(date)
      date = `${p.y}-${pad(p.m)}-${pad(p.d)}`
    }
    date = String(date).slice(0, 10)
    const amount = +String(r['Amount (TZS)']).replace(/[^\d.]/g, '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !amount) return []
    const itemId = r['Item code'] || byName[String(r.Expense).toLowerCase()] || 'other'
    const info = itemInfo(itemId)
    return [{ id: String(r.ID || newId()), date, itemId, item: r.Expense || info.name, group: r.Group || info.group, amount, method: r['Paid by'] || '', qty: String(r.Quantity || ''), note: String(r.Note || ''), createdAt: '' }]
  })
}

function setFileState() {
  const on = !!handle
  $('file-dot').classList.toggle('on', on)
  $('file-text').innerHTML = on ? `Connected to <b></b>. Each entry you save is written into this file.` : 'No Excel file connected. Entries are kept in this browser.'
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

// Write the log into the connected file, if there is one.
async function sync() {
  if (!handle) return
  try {
    await writeToHandle()
    note(`Saved to ${handle.name}.`)
  } catch (e) {
    note(e.code === 'permission' ? `${handle.name} was not updated: permission to edit it was refused. Choose Open existing file to reconnect.` : `${handle.name} could not be updated. If it is open in Excel, close it and save the entry again.`, true)
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

function merge(fromFile) {
  const ids = new Set(fromFile.map((e) => e.id))
  const added = entries.filter((e) => !ids.has(e.id))
  entries = [...fromFile, ...added]
  persist()
  render()
  return added.length
}

const xlTypes = [{ description: 'Excel workbook', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]

$('xl-open').addEventListener('click', async () => {
  if (!window.showOpenFilePicker) {
    $('xl-input').click()
    return
  }
  try {
    const [h] = await window.showOpenFilePicker({ types: xlTypes })
    const fromFile = readWorkbook(await (await h.getFile()).arrayBuffer())
    handle = h
    const extra = merge(fromFile)
    setFileState()
    note(`Loaded ${fromFile.length} ${fromFile.length === 1 ? 'entry' : 'entries'} from ${h.name}.${extra ? ` Adding ${extra} from this browser.` : ''}`)
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
    const fromFile = readWorkbook(await file.arrayBuffer())
    merge(fromFile)
    note(`Loaded ${fromFile.length} ${fromFile.length === 1 ? 'entry' : 'entries'} from ${file.name}. This browser cannot write back to the file, so use Download after adding entries.`)
  } catch (e) {
    note(e.message.includes('Logged expenses') ? e.message : 'That file could not be read as an Excel workbook.', true)
  }
})

$('xl-new').addEventListener('click', async () => {
  if (!window.showSaveFilePicker) {
    download()
    note(`${FILE_NAME} downloaded. This browser cannot keep a file connected, so download again after adding entries.`)
    return
  }
  try {
    handle = await window.showSaveFilePicker({ suggestedName: FILE_NAME, types: xlTypes })
    await writeToHandle()
    setFileState()
    note(`Created ${handle.name}. New entries will be written into it.`)
  } catch (e) {
    if (e.name !== 'AbortError') note('The file could not be created. Try again, or use Download.', true)
  }
})

$('xl-download').addEventListener('click', download)

// ── save an entry ──
$('f-amt').addEventListener('blur', (e) => {
  const n = +String(e.target.value).replace(/[^\d.]/g, '')
  if (n) e.target.value = fmt(n)
})
$('f').addEventListener('submit', async (ev) => {
  ev.preventDefault()
  const st = $('f-status')
  const date = $('f-date').value
  const itemId = $('f-item').value
  const amount = +String($('f-amt').value).replace(/[^\d.]/g, '')
  const fail = (t) => {
    st.textContent = t
    st.className = 'status err'
  }
  if (!date) return fail('Add the date the money was spent.')
  if (!itemId) return fail('Choose which expense this was.')
  if (!amount) return fail('Enter the amount in shillings.')
  if (idx(+date.slice(0, 4), +date.slice(5, 7) - 1) < 0) return fail('The log starts in October 2026. Earlier spending is in the cashbook.')
  const info = itemInfo(itemId)
  entries.push({ id: newId(), date, itemId, item: info.name, group: info.group, amount, method: $('f-method').value, qty: $('f-qty').value.trim(), note: $('f-note').value.trim(), createdAt: new Date().toISOString() })
  persist()
  st.textContent = `Saved: ${info.name}, ${fmt(amount)} TZS.${handle ? '' : ' Download the Excel file to keep a copy.'}`
  st.className = 'status'
  $('f-amt').value = ''
  $('f-qty').value = ''
  $('f-note').value = ''
  sel = idx(+date.slice(0, 4), +date.slice(5, 7) - 1)
  win = Math.floor(sel / 12)
  render()
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
  { title: 'Log what you spend', body: 'Fill in the date, the expense and the amount, then tap Save entry. Pick the closest item in the list; use Other for anything unusual.', target: 'log-h' },
  { title: 'Keep it in Excel', body: 'On a computer, in Chrome or Edge, tap Create new file once. Every entry is then written into that workbook. On a phone, tap Download to save it, and Open existing file to load it back.', target: 'xl-h' },
  { title: 'Check this month', body: 'The summary compares what this month is expected to cost with what you have logged. Green means under the expected amount; red means over.', target: 'sum-h' },
  { title: 'Plan ahead', body: 'The calendar covers the next twelve months from October 2026. Tap a month to see each expected cost. August is the heaviest month, mainly sisal processing.', target: 'cal-h' },
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
render()
