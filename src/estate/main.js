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

const now = new Date()
let year = now.getFullYear()
let month = now.getMonth()
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
  const d = year === now.getFullYear() && month === now.getMonth() ? now : new Date(year, month, 1)
  $('f-date').value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ── render ──
function render() {
  $('yr').textContent = year
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
  $('c-ylog').textContent = short(sum(entries.filter((e) => +e.date.slice(0, 4) === year)))
  $('c-yexp').textContent = short(yearExpected)

  // calendar
  const cal = $('cal')
  cal.textContent = ''
  for (let m = 0; m < 12; m++) {
    const e = monthExpected(m)
    const l = sum(loggedIn(year, m))
    const peaks = ITEMS.filter((it) => it.w[m] > 0.13 && expected(it, m) >= 60000)
      .sort((a, b) => expected(b, m) - expected(a, m))
      .slice(0, 3)
      .map((it) => it.name)
    const li = document.createElement('li')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mo'
    b.setAttribute('aria-pressed', m === month ? 'true' : 'false')
    const isNow = year === now.getFullYear() && m === now.getMonth()
    b.innerHTML = `<span class="mname">${MONTHS[m]}${isNow ? '<span class="now">this month</span>' : ''}</span>
      <span class="exp num">${fmt(e)}<em>expected</em></span>
      <span class="bar" aria-hidden="true"><i style="width:${Math.min(100, (l / e) * 100)}%"${l > e ? ' class="over"' : ''}></i></span>
      <span class="logged num">${l ? fmt(l) + ' logged' : 'Nothing logged'}</span>
      <span class="peaks">${peaks.length ? peaks.join(' · ') : 'Steady running costs only'}</span>`
    b.addEventListener('click', () => {
      month = m
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
        tr.innerHTML = '<td><span class="nm"></span><span class="sw"></span></td><td></td><td class="r"></td><td class="r"></td><td class="r bal"></td>'
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
  tt.innerHTML = '<td>Total</td><td></td><td class="r"></td><td class="r"></td><td class="r bal"></td>'
  tt.cells[2].textContent = fmt(te)
  tt.cells[3].textContent = tl ? fmt(tl) : '–'
  if (tl) {
    tt.cells[4].textContent = te - tl < 0 ? `(${fmt(tl - te)})` : fmt(te - tl)
    tt.cells[4].classList.add(te - tl < 0 ? 'over' : 'under')
  }
  body.append(tt)

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
  const years = [...new Set([year, ...entries.map((e) => +e.date.slice(0, 4))])].sort()
  const months = [['Month', 'Expected (TZS)', 'Logged (TZS)', 'Difference (TZS)']]
  years.forEach((y) => {
    for (let m = 0; m < 12; m++) {
      const x = Math.round(monthExpected(m))
      const l = sum(loggedIn(y, m))
      months.push([`${MONTHS[m]} ${y}`, x, l, x - l])
    }
  })
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
  const info = itemInfo(itemId)
  entries.push({ id: newId(), date, itemId, item: info.name, group: info.group, amount, method: $('f-method').value, qty: $('f-qty').value.trim(), note: $('f-note').value.trim(), createdAt: new Date().toISOString() })
  persist()
  st.textContent = `Saved: ${info.name}, ${fmt(amount)} TZS.${handle ? '' : ' Download the Excel file to keep a copy.'}`
  st.className = 'status'
  $('f-amt').value = ''
  $('f-qty').value = ''
  $('f-note').value = ''
  const y = +date.slice(0, 4)
  const m = +date.slice(5, 7) - 1
  if (y !== year || m !== month) {
    year = y
    month = m
  }
  render()
  await sync()
})

$('yr-prev').addEventListener('click', () => {
  year--
  resetDate()
  render()
})
$('yr-next').addEventListener('click', () => {
  year++
  resetDate()
  render()
})

if (!window.showOpenFilePicker) {
  $('xl-new').textContent = 'Download new file'
}
resetDate()
setFileState()
render()
