import { RouteTree } from '../RouteTree.js'
import { HistoryManager } from '../HistoryManager.js'
import { MiddlewareChain } from '../MiddlewareChain.js'
import { Link } from '../Link.js'
import { normalizePath, parseQuery, emit, createURL, isExternalURL, deepMerge } from '../utils.js'
import { EVENTS, DEFAULT_CONFIG } from '../constants.js'
import { SafaError } from '../errors.js'

export class SafaRouter {
  static version = '1.5.0'
  static VERSION = '1.5.0'

  constructor(options = {}) {
    this.config = deepMerge(DEFAULT_CONFIG, options)
    if (this.config.pageDir && !this.config.pagesDir) {
      this.config.pagesDir = this.config.pageDir
    }

    this._events = {}
    for (const key of Object.values(EVENTS)) this._events[key] = []

    this._history = new HistoryManager({
      useHash: this.config.useHash,
      basePath: this.config.basePath,
    })
    this._middleware = new MiddlewareChain()
    this._cache = new Map()
    this._maxCacheSize = this.config.maxCacheSize ?? 50
    this._abortController = null
    this._prefetched = new Set()

    this._pathname = '/'
    this._params = {}
    this._query = {}
    this._routeData = null
    this._isLoading = false
    this._started = false
    this._targetEl = null
    this._navId = 0

    this._globalNotFound = this.config.notFound || null
    this._globalError = this.config.error || null
    this._globalLayout = this.config.layout || null
    this._customTitle = null

    this._features = {}
    this._featureInstances = {}
    this._hooks = { beforeNavigate: [], afterNavigate: [] }
    this._boundNav = this._onHistoryChange.bind(this)
  }

  // ─── Feature Plugin API ─────────────────────────
  use(featureModule, instance) {
    if (!featureModule || !featureModule.name) return this
    if (this._features[featureModule.name]) return this
    this._features[featureModule.name] = featureModule
    if (instance) this._featureInstances[featureModule.name] = instance
    if (featureModule.init) {
      featureModule.init(this, instance || this.config)
    }
    return this
  }

  getFeature(name) {
    return this._featureInstances[name] || null
  }

  // ─── Lifecycle ─────────────────────────────────
  async start(target) {
    if (this._started) return
    if (target) this.config.target = target

    this._targetEl =
      typeof this.config.target === 'string'
        ? document.querySelector(this.config.target)
        : this.config.target

    if (!this._targetEl) {
      throw new SafaError(
        `Target element "${this.config.target}" not found`,
        'INIT_ERROR'
      )
    }

    this._routeTree = new RouteTree(this.config.routes || {})
    this._history.init()
    this._unsubHistory = this._history.onChange(this._boundNav)

    for (const [name, feature] of Object.entries(this._features)) {
      if (feature.init) feature.init(this, this._featureInstances[name] || this.config)
    }

    await this._resolve(this._history.path, 'replace')
    emit(this._events, EVENTS.READY, { pathname: this._pathname })
    this._started = true
    return this
  }

  isStarted() { return this._started }

  destroy() {
    this._started = false
    for (const [name, feature] of Object.entries(this._features)) {
      if (feature.destroy) feature.destroy(this)
    }
    if (this._unsubHistory) {
      this._unsubHistory()
      this._unsubHistory = null
    }
    this._history.destroy()
    for (const k of Object.keys(this._events)) this._events[k] = []
    this._cache.clear()
    this._prefetched.clear()
    if (this._linkObserver) { this._linkObserver.disconnect(); this._linkObserver = null }
    this._targetEl = null
    emit(this._events, EVENTS.DESTROY, {})
  }

  // ─── Navigation ────────────────────────────────
  async push(url, state = {}) {
    if (isExternalURL(url)) { window.location.href = url; return }
    let u = createURL(url)
    if (!u) {
      try { u = new URL(url, location.origin) } catch { console.warn(`[SafaRouter] Invalid URL: ${url}`); return }
    }
    await this._navigate(normalizePath(u.pathname), 'push', parseQuery(u.search), state)
  }

  async replace(url, state = {}) {
    if (isExternalURL(url)) { window.location.replace(url); return }
    let u = createURL(url)
    if (!u) {
      try { u = new URL(url, location.origin) } catch { console.warn(`[SafaRouter] Invalid URL: ${url}`); return }
    }
    await this._navigate(normalizePath(u.pathname), 'replace', parseQuery(u.search), state)
  }

  async pushRoute(routeName, params = {}, query = {}) {
    if (!this._started) throw new SafaError('Router not started. Call start() first.', 'NOT_STARTED')
    const flat = this._routeTree.flatten()
    const matched = flat.find(r => r.meta?.name === routeName || r.path === routeName)
    if (!matched) throw new SafaError(`Route "${routeName}" not found`, 'ROUTE_NOT_FOUND')
    const qs = Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''
    return this.push(matched.path + qs)
  }

