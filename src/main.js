const SETTINGS_KEY = 'dse-demandes-v4-demo-settings'

const DEFAULT_SETTINGS = {
  arret: 'jamais',
  adresseSure: true,
  documentsSurs: true,
  apresDocuments: 'continuer',
}

const CANDIDATES = [
  { name: 'Camille Moreau', score: 0.94, best: true },
  { name: 'Julien Marchal', score: 0.71, best: false },
  { name: 'Inès Prévost', score: 0.58, best: false },
]

const TITLES = {
  accueil: ['Accueil', 'Trois portes. Un geste. Rien n’est envoyé hors de ce navigateur.'],
  traiter: ['Traiter', 'Identité d’abord — liste fictive, score simulé.'],
  verifier: ['Vérifier', 'Aucune liasse dans cette démo, mais le chemin reste ouvert.'],
  controler: ['Contrôler', 'Le contrôle attendrait une demande déjà passée. Ici : vitrine.'],
  parametres: ['Paramètres', 'Quatre options, persistées dans ce navigateur.'],
}

const views = {
  accueil: document.getElementById('view-accueil'),
  traiter: document.getElementById('view-traiter'),
  verifier: document.getElementById('view-verifier'),
  controler: document.getElementById('view-controler'),
  parametres: document.getElementById('view-parametres'),
}

const live = {
  file: document.getElementById('live-file'),
  action: document.getElementById('live-action'),
  bar: document.getElementById('live-bar'),
  eta: document.getElementById('live-eta'),
}

const diagPanel = document.getElementById('diag-panel')
const diagList = document.getElementById('diag-list')
const diagPc = document.getElementById('diag-pc')
const diagReport = document.getElementById('diag-report')
const copyStatus = document.getElementById('copy-status')
const scoreList = document.getElementById('score-list')
const traiterFeedback = document.getElementById('traiter-feedback')

let liveTimer = 0
let selectedName = CANDIDATES[0].name

function setLive({ file, action, pct, eta }) {
  if (file !== undefined) live.file.textContent = file
  if (action !== undefined) live.action.textContent = action
  if (pct !== undefined) live.bar.style.width = `${Math.max(0, Math.min(100, pct))}%`
  if (eta !== undefined) live.eta.textContent = eta
}

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.hidden = key !== name
  })
  const [title, lede] = TITLES[name]
  document.getElementById('page-title').textContent = title
  document.getElementById('page-lede').textContent = lede
  if (name !== 'accueil') {
    // Keep Accueil diagnose panel mounted but closed when leaving.
    diagPanel.hidden = true
  }
}

function go(name) {
  if (name === 'traiter') startTraiter()
  else if (name === 'verifier') {
    setLive({ file: '—', action: 'Vérifier — file vide', pct: 0, eta: '—' })
    showView('verifier')
  } else if (name === 'controler') {
    setLive({ file: '—', action: 'Contrôler — file vide', pct: 0, eta: '—' })
    showView('controler')
  } else if (name === 'parametres') {
    fillSettings()
    setLive({ file: '—', action: 'Paramètres', pct: 0, eta: '—' })
    showView('parametres')
  } else {
    setLive({ file: '—', action: 'Accueil', pct: 0, eta: '—' })
    showView('accueil')
  }
}

function startTraiter() {
  window.clearTimeout(liveTimer)
  selectedName = CANDIDATES[0].name
  renderScores()
  traiterFeedback.hidden = true
  showView('traiter')
  setLive({
    file: 'demande-demo.pdf',
    action: 'Ouverture Identité',
    pct: 18,
    eta: '~8 s',
  })
  liveTimer = window.setTimeout(() => {
    setLive({ action: 'Score des candidats', pct: 62, eta: '~3 s' })
    liveTimer = window.setTimeout(() => {
      setLive({ action: 'Identité — 3 propositions', pct: 100, eta: 'prêt' })
    }, 450)
  }, 400)
}

