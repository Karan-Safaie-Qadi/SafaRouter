import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 3000
const WATCH_DIRS = ['./test-app/html-pages', './test-app/components']

const MIME = {
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  ico: 'image/x-icon',
}

const sseClients = new Set()
let lastChange = { changed: false, path: null, time: 0 }

function sendSSE(data) {
  const msg = `event: change\ndata: ${JSON.stringify(data)}\n\n`
  for (const res of sseClients) {
    try { res.write(msg) } catch { sseClients.delete(res) }
  }
}

function serveSync(filePath, res) {
  try {
    const data = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
    return true
  } catch {
    return false
  }
}

// ── File watching ──
for (const dir of WATCH_DIRS) {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return
      const now = Date.now()
      if (now - lastChange.time < 200) return
      lastChange = { changed: true, path: filename.replace(/\\/g, '/'), time: now }
      sendSSE(lastChange)
    })
  }
}

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0]

  // ── Realtime SSE endpoint ──
  if (urlPath === '/__realtime') {
    const accept = req.headers.accept || ''
    if (accept.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      })
      res.write('event: change\ndata: {"connected":true}\n\n')
      sseClients.add(res)
      req.on('close', () => sseClients.delete(res))
      return
    }
    lastChange.changed = false
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(lastChange))
    return
  }

  if (urlPath.startsWith('/src/')) {
    if (serveSync('.' + urlPath, res)) return
    res.writeHead(404)
    res.end('Not found')
    return
  }

  if (urlPath === '/') {
    serveSync('./test-app/index.html', res)
    return
  }

  if (urlPath.startsWith('/test-app/')) {
    if (serveSync('.' + urlPath, res)) return
    const ext = path.extname(urlPath)
    if (ext) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    serveSync('./test-app/index.html', res)
    return
  }

  if (serveSync('./test-app' + urlPath, res)) return

  const ext = path.extname(urlPath)
  if (ext) {
    res.writeHead(404)
    res.end('Not found')
    return
  }
  serveSync('./test-app/index.html', res)
}).listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}/test-app/`)
})
