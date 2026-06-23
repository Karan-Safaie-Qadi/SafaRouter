import { HTTP_STATUS_TEXT, ERROR_GROUP_MAP, ERROR_GROUPS } from './constants.js'

export class ErrorManager {
  constructor(config = {}) {
    this._config = config
    this._cache = new Map()
    this._maxCacheSize = 50
    this._defaultPages = this._buildDefaultPages()
  }

  getStatusConfig(statusCode) {
    const errors = this._config.errors || {}
    const globalEnabled = errors.enabled !== false
    const statusConfig = errors.status?.[statusCode]
    if (statusConfig && statusConfig.enabled === false) {
      return { enabled: false }
    }
    const group = ERROR_GROUP_MAP[statusCode] || ERROR_GROUPS.CLIENT_ERROR
    const groupConfig = errors.groups?.[group]
    if (groupConfig && groupConfig.enabled === false) {
      return { enabled: false }
    }
    const redirect = errors.redirect?.[statusCode]
    return {
      enabled: globalEnabled,
      page: statusConfig?.page || groupConfig?.page || null,
      component: statusConfig?.component || groupConfig?.component || null,
      redirect: redirect || null,
      group,
    }
  }

  isEnabled(statusCode) {
    return this.getStatusConfig(statusCode).enabled !== false
  }

  getRedirect(statusCode) {
    return this.getStatusConfig(statusCode).redirect || null
  }

  getDefaultPage(statusCode) {
    if (this._defaultPages[statusCode]) {
      return this._defaultPages[statusCode]
    }
    const group = ERROR_GROUP_MAP[statusCode]
    if (group === ERROR_GROUPS.SERVER_ERROR) {
      return this._defaultPages._serverError
    }
    return this._defaultPages._clientError
  }

  async loadCustomPage(statusCode, pageDir, signal) {
    if (!pageDir) return null
    const cacheKey = `custom:${statusCode}`
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)
    }
    const candidates = [
      `${pageDir}/${statusCode}.html`,
      `${pageDir}/${statusCode}.htm`,
    ]
    const group = ERROR_GROUP_MAP[statusCode]
    if (group === ERROR_GROUPS.CLIENT_ERROR) {
      candidates.push(`${pageDir}/4xx.html`, `${pageDir}/client-error.html`)
    } else {
      candidates.push(`${pageDir}/5xx.html`, `${pageDir}/server-error.html`)
    }
    for (const url of candidates) {
      try {
        const res = await fetch(url, { signal })
        if (res.ok) {
          const html = await res.text()
          if (this._maxCacheSize > 0) {
            this._cachePut(cacheKey, html)
          }
          return html
        }
      } catch {
        // continue
      }
    }
    return null
  }

  async resolvePage(statusCode, pageDir, signal) {
    if (this.isEnabled(statusCode)) {
      const custom = await this.loadCustomPage(statusCode, pageDir, signal)
      if (custom) return custom
    }
    return this.getDefaultPage(statusCode)
  }

  formatError(error, showStack) {
    if (showStack !== false && error?.stack) {
      return `${error.message}\n\n${error.stack}`
    }
    return error?.message || 'An error occurred'
  }

  clearCache() {
    this._cache.clear()
  }

  _cachePut(key, value) {
    if (this._cache.has(key)) {
      this._cache.delete(key)
    } else if (this._maxCacheSize > 0 && this._cache.size >= this._maxCacheSize) {
      const first = this._cache.keys().next().value
      this._cache.delete(first)
    }
    this._cache.set(key, value)
  }

  _buildDefaultPages() {
    const codes = Object.keys(HTTP_STATUS_TEXT).map(Number)
    const pages = {}
    for (const code of codes) {
      pages[code] = this._buildPage(code, HTTP_STATUS_TEXT[code])
    }
    pages._clientError = this._buildGenericPage('4xx', 'Client Error')
    pages._serverError = this._buildGenericPage('5xx', 'Server Error')
    return pages
  }

  _buildPage(code, text) {
    const emoji = code >= 500 ? '🔴' : code === 418 ? '🫖' : '⚠️'
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${code} ${text}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#1f2937}
.container{text-align:center;padding:2rem}
.code{font-size:6rem;font-weight:800;color:#e5e7eb;line-height:1}
.emoji{font-size:3rem;margin-bottom:1rem}
.message{font-size:1.25rem;color:#6b7280;margin:1rem 0 2rem}
a{color:#3b82f6;text-decoration:none;font-weight:500}
a:hover{text-decoration:underline}
</style></head>
<body><div class="container">
<div class="emoji">${emoji}</div>
<div class="code">${code}</div>
<div class="message">${text}</div>
<a href="/" onclick="event.preventDefault();window.history.pushState({},'','/');window.location.reload()">← Back to Home</a>
</div></body></html>`
  }

  _buildGenericPage(label, text) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${text}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#1f2937}
.container{text-align:center;padding:2rem}
.code{font-size:6rem;font-weight:800;color:#e5e7eb;line-height:1}
.emoji{font-size:3rem;margin-bottom:1rem}
.message{font-size:1.25rem;color:#6b7280;margin:1rem 0 2rem}
a{color:#3b82f6;text-decoration:none;font-weight:500}
a:hover{text-decoration:underline}
</style></head>
<body><div class="container">
<div class="emoji">⚠️</div>
<div class="code">${label}</div>
<div class="message">${text}</div>
<a href="/" onclick="event.preventDefault();window.history.pushState({},'','/');window.location.reload()">← Back to Home</a>
</div></body></html>`
  }
}