  back() {
    emit(this._events, EVENTS.BEFORE_NAVIGATE, { path: this._pathname, method: 'back' })
    this._history.back()
  }

  forward() {
    emit(this._events, EVENTS.BEFORE_NAVIGATE, { path: this._pathname, method: 'forward' })
    this._history.forward()
  }

  reload() { this._resolve(this._pathname, 'replace') }

  get pathname() { return this._pathname }
  get params() { return { ...this._params } }
  get query() { return { ...this._query } }
  get loading() { return this._isLoading }

  // ─── Events ────────────────────────────────────
  on(name, fn) {
    if (!this._events[name]) this._events[name] = []
    this._events[name].push(fn)
    return () => { this._events[name] = this._events[name].filter(f => f !== fn) }
  }

  off(name, fn) {
    if (!this._events[name]) return
    this._events[name] = this._events[name].filter(f => f !== fn)
  }

  beforeEach(fn) { this._middleware.use(fn); return this }
  afterEach(fn) { return this.on(EVENTS.AFTER_NAVIGATE, fn) }

  onError(fn) { return this.on(EVENTS.ERROR, fn) }
  onNotFound(fn) { return this.on(EVENTS.NOT_FOUND, fn) }
  onRouteChange(fn) { return this.on(EVENTS.ROUTE_CHANGE, fn) }
  onBeforeNavigate(fn) { return this.on(EVENTS.BEFORE_NAVIGATE, fn) }
  onAccessDenied(fn) { return this.on(EVENTS.ACCESS_DENIED, fn) }
  onMaintenance(fn) { return this.on(EVENTS.MAINTENANCE, fn) }

  // ─── Middleware ─────────────────────────────────
  useNamed(name, fn, priority = 0) {
    this._middleware.useNamed(name, fn, priority)
    return this
  }

  middleware(name) {
    return this._middleware.remove(name)
  }

  insertMiddlewareBefore(refName, fn, priority = 0) {
    this._middleware.insertBefore(refName, fn, priority)
    return this
  }

  insertMiddlewareAfter(refName, fn, priority = 0) {
    this._middleware.insertAfter(refName, fn, priority)
    return this
  }

  // ─── Cache ─────────────────────────────────────
  _cachePut(key, value) {
    if (this._cache.has(key)) this._cache.delete(key)
    while (this._maxCacheSize > 0 && this._cache.size >= this._maxCacheSize) {
      const oldest = this._cache.keys().next().value
      if (oldest !== undefined) this._cache.delete(oldest)
    }
    this._cache.set(key, value)
  }

  _cacheGet(key) {
    if (!this._cache.has(key)) return undefined
    const val = this._cache.get(key)
    this._cache.delete(key)
    this._cache.set(key, val)
    return val
  }

  async prefetch(path) {
    const normalized = normalizePath(path)
    if (this._cacheGet(normalized)) return
    const page = await this._fetchPage(normalized)
    if (page && this.config.cacheRoutes) {
      this._cachePut(normalized, page)
    }
  }

  _addPrefetchLink(url) {
    if (typeof document === 'undefined' || this._prefetched.has(url)) return
    this._prefetched.add(url)
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'document'
    document.head.appendChild(link)
  }

  clearCache() { this._cache.clear() }

  // ─── Navigation internals ─────────────────────
  async _onHistoryChange(path) {
    await this._navigate(path, 'replace', {})
  }

  async _navigate(path, method, query, state, depth = 0) {
    if (depth > 10) {
      emit(this._events, EVENTS.ERROR, { path, error: new Error(`Redirect loop detected: ${path}`) })
      return
    }

    this._navId++
    emit(this._events, EVENTS.BEFORE_NAVIGATE, { path, method })
    if (!this._started) {
      await this.start()
      return
    }

    if (this._abortController && !this.config.disableAbort) {
      this._abortController.abort()
    }
    this._abortController = new AbortController()

    const before = { pathname: this._pathname, params: this._params, query: this._query }
    try {
      const middlewareResult = await this._middleware.run({ path, method, state, query, router: this }, depth)
      if (middlewareResult === false) {
        emit(this._events, EVENTS.ERROR, { path, error: new Error('Navigation cancelled by middleware') })
        return
      }
    } catch (err) {
      emit(this._events, EVENTS.ERROR, { path, error: err })
      return
    }

    for (const hook of this._hooks.beforeNavigate) {
      const result = await hook({ path, method, state, query, router: this })
      if (result === false) return
    }

    const result = await this._resolvePage(path, query, method, state, this._navId)
    if (!result) return

    const { content, statusCode } = result
    if (this._navId !== result._navId) return

    if (!this.config.disableTitle) {
      const titleEl = content ? content.match(/<title>([^<]*)<\/title>/i) : null
      if (titleEl && titleEl[1]) {
        document.title = titleEl[1]
      } else if (this._customTitle) {
        document.title = this._customTitle
      }
    }

    this._pathname = path
    this._params = result.params || {}
    this._query = { ...query }
    this._routeData = result.routeData

    this._updateHistory(method, state)
    this._render(content)
    this._observeLinks()

    emit(this._events, EVENTS.ROUTE_CHANGE, {
      path, method, params: this._params, query: this._query,
      state, before, statusCode,
    })
    emit(this._events, EVENTS.AFTER_NAVIGATE, {
      path, method, params: this._params, query: this._query, statusCode,
    })
    for (const hook of this._hooks.afterNavigate) {
      hook({ path, method, statusCode, router: this })
    }
  }

