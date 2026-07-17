import http from 'http'
import fs from 'fs'
import path from 'path'

const MIME = {
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  ico: 'image/x-icon',
}

export class SafaDevServer {
  constructor(config = {}) {
    this.port = config.port || 3000
    this.root = config.root || '.'
    this.basePath = config.basePath || ''
    this.watch = config.watch !== false
    this.watchDirs = config.watchDirs || []
    this.srcDirs = config.srcDirs || []
    this._server = null
    this._sseClients = new Set()
    this._lastChange = { changed: false, path: null, time: 0 }
    this._watchers = []
  }

  start() {
    if (this._server) return this
    this._initWatching()
    this._server = http.createServer((req, res) => this._handle(req, res))
    this._server.listen(this.port, () => {
      const url = this.basePath
        ? `http://localhost:${this.port}${this.basePath}/`
        : `http://localhost:${this.port}/`
      console.log(`SafaDevServer: ${url}`)
    })
    return this
  }

  stop() {
    for (const w of this._watchers) { try { w.close() } catch {} }
    this._watchers = []
    for (const c of this._sseClients) { try { c.destroy() } catch {} }
    this._sseClients.clear()
    if (this._server) { this._server.close(); this._server = null }
    return this
  }

  _initWatching() {
    if (!this.watch) return
    const dirs = [
      ...this.watchDirs,
      ...(this.root ? [`${this.root}/html-pages`, `${this.root}/components`] : []),
      ...this.srcDirs,
    ].filter(Boolean)
    for (const dir of [...new Set(dirs)]) {
      const abs = path.resolve(dir)
      if (fs.existsSync(abs)) {
        try {
          const w = fs.watch(abs, { recursive: true }, (eventType, filename) => {
            if (!filename) return
            const now = Date.now()
            if (now - this._lastChange.time < 200) return
            this._lastChange = { changed: true, path: filename.replace(/\\/g, '/'), time: now }
            this._broadcast(this._lastChange)
          })
          this._watchers.push(w)
        } catch (err) {
          console.warn(`[SafaRouter] Failed to watch directory ${abs}: ${err.message}`)
        }
      }
    }
  }

  _broadcast(data) {
    const msg = `event: change\ndata: ${JSON.stringify(data)}\n\n`
    for (const res of this._sseClients) {
      try { res.write(msg) } catch { this._sseClients.delete(res) }
    }
  }

  _handle(req, res) {
    const urlPath = req.url.split('?')[0]

    if (urlPath === '/__realtime') {
      return this._handleRealtime(req, res)
    }

    // Serve source files from srcDirs
    for (const dir of this.srcDirs) {
      const prefix = `/${dir.replace(/^\.\//, '')}/`
      if (urlPath.startsWith(prefix)) {
        if (this._serveFile('.' + urlPath, res)) return
        break
      }
    }

    // SPA root: serve index.html from root
    if (urlPath === '/') {
      this._serveFile(`${this.root}/index.html`, res)
      return
    }

    // SPA basePath: serve under basePath with SPA fallback
    if (this.basePath && urlPath.startsWith(this.basePath + '/')) {
      const rel = '/' + urlPath.slice(this.basePath.length).replace(/^\/+/, '')
      if (this._serveFile(`${this.root}${rel}`, res)) return
      const ext = path.extname(rel)
      if (ext) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      this._serveFile(`${this.root}/index.html`, res)
      return
    }

    if (this._serveFile(`${this.root}${urlPath}`, res)) return

    const ext = path.extname(urlPath)
    if (ext) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    this._serveFile(`${this.root}/index.html`, res)
  }

  _handleRealtime(req, res) {
    const accept = req.headers.accept || ''
    if (accept.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      })
      res.write('event: change\ndata: {"connected":true}\n\n')
      this._sseClients.add(res)
      req.on('close', () => this._sseClients.delete(res))
      return
    }
    this._lastChange.changed = false
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(this._lastChange))
  }

  _serveFile(filePath, res) {
    try {
      const root = path.resolve(this.root)
      const resolved = path.resolve(root, filePath)
      if (!resolved.startsWith(root + path.sep) && resolved !== root) {
        res.writeHead(403)
        res.end('Forbidden')
        return true
      }
      const data = fs.readFileSync(resolved)
      const ext = path.extname(resolved).slice(1)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(data)
      return true
    } catch {
      return false
    }
  }
}
