import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 3000

const MIME = {
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  ico: 'image/x-icon',
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

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0]

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
    serveSync('./test-app/index.html', res)
    return
  }

  if (serveSync('./test-app' + urlPath, res)) return

  serveSync('./test-app/index.html', res)
}).listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}/test-app/`)
})