  _updateHistory(method, state) {
    if (method === 'push') this._history.push(this._pathname, state)
    else if (method === 'replace') this._history.replace(this._pathname, state)
  }

  async _resolvePage(path, query, method, state, navId) {
    if (this.config.cacheRoutes) {
      const cached = this._cacheGet(path)
      if (cached) return { content: cached, statusCode: 200, _navId: navId }
    }
    return null
  }

  _render(content) {
    if (this._targetEl) {
      this._targetEl.innerHTML = content || ''
    }
  }

  _observeLinks() {
    if (typeof IntersectionObserver === 'undefined') return
    if (this._linkObserver) this._linkObserver.disconnect()
    this._linkObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const href = entry.target.getAttribute('href')
          if (href && !isExternalURL(href)) this.prefetch(href)
          this._linkObserver.unobserve(entry.target)
        }
      }
    }, { rootMargin: '200px' })
    if (!this._targetEl || typeof this._targetEl.querySelectorAll !== 'function') return
    const links = this._targetEl.querySelectorAll('a[href]')
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') continue
      this._linkObserver.observe(link)
    }
  }

  _bindLinks() {
    if (!this._targetEl || typeof this._targetEl.querySelectorAll !== 'function') return
    const links = this._targetEl.querySelectorAll('[data-safa-link]')
    for (const el of links) {
      const href = el.getAttribute('href')
      if (!href || el.getAttribute('target') === '_blank') continue
      el.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        if (e.button !== 0) return
        e.preventDefault()
        this.push(href)
      })
    }
  }

  // ─── Route resolution helpers ──────────────────
  _resolveUrl(p) {
    if (p.startsWith('http://') || p.startsWith('https://')) return p
    if (p.startsWith('./')) p = p.slice(2)
    if (p.startsWith('/')) return normalizePath(p) || '/'
    const base = this.config.basePath ? this.config.basePath.replace(/\/+$/, '') + '/' : '/'
    return normalizePath(base + p)
  }

  _resolvePagePath(path) {
    const dir = (this.config.pagesDir || '').replace(/\/+$/, '')
    if (!dir) return null
    const normal = normalizePath(path)
    if (normal === '/') return [`${dir}/index.html`]
    const candidates = [
      `${dir}${normal}.html`,
      `${dir}${normal}/index.html`,
    ]
    const segs = normal.split('/').filter(Boolean)
    const dynSeg = segs.findIndex(s => s.startsWith('['))
    if (dynSeg >= 0) return candidates
    const parent = segs.slice(0, -1).join('/')
    const last = segs[segs.length - 1]
    if (parent) {
      candidates.push(`${dir}/${parent}/[slug].html`)
      candidates.push(`${dir}/${parent}/[slug]/index.html`)
    }
    candidates.push(`${dir}/[slug].html`)
    candidates.push(`${dir}/[slug]/index.html`)
    return candidates
  }

  _hasRoutes() {
    return this.config.routes && typeof this.config.routes === 'object' && Object.keys(this.config.routes).length > 0
  }

  async _fetchPage(url) {
    const dir = (this.config.pagesDir || '').replace(/\/+$/, '')
    const candidates = this._resolvePagePath(url)
    if (!candidates) return null
    for (const c of candidates) {
      try {
        const res = await fetch(c)
        if (res.ok) return await res.text()
      } catch {}
    }
    return null
  }

  _resolveTemplate(content) {
    if (typeof content !== 'string') return ''
    let result = content
    if (this.config.templateData) {
      for (const [key, val] of Object.entries(this.config.templateData)) {
        result = result.replaceAll(`{{${key}}}`, String(val))
      }
    }
    return result
  }

  // ─── Utils ─────────────────────────────────────
  getConfig() { return { ...this.config } }

  createLink(config) { return new Link({ ...config, router: this }) }

  async retry(path, options = {}) {
    const method = options.method || 'push'
    const query = options.query || {}
    const state = options.state || {}
    const retries = options.retries || 3
    for (let i = 0; i < retries; i++) {
      try {
        await this._navigate(path, method, query, state, 0)
        return
      } catch (err) {
        if (i === retries - 1) throw err
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }
}
