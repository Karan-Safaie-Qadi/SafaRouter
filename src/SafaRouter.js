import { RouteTree } from './RouteTree.js'
import { HistoryManager } from './HistoryManager.js'
import { MiddlewareChain } from './MiddlewareChain.js'
import { Link } from './Link.js'
import { PluginManager } from './PluginManager.js'
import { TransitionsManager } from './TransitionsManager.js'
import { ScrollManager } from './ScrollManager.js'
import { normalizePath, parseQuery, emit, createURL, isExternalURL } from './utils.js'
import { EVENTS, DEFAULT_CONFIG } from './constants.js'
import { RouteLoadError, SafaError } from './errors.js'

export class SafaRouter {
  static version = '1.2.5'
  static VERSION = '1.2.5'

  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options }
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
    this._scrollManager = new ScrollManager()

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

    this._transitions = new TransitionsManager({
      transitionDuration: this.config.transitionDuration,
      transitionEnterClass: this.config.transitionEnterClass,
      transitionExitClass: this.config.transitionExitClass,
      transitionEnterActiveClass: this.config.transitionEnterActiveClass,
      transitionExitActiveClass: this.config.transitionExitActiveClass,
    })
    this._plugins = new PluginManager(this)

    this._boundNav = this._onHistoryChange.bind(this)
  }

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

    if (Array.isArray(this.config.plugins)) {
      for (const plugin of this.config.plugins) {
        this._plugins.use(plugin)
      }
    }

    await this._resolve(this._history.path, 'replace')
    emit(this._events, EVENTS.READY, { pathname: this._pathname })
    this._started = true
    return this
  }

  isStarted() { return this._started }

  destroy() {
    this._started = false
    this._plugins.ejectAll()
    if (this._unsubHistory) {
      this._unsubHistory()
      this._unsubHistory = null
    }
    this._history.destroy()
    for (const k of Object.keys(this._events)) this._events[k] = []
    this._cache.clear()
    this._scrollManager.clear()
    this._targetEl = null
    emit(this._events, EVENTS.DESTROY, {})
  }

  async push(url, state = {}) {
    if (isExternalURL(url)) { window.location.href = url; return }
    let u = createURL(url)
    if (!u) {
      try { u = new URL(url, location.origin) } catch { return }
    }
    await this._navigate(normalizePath(u.pathname), 'push', parseQuery(u.search), state)
  }

  async replace(url, state = {}) {
    if (isExternalURL(url)) { window.location.replace(url); return }
    let u = createURL(url)
    if (!u) {
      try { u = new URL(url, location.origin) } catch { return }
    }
    await this._navigate(normalizePath(u.pathname), 'replace', parseQuery(u.search), state)
  }

  async pushRoute(routeName, params = {}, query = {}) {
    const routes = this.config.routes || {}
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
  navigate(url) { return this.push(url) }

  getConfig() { return { ...this.config } }

  get pathname() { return this._pathname }
  get params() { return { ...this._params } }
  get query() { return { ...this._query } }
  get loading() { return this._isLoading }

  on(name, fn) {
    if (!this._events[name]) this._events[name] = []
    this._events[name].push(fn)
    return () => { this._events[name] = this._events[name].filter(f => f !== fn) }
  }

  off(name, fn) {
    if (!this._events[name]) return
    this._events[name] = this._events[name].filter(f => f !== fn)
  }

  use(fn) { this._middleware.use(fn); return this }

  beforeEach(fn) { return this.use(fn) }
  afterEach(fn) { return this.on(EVENTS.AFTER_NAVIGATE, fn) }

  onError(fn) { return this.on(EVENTS.ERROR, fn) }
  onNotFound(fn) { return this.on(EVENTS.NOT_FOUND, fn) }
  onRouteChange(fn) { return this.on(EVENTS.ROUTE_CHANGE, fn) }
  onBeforeNavigate(fn) { return this.on(EVENTS.BEFORE_NAVIGATE, fn) }

  createLink(config) { return new Link({ ...config, router: this }) }

  plugin(plugin) { return this._plugins.use(plugin) }

  ejectPlugin(name) { return this._plugins.eject(name) }

  getPlugin(name) { return this._plugins.get(name) }

  get plugins() { return this._plugins.list() }

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

  clearCache() { this._cache.clear() }

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

  async _fetchPage(path) {
    const candidates = this._resolvePagePath(path)
    if (!candidates) return null
    for (const p of candidates) {
      try {
        const res = await fetch(p)
        if (res.ok) {
          const text = await res.text()
          this._extractTitle(text)
          return text
        }
      } catch { /* try next */ }
    }
    return null
  }

  async _fetchSpecial(path, name) {
    const dir = (this.config.pagesDir || '').replace(/\/+$/, '')
    if (!dir) return null
    const segs = path.split('/').filter(Boolean)
    const dp = segs.slice(0, -1).join('/')
    const candidates = [
      dp ? `${dir}/${dp}/${name}` : null,
      `${dir}/${name}`,
    ].filter(Boolean)
    for (const p of candidates) {
      try {
        const res = await fetch(p)
        if (res.ok) return res.text()
      } catch { /* try next */ }
    }
    return null
  }

  _extractTitle(html) {
    if (typeof DOMParser !== 'undefined') {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const title = doc.querySelector('title')
        this._customTitle = title ? title.textContent.trim() : null
        return
      } catch { /* fall through to regex */ }
    }
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    this._customTitle = m ? m[1].trim() : null
  }

  _renderHtmlLayout(html, children) {
    return html.replace(/\{\s*children\s*\}/gi, children || '')
  }

  async _navigate(path, method, query = {}, state = {}, depth = 0) {
    if (depth > 10) {
      const err = new Error('Redirect loop detected')
      console.error('[SafaRouter]', err.message)
      emit(this._events, EVENTS.ERROR, { error: err, path })
      return
    }
    if (depth === 0) {
      const sameQuery = JSON.stringify(query) === JSON.stringify(this._query)
      if (path === this._pathname && sameQuery) return
    }
    await this._resolve(path, method, query, state, depth)
  }

  async _resolve(path, method, query = {}, state = {}, depth = 0) {
    const navId = ++this._navId
    this._isLoading = true
    this._customTitle = null
    emit(this._events, EVENTS.LOADING, { path, loading: true })
    emit(this._events, EVENTS.BEFORE_NAVIGATE, { path, method })

    try {
      const ctx = { path, method, query, cancelled: false, redirect: null }
      await this._middleware.run(ctx)
      if (this._navId !== navId) { this._isLoading = false; return }
      if (ctx.redirect) return this._navigate(ctx.redirect, 'replace', ctx.query, {}, depth + 1)
      if (ctx.cancelled) { this._isLoading = false; return }

      const routeMatch = this._hasRoutes() ? this._routeTree.resolve(path) : null
      let pageContent, layoutFns = []

      if (routeMatch) {
        if (routeMatch.node.loading) {
          const loadingFn = await this._loadComponent(routeMatch.node.loading)
          if (this._navId !== navId) { this._isLoading = false; return }
          if (loadingFn && this._targetEl) {
            this._targetEl.innerHTML = typeof loadingFn === 'function'
              ? loadingFn({ path, router: this })
              : loadingFn
          }
        }
        pageContent = await this._loadComponent(routeMatch.node.page)
        for (const l of routeMatch.layouts) {
          if (!l) continue
          const lfn = await this._loadComponent(l)
          if (lfn) layoutFns.push(lfn)
        }
        if (this._globalLayout) {
          const lfn = await this._loadComponent(this._globalLayout)
          if (lfn) layoutFns.unshift(lfn)
        }
        this._routeData = routeMatch
      } else if (this.config.pagesDir) {
        const loadingHtml = await this._fetchSpecial(path, 'loading.html')
        if (loadingHtml && this._targetEl) {
          this._targetEl.innerHTML = loadingHtml
        }
        pageContent = this._cacheGet(path)
        if (!pageContent) {
          pageContent = await this._fetchPage(path)
          if (pageContent && this.config.cacheRoutes) this._cachePut(path, pageContent)
        }
        if (pageContent === null) {
          const notFoundHtml = await this._fetchSpecial(path, 'not-found.html')
          if (this._navId !== navId) { this._isLoading = false; return }
          if (notFoundHtml) {
            if (method === 'push') this._history.push(path, state)
            else if (method === 'replace') this._history.replace(path, state)
            this._pathname = path
            this._isLoading = false
            if (this._targetEl) this._targetEl.innerHTML = notFoundHtml
            return
          }
          await this._handleNotFound(path, method, navId, state)
          this._isLoading = false
          return
        }
        if (this._navId !== navId) { this._isLoading = false; return }
        if (this._globalLayout) {
          let lfn = this._globalLayout
          if (typeof lfn === 'string') {
            const res = await fetch(lfn)
            if (res.ok) {
              const html = await res.text()
              lfn = ({ children }) => this._renderHtmlLayout(html, children)
            }
          }
          const loaded = await this._loadComponent(lfn)
          if (loaded) layoutFns.push(loaded)
        }
        this._routeData = { node: { page: null }, params: {}, layouts: [] }
      } else {
        await this._handleNotFound(path, method, navId, state)
        this._isLoading = false
        return
      }

      if (this._navId !== navId) { this._isLoading = false; return }

      this._scrollManager.save(this._pathname)

      this._pathname = path
      this._params = routeMatch?.params || {}
      this._query = query

      emit(this._events, EVENTS.BEFORE_RENDER, { pathname: path })
      await this._render(pageContent, layoutFns)
      emit(this._events, EVENTS.AFTER_RENDER, { pathname: path })

      if (this._navId !== navId) { this._isLoading = false; return }

      if (method === 'push') this._history.push(path, state)
      else if (method === 'replace') this._history.replace(path, state)

      this._isLoading = false

      this._scrollManager.restore(this._pathname, this.config.scrollToTop)
      this._updateTitle()
      this._focus()

      emit(this._events, EVENTS.ROUTE_CHANGE, {
        pathname: path, params: this._params, query: this._query,
      })
      emit(this._events, EVENTS.AFTER_NAVIGATE, { pathname: path })
    } catch (err) {
      this._isLoading = false
      await this._handleError(path, err, navId)
    }
  }

  async _render(pageContent, layoutFns) {
    if (!this._targetEl) return

    const html = layoutFns.length > 0
      ? await this._renderWithLayouts(pageContent, layoutFns, 0)
      : (typeof pageContent === 'function'
          ? pageContent({ params: this._params, query: this._query, router: this })
          : (pageContent || ''))

    if (this.config.transitionDuration > 0) {
      await this._transitions.run(this._targetEl, async () => {
        this._targetEl.innerHTML = html
        this._bindLinks()
      })
    } else {
      this._targetEl.innerHTML = html
      this._bindLinks()
    }
  }

  async _renderWithLayouts(pageContent, layoutFns, idx) {
    if (idx >= layoutFns.length) {
      if (typeof pageContent === 'function') {
        return pageContent({ params: this._params, query: this._query, router: this })
      }
      return pageContent || ''
    }
    const layoutFn = layoutFns[idx]
    const content = await this._renderWithLayouts(pageContent, layoutFns, idx + 1)
    return layoutFn({ children: content, params: this._params, query: this._query, router: this })
  }

  _updateTitle() {
    const template = this.config.titleTemplate
    if (!template) return

    let title = this._customTitle
    if (!title) title = this._routeData?.node?.meta?.title
    if (!title) title = this._routeData?.node?.segment
    if (!title) title = this._pathname.replace(/[/-]/g, ' ').trim()
    if (!title) title = 'Home'

    document.title = template.replace('%s', title.charAt(0).toUpperCase() + title.slice(1))
  }

  _focus() {
    if (!this._targetEl) return
    const h1 = this._targetEl.querySelector('h1')
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    }
  }

  _bindLinks() {
    if (!this._targetEl) return
    const links = this._targetEl.querySelectorAll('[data-safa-link]')
    for (const el of links) {
      if (el.getAttribute('target') === '_blank') continue
      el.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        if (e.button !== 0) return
        e.preventDefault()
        const href = el.getAttribute('href')
        if (href) this.push(href)
      })
    }
  }

  async _loadComponent(mod) {
    if (!mod) return null
    try {
      if (typeof mod === 'string') {
        if (mod.endsWith('.js') || mod.endsWith('.mjs')) {
          const resolved = await import(mod)
          const page = resolved.default || resolved
          return page
        }
        let url = mod
        if (this._params && Object.keys(this._params).length > 0) {
          for (const [k, v] of Object.entries(this._params)) {
            const val = Array.isArray(v) ? v.join('/') : String(v)
            url = url.replaceAll(`[${k}]`, val)
          }
        }
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`)
        const text = await res.text()
        this._extractTitle(text)
        return text
      }
      if (typeof mod === 'function') return mod
      return mod
    } catch (e) {
      throw new RouteLoadError(
        typeof mod === 'string' ? mod : (typeof mod === 'function' ? mod.name || 'anonymous' : 'module'),
        e
      )
    }
  }

  async _handleNotFound(path, method, navId, state = {}) {
    if (navId !== undefined && this._navId !== navId) { this._isLoading = false; return }
    emit(this._events, EVENTS.NOT_FOUND, { path })

    const notFoundHtml = this.config.pagesDir ? await this._fetchSpecial(path, 'not-found.html') : null
    if (notFoundHtml) {
      if (method === 'push') this._history.push(path, state)
      else if (method === 'replace') this._history.replace(path, state)
      this._pathname = path
      if (this._targetEl) {
        this._targetEl.innerHTML = this._globalLayout
          ? await this._renderWithLayouts(notFoundHtml, [this._globalLayout], 0)
          : notFoundHtml
      }
      return
    }

    this._routeData = null
    const notFound = this._globalNotFound
    if (notFound) {
      try {
        const fn = await this._loadComponent(notFound)
        if (method === 'push') this._history.push(path, state)
        else if (method === 'replace') this._history.replace(path, state)
        this._pathname = path
        let html = typeof fn === 'function' ? fn({ path, router: this }) : fn
        if (this._globalLayout) {
          const lfn = await this._loadComponent(this._globalLayout)
          if (lfn) html = await this._renderWithLayouts(html, [lfn], 0)
        }
        if (this._targetEl) this._targetEl.innerHTML = html
        return
      } catch { /* fall through */ }
    }
    if (this._targetEl) this._targetEl.innerHTML = this._fallback404(path)
  }

  async _handleError(path, err, navId) {
    if (navId !== undefined && this._navId !== navId) { this._isLoading = false; return }
    console.error('[SafaRouter]', err)
    emit(this._events, EVENTS.ERROR, { path, error: err })

    const routeError = this._routeData?.node?.error
    if (routeError) {
      try {
        const fn = await this._loadComponent(routeError)
        let html = typeof fn === 'function' ? fn({ error: err, path, router: this }) : fn
        if (this._globalLayout) {
          const lfn = await this._loadComponent(this._globalLayout)
          if (lfn) html = await this._renderWithLayouts(html, [lfn], 0)
        }
        if (this._targetEl) this._targetEl.innerHTML = html
        return
      } catch { /* fall through */ }
    }

    const errorHtml = this.config.pagesDir ? await this._fetchSpecial(path, 'error.html') : null
    if (errorHtml) {
      if (this._targetEl) this._targetEl.innerHTML = errorHtml
      return
    }

    if (this._globalError) {
      try {
        const fn = await this._loadComponent(this._globalError)
        let html = typeof fn === 'function' ? fn({ error: err, path, router: this }) : fn
        if (this._globalLayout) {
          const lfn = await this._loadComponent(this._globalLayout)
          if (lfn) html = await this._renderWithLayouts(html, [lfn], 0)
        }
        if (this._targetEl) this._targetEl.innerHTML = html
        return
      } catch { /* fall through */ }
    }
    if (this._targetEl) {
      try { this._targetEl.innerHTML = this._fallbackError(err) }
      catch { this._targetEl.textContent = `Error: ${err.message}` }
    }
  }

  _fallback404(path) {
    const homeLink = `<a href="/" style="color:var(--color-accent);text-decoration:underline;">Back to home</a>`
    return [
      '<div class="safa-error safa-404" style="text-align:center;padding:3rem 0;">',
      `<h1 style="font-size:4rem;font-weight:800;margin-bottom:0.5rem;">404</h1>`,
      `<p style="margin-bottom:1rem;">Page not found: <code>${path}</code></p>`,
      homeLink,
      '</div>',
    ].join('')
  }

  _fallbackError(err) {
    const homeLink = `<a href="/" style="color:var(--color-accent);text-decoration:underline;">Back to home</a>`
    return [
      '<div class="safa-error" style="text-align:center;padding:3rem 0;">',
      '<h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;">Something went wrong</h1>',
      `<pre style="text-align:left;margin:1rem 0;">${err.message}</pre>`,
      homeLink,
      '</div>',
    ].join('')
  }

  get currentRoute() { return this._routeData }

  get matchedRoute() {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[SafaRouter] Deprecated: use `currentRoute` instead of `matchedRoute`')
    }
    return this._routeData
  }

  getRoute(path) { return this._routeTree.resolve(normalizePath(path)) }

  _onHistoryChange({ path, action, state }) {
    if (action === 'back') return
    if (action === 'popstate') {
      this._resolve(path, 'replace')
      if (state && state._scrollY !== undefined) {
        if (this.config.scrollToTop) {
          window.scrollTo(0, 0)
        } else {
          requestAnimationFrame(() => window.scrollTo(0, state._scrollY))
        }
      }
    }
  }
}
