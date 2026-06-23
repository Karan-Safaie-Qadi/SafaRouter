import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 3000
const ROOT = '.'

const MIME = {
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  ico: 'image/x-icon',
}

function serve(filePath, res) {
  const ext = path.extname(filePath).slice(1)
  const ct = MIME[ext] || 'application/octet-stream'
  fs.readFile(filePath, (err, data) => {
    if (err) return false
    res.writeHead(200, { 'Content-Type': ct })
    res.end(data)
    return true
  })
  return true
}

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]

  // Serve src/ files from project root
  if (urlPath.startsWith('/src/')) {
    if (serve('.' + urlPath, res)) return
    res.writeHead(404)
    res.end('Not found')
    return
  }

  // Serve test-app static files
  let filePath = './test-app' + urlPath
  if (urlPath === '/') filePath = './test-app/index.html'
  if (urlPath.startsWith('/test-app/')) {
    filePath = '.' + urlPath
  }

  if (serve(filePath, res)) return

  // SPA fallback: serve test-app/index.html for any unmatched /test-app/* path
  if (urlPath.startsWith('/test-app/') || urlPath.startsWith('/test-app')) {
    serve('./test-app/index.html', res)
    return
  }

  // Fallback for other paths
  serve('./test-app/index.html', res)
}).listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}/test-app/`)
})