function renderScores() {
  scoreList.innerHTML = CANDIDATES.map((c) => {
    const star = c.best ? ' <span class="star" title="meilleure proposition">★</span>' : ''
    return `<li class="score-item${c.best ? ' is-best' : ''}">
      <div>
        <div class="score-name">${c.name}${star}</div>
        <div class="score-meta">proposition fictive</div>
      </div>
      <div class="score-meta">${c.score.toFixed(2)}</div>
    </li>`
  }).join('')
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function fillSettings() {
  const s = loadSettings()
  document.getElementById('opt-arret').value = s.arret
  document.getElementById('opt-adresse').checked = !!s.adresseSure
  document.getElementById('opt-documents').checked = !!s.documentsSurs
  document.getElementById('opt-apres').value = s.apresDocuments
}

function saveSettings(event) {
  event.preventDefault()
  const next = {
    arret: document.getElementById('opt-arret').value,
    adresseSure: document.getElementById('opt-adresse').checked,
    documentsSurs: document.getElementById('opt-documents').checked,
    apresDocuments: document.getElementById('opt-apres').value,
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  const fb = document.getElementById('params-feedback')
  fb.hidden = false
  fb.textContent = 'Enregistré dans ce navigateur.'
  setLive({ action: 'Paramètres enregistrés', pct: 100, eta: '—' })
}

function once(promise, ms, failWhy) {
  return new Promise((resolve) => {
    let done = false
    const finish = (value) => {
      if (done) return
      done = true
      resolve(value)
    }
    promise.then(finish, (err) => finish({ status: 'FAIL', why: String(err?.message || err) }))
    window.setTimeout(() => finish({ status: 'FAIL', why: failWhy }), ms)
  })
}

function hostSignals() {
  const hits = []
  try {
    if (window.chrome?.webview) hits.push('chrome.webview')
  } catch {
    /* ignore */
  }
  if ('ActiveXObject' in window) hits.push('ActiveXObject')
  if (window.Charlemagne || window.charlemagneSession) hits.push('objet Charlemagne')
  return hits
}

function testJavaScript() {
  return { status: 'PASS', why: 'le script de la page s’exécute' }
}

function testLocalStorage() {
  try {
    const key = '__dse_diag__'
    localStorage.setItem(key, 'ok')
    const ok = localStorage.getItem(key) === 'ok'
    localStorage.removeItem(key)
    if (ok) return { status: 'PASS', why: 'écriture puis lecture OK' }
    return { status: 'FAIL', why: 'valeur relue différente' }
  } catch (err) {
    return { status: 'FAIL', why: err.message || 'localStorage bloqué' }
  }
}

function testIndexedDb() {
  return once(
    new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve({ status: 'FAIL', why: 'indexedDB absent' })
        return
      }
      const req = indexedDB.open('dse-demo-diag', 1)
      req.onerror = () => resolve({ status: 'FAIL', why: String(req.error || 'ouverture refusée') })
      req.onsuccess = () => {
        try {
          req.result.close()
        } catch {
          /* ignore */
        }
        resolve({ status: 'PASS', why: 'base dse-demo-diag ouverte puis fermée' })
      }
    }),
    2500,
    'délai dépassé à l’ouverture IndexedDB',
  )
}

async function testFetch() {
  const urls = ['https://httpbin.org/get', 'https://example.com/']
  let last = 'aucun essai'
  for (const url of urls) {
    try {
      const ctrl = new AbortController()
      const t = window.setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' })
      window.clearTimeout(t)
      if (res.ok) return { status: 'PASS', why: `${url} → HTTP ${res.status}` }
      last = `${url} → HTTP ${res.status}`
    } catch (err) {
      last = `${url} → ${err.name === 'AbortError' ? 'délai dépassé' : err.message}`
    }
  }
  return { status: 'FAIL', why: last }
}

function testFilePicker() {
  try {
    const input = document.createElement('input')
    input.type = 'file'
    const ok = input.type === 'file' && 'files' in input && typeof input.click === 'function'
    if (ok) {
      return { status: 'PASS', why: 'input type=file disponible (aucun fichier exigé)' }
    }
    return { status: 'FAIL', why: 'input type=file incomplet' }
  } catch (err) {
    return { status: 'FAIL', why: err.message }
  }
}

function testPrint() {
  if (typeof window.print === 'function') {
    return { status: 'PASS', why: 'window.print est une fonction' }
  }
  return { status: 'FAIL', why: 'window.print absent' }
}

async function testClipboard() {
  if (!navigator.clipboard?.writeText) {
    return { status: 'FAIL', why: 'navigator.clipboard.writeText absent' }
  }
  try {
    await navigator.clipboard.writeText('DSE démo — test presse-papiers')
    return { status: 'PASS', why: 'writeText a réussi' }
  } catch (err) {
    return { status: 'FAIL', why: `permission ou refus : ${err.message}` }
  }
}

function testViewport() {
  const band = document.getElementById('live-band')
  const panel = document.getElementById('diag-panel')
  const r = band.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const inView =
    r.height > 0 &&
    r.width > 0 &&
    r.top >= -0.5 &&
    r.left >= -0.5 &&
    r.bottom <= vh + 1 &&
    r.right <= vw + 1
  const overflow = getComputedStyle(band).overflow
  const clipped = overflow === 'hidden' || overflow === 'clip'
  const fields = [...band.querySelectorAll('[data-live]')]
  const fieldsOk = fields.length === 4 && fields.every((el) => {
    const b = el.getBoundingClientRect()
    return b.width > 0 && b.height > 0 && b.bottom <= vh + 1
  })
  if (inView && !clipped && fieldsOk && panel && !panel.hidden) {
    return {
      status: 'PASS',
      why: `bande live entière visible (${Math.round(r.width)}×${Math.round(r.height)}px) après ouverture du panneau`,
    }
  }
  const why = !panel || panel.hidden
    ? 'panneau diagnostic pas ouvert'
    : !inView
      ? 'bande live hors viewport'
      : clipped
        ? 'bande live clipée (overflow)'
        : 'un champ live n’est pas entièrement visible'
  return { status: 'FAIL', why }
}

function testExcelCom() {
  const hits = hostSignals()
  if (hits.includes('ActiveXObject')) {
    return { status: 'FAIL', why: 'ActiveX visible, mais Excel COM n’est pas branché dans cette démo hébergée' }
  }
  return { status: 'N/A', why: 'démo hébergée — pas de pont COM Excel (PC Windows seulement)' }
}

function testAcrobatCom() {
  const hits = hostSignals()
  if (hits.includes('ActiveXObject')) {
    return { status: 'FAIL', why: 'ActiveX visible, mais Acrobat COM n’est pas branché dans cette démo hébergée' }
  }
  return { status: 'N/A', why: 'démo hébergée — pas de pont COM Acrobat' }
}

function testCharlemagne() {
  const hits = hostSignals()
  if (hits.includes('objet Charlemagne')) {
    return { status: 'FAIL', why: 'un objet session a été vu, mais cette démo n’ouvre pas Charlemagne' }
  }
  return { status: 'N/A', why: 'aucun appel Charlemagne depuis cette page' }
}

function testWebView2() {
  const hits = hostSignals()
  if (hits.includes('chrome.webview')) {
    return { status: 'FAIL', why: 'chrome.webview détecté, mais aucun pont hôte n’est implémenté ici' }
  }
  return { status: 'N/A', why: 'page web standard — pas d’hôte WebView2' }
}

function testLocalPath() {
  if (location.protocol === 'file:') {
    return { status: 'FAIL', why: 'ouvert en file://, mais aucun chemin local PC n’est exposé' }
  }
  return { status: 'N/A', why: 'navigateur distant — pas d’accès aux chemins locaux du PC (C:\\, etc.)' }
}

const BROWSER_CHECKS = [
  { id: 'js', n: 1, label: 'JavaScript running', run: testJavaScript },
  { id: 'ls', n: 2, label: 'localStorage read/write', run: testLocalStorage },
  { id: 'idb', n: 3, label: 'IndexedDB open', run: testIndexedDb },
  { id: 'fetch', n: 4, label: 'Fetch HTTPS public', run: testFetch },
  { id: 'file', n: 5, label: 'File picker / input type=file', run: testFilePicker },
  { id: 'print', n: 6, label: 'window.print available', run: testPrint },
  { id: 'clip', n: 7, label: 'Clipboard write', run: testClipboard },
  { id: 'view', n: 8, label: 'Viewport / no clip (live band)', run: testViewport },
]

const PC_CHECKS = [
  { id: 'excel', label: 'Excel COM', run: testExcelCom },
  { id: 'acrobat', label: 'Acrobat COM', run: testAcrobatCom },
  { id: 'charlemagne', label: 'Charlemagne session', run: testCharlemagne },
  { id: 'webview2', label: 'WebView2 host bridge', run: testWebView2 },
  { id: 'path', label: 'local file path', run: testLocalPath },
]

const results = new Map()

function rowHtml(item, result) {
  const status = result?.status || '…'
  const why = result?.why || 'en cours'
  const cls = result ? `is-${status.toLowerCase()}` : 'is-pending'
  const n = item.n ? `${item.n}. ` : ''
  return `<li class="diag-row ${cls}" data-id="${item.id}">
    <span class="diag-status">${status}</span>
    <div>
      <div class="diag-title">${n}${item.label}</div>
      <div class="diag-why">${why}</div>
    </div>
  </li>`
}

function pcHtml(item, result) {
  const status = result?.status || '…'
  const why = result?.why || 'en cours'
  const cls = result ? `is-${status.toLowerCase()}` : 'is-pending'
  return `<div class="diag-pc-item ${cls}" data-id="${item.id}">
    <span class="diag-status">${status}</span>
    <div>
      <div class="diag-title">${item.label}</div>
      <div class="diag-why">${why}</div>
    </div>
  </div>`
}

function paintDiag() {
  diagList.innerHTML = BROWSER_CHECKS.map((c) => rowHtml(c, results.get(c.id))).join('')
  diagPc.innerHTML = `<p class="diag-pc-legend">9. PC-only (cette démo hébergée ne doit jamais afficher PASS)</p>${
    PC_CHECKS.map((c) => pcHtml(c, results.get(c.id))).join('')
  }`
  diagReport.value = buildReport()
}

function buildReport() {
  const lines = [
    'DSE Demandes V4 — Rapport de diagnostic (démo UI)',
    `Date : ${new Date().toISOString()}`,
    `URL : ${location.href}`,
    `Navigateur : ${navigator.userAgent}`,
    '',
    'Cette page n’est pas Charlemagne, pas Acrobat, pas le moteur PC.',
    '',
  ]
  for (const c of BROWSER_CHECKS) {
    const r = results.get(c.id)
    lines.push(`${c.n}. ${c.label}`)
    lines.push(`   ${r?.status || '…'} — ${r?.why || 'en cours'}`)
  }
  lines.push('9. PC-only')
  for (const c of PC_CHECKS) {
    const r = results.get(c.id)
    lines.push(`   ${c.label}: ${r?.status || '…'} — ${r?.why || 'en cours'}`)
  }
  lines.push('')
  lines.push('Fin du rapport.')
  return lines.join('\n')
}

async function runDiagnose() {
  showView('accueil')
  setLive({ file: '—', action: 'Diagnostic navigateur', pct: 12, eta: '~2 s' })
  results.clear()
  diagPanel.hidden = false
  copyStatus.hidden = true
  paintDiag()

  // Let the panel paint before measuring the live band / running I/O.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

  const all = [...BROWSER_CHECKS, ...PC_CHECKS]
  for (let i = 0; i < all.length; i += 1) {
    const check = all[i]
    try {
      results.set(check.id, await check.run())
    } catch (err) {
      results.set(check.id, { status: 'FAIL', why: err.message || String(err) })
    }
    paintDiag()
    setLive({ pct: Math.round(((i + 1) / all.length) * 100) })
  }
  setLive({ action: 'Diagnostic prêt — copiez le rapport', pct: 100, eta: 'prêt' })
}

async function copyReport() {
  const text = diagReport.value
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      diagReport.focus()
      diagReport.select()
      document.execCommand('copy')
    }
    copyStatus.hidden = false
    copyStatus.textContent = 'Copié.'
  } catch {
    diagReport.focus()
    diagReport.select()
    copyStatus.hidden = false
    copyStatus.textContent = 'Sélectionnez le bloc et copiez (Ctrl+C).'
  }
}

document.querySelectorAll('[data-go]').forEach((el) => {
  el.addEventListener('click', () => go(el.getAttribute('data-go')))
})

document.getElementById('btn-diagnostiquer').addEventListener('click', () => {
  runDiagnose()
})

document.getElementById('btn-copy-report').addEventListener('click', () => {
  copyReport()
})

document.getElementById('btn-choisir').addEventListener('click', () => {
  traiterFeedback.hidden = false
  traiterFeedback.textContent = `Retenu (fictif) : ${selectedName} ★`
  setLive({ action: `Identité retenue — ${selectedName}`, pct: 100, eta: 'prêt' })
})

document.getElementById('btn-ouvrir-pdf').addEventListener('click', () => {
  window.alert('démo — PDF local seulement sur le PC')
})

document.getElementById('btn-classer').addEventListener('click', () => {
  traiterFeedback.hidden = false
  traiterFeedback.textContent = 'Classement simulé — aucun fichier déplacé.'
  setLive({ action: 'Classer… (simulé)', pct: 100, eta: 'prêt' })
})

document.getElementById('btn-manuel').addEventListener('click', () => {
  traiterFeedback.hidden = false
  traiterFeedback.textContent = 'Traitement manuel : à faire sur le PC, pas dans cette démo.'
  setLive({ action: 'Traitement manuel (renvoi PC)', pct: 100, eta: '—' })
})

document.getElementById('params-form').addEventListener('submit', saveSettings)

renderScores()
fillSettings()
go('accueil')
