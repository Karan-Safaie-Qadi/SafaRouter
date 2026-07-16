import { RouteTree } from './RouteTree.js'
import { HistoryManager } from './HistoryManager.js'
import { MiddlewareChain } from './MiddlewareChain.js'
import { Link } from './Link.js'
import { PluginManager } from './PluginManager.js'
import { TransitionsManager } from './TransitionsManager.js'
import { ScrollManager } from './ScrollManager.js'
import { RealtimeManager } from './RealtimeManager.js'
import { normalizePath, parseQuery, emit, createURL, isExternalURL, deepMerge } from './utils.js'
import { EVENTS, DEFAULT_CONFIG, HTTP_STATUS } from './constants.js'
import { RouteLoadError, SafaError, NavigationAbortError, HttpError, MaintenanceModeError } from './errors.js'
import { ErrorManager } from './ErrorManager.js'
import { AccessController } from './AccessController.js'
import { LoaderCache } from './LoaderCache.js'

export class SafaRouter {
  static version = '2.0.1'
  static VERSION = '2.0.1'

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
    this._scrollManager = new ScrollManager()
    this._errorManager = new ErrorManager(this.config)
    this._accessController = new AccessController(this.config)
    this._loaderCache = new LoaderCache({
      staleTime: this.config.loaderStaleTime ?? 30000,
      enabled: this.config.loaderCache !== false,
      maxSize: this.config.loaderCacheMaxSize ?? 100,
    })

    this._pathname = '/'
    this._params = {}
    this._query = {}
    this._routeData = null
    this._isLoading = false
    this._started = false
    this._targetEl = null
    this._navId = 0
    this._maintenanceMode = this.config.maintenanceMode?.enabled || false
    this._interceptActive = false
    this._previousRouteData = null
    this._previousScrollY = 0

    this._globalNotFound = this.config.notFound || null
    this._globalError = this.config.error || null
    this._globalLayout = this.config.layout || null
    this._customTitle = null
    this._components = this.config.components || {}

    this._transitions = new TransitionsManager({
      transitionDuration: this.config.transitionDuration,
      transitionEnterClass: this.config.transitionEnterClass,
      transitionExitClass: this.config.transitionExitClass,
      transitionEnterActiveClass: this.config.transitionEnterActiveClass,
      transitionExitActiveClass: this.config.transitionExitActiveClass,
    })
    this._realtime = new RealtimeManager(this, this.config.realtime)
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

    this._initGlobalLinkHandler()
    await this._resolve(this._history.path, 'replace')
    this._realtime.start()
    emit(this._events, EVENTS.READY, { pathname: this._pathname })
    this._started = true
    return this
  }

  _initGlobalLinkHandler() {
    if (this._globalLinkHandler) return
    this._globalLinkHandler = (e) => {
      const link = e.target.closest('[data-safa-link]')
      if (!link || link.getAttribute('target') === '_blank') return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.button !== 0) return
      const href = link.getAttribute('href')
      if (!href) return
      e.preventDefault()
      this.push(href)
    }
    document.addEventListener('click', this._globalLinkHandler)
  }

  isStarted() { return this._started }

  destroy() {
    this._started = false
    this._realtime.destroy()
    this._plugins.ejectAll()
    if (this._unsubHistory) {
      this._unsubHistory()
      this._unsubHistory = null
    }
    this._history.destroy()
    for (const k of Object.keys(this._events)) this._events[k] = []
    this._cache.clear()
    this._loaderCache.clear()
    this._prefetched.clear()
    if (this._linkObserver) { this._linkObserver.disconnect(); this._linkObserver = null }
    this._scrollManager.clear()
    if (this._globalLinkHandler) {
      document.removeEventListener('click', this._globalLinkHandler)
      this._globalLinkHandler = null
    }
    if (this._interceptOverlay) { this._interceptOverlay.remove(); this._interceptOverlay = null }
    this._interceptActive = false
    this._targetEl = null
    emit(this._events, EVENTS.DESTROY, {})
  }

  _stripBase(path) {
    const base = this.config.basePath?.replace(/\/+$/, '')
    if (base && typeof path === 'string' && path.startsWith(base + '/')) {
      path = path.slice(base.length)
    }
    return path === '' || path === base ? '/' : path
  }

  async push(url, state = {}) {
    if (isExternalURL(url)) { window.location.href = url; return }
    let u = createURL(url)
    if (!u) {
      try { u = new URL(url, location.origin) } catch { console.warn(`[SafaRouter] Invalid URL: ${url}`); return }
    }
    await this._navigate(this._stripBase(normalizePath(u.pathname)), 'push', parseQuery(u.search), state)
  }

  async replace(url, state = {}) {
    if (isExternalURL(url)) { window.location.replace(url); return }
    let u = createURL(url)
    if (!u) {
      try { u = new URL(url, location.origin) } catch { console.warn(`[SafaRouter] Invalid URL: ${url}`); return }
    }
    await this._navigate(this._stripBase(normalizePath(u.pathname)), 'replace', parseQuery(u.search), state)
  }

  async pushRoute(routeName, params = {}, query = {}) {
    if (!this._started) throw new SafaError('Router not started. Call start() first.', 'NOT_STARTED')
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

  /** @deprecated Use push(url) instead */
  navigate(url) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[SafaRouter] navigate() is deprecated. Use push() instead.')
    }
    return this.push(url)
  }

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
  onAccessDenied(fn) { return this.on(EVENTS.ACCESS_DENIED, fn) }
  onMaintenance(fn) { return this.on(EVENTS.MAINTENANCE, fn) }

  async retry(path, options = {}) {
    const method = options.method || 'push'
    const query = options.query || {}
    const state = options.state || {}
    const depth = options.depth || 0
    const retries = options.retries || 3
    for (let i = 0; i < retries; i++) {
      try {
        await this._navigate(path, method, query, state, depth)
        return
      } catch (err) {
        if (i === retries - 1) throw err
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }

  createLink(config) { return new Link({ ...config, router: this }) }

  plugin(plugin) { this._plugins.use(plugin); return this }

  ejectPlugin(name) { return this._plugins.eject(name) }

  getPlugin(name) { return this._plugins.get(name) }

  get plugins() { return this._plugins.list() }

  get errorManager() { return this._errorManager }
  get accessController() { return this._accessController }

  isMaintenance() { return this._maintenanceMode }

  setMaintenance(enabled, opts = {}) {
    this._maintenanceMode = enabled
    if (enabled) {
      if (opts.page) this.config.maintenanceMode.page = opts.page
      if (opts.component) this.config.maintenanceMode.component = opts.component
      if (opts.allowedPaths) this.config.maintenanceMode.allowedPaths = opts.allowedPaths
    }
  }

  blockRoute(pattern) { this._accessController.block(pattern); return this }
  unblockRoute(pattern) { this._accessController.unblock(pattern); return this }
  ignoreRoute(pattern) { this._accessController.ignore(pattern); return this }
  unignoreRoute(pattern) { this._accessController.unignore(pattern); return this }

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

  _addPrefetchLink(url) {
    if (typeof document === 'undefined' || this._prefetched.has(url)) return
    this._prefetched.add(url)
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'document'
    document.head.appendChild(link)
  }

  clearCache() { this._cache.clear(); this._loaderCache.clear() }

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

  async _fetchPage(path, signal) {
    const candidates = this._resolvePagePath(path)
    if (!candidates) return null
    for (const p of candidates) {
      try {
        const url = this._resolveUrl(p)
        const res = await fetch(url, { signal })
        if (res.ok) {
          const text = await res.text()
          this._extractTitle(text)
          this._addPrefetchLink(p)
          return text
        }
      } catch {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      }
    }
    return null
  }

  async _fetchSpecial(path, name, signal) {
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
        const url = this._resolveUrl(p)
        const res = await fetch(url, { signal })
        if (res.ok) return res.text()
      } catch {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      }
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
      const err = new Error(`Redirect loop detected: ${path}`)
      this._errorManager.log(HTTP_STATUS.LOOP_DETECTED, path, err)
      console.error('[SafaRouter]', err.message)
      this._isLoading = false
      this._abortFetch()
      emit(this._events, EVENTS.ERROR, { error: err, path, statusCode: HTTP_STATUS.LOOP_DETECTED })
      emit(this._events, EVENTS.LOADING, { path, loading: false })
      return
    }
    if (depth === 0) {
      const sameQuery = JSON.stringify(query) === JSON.stringify(this._query)
      if (path === this._pathname && sameQuery) return
    }
    await this._resolve(path, method, query, state, depth)
  }

  _abortFetch() {
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
  }

  async _resolve(path, method, query = {}, state = {}, depth = 0) {
    const navId = ++this._navId
    this._abortFetch()
    this._abortController = new AbortController()
    const signal = this._abortController.signal
    this._isLoading = true
    this._customTitle = null

    const timeout = this.config.navigationTimeout
    let timeoutId
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (this._navId !== navId) return
        this._isLoading = false
        this._abortFetch()
        const err = new Error(`Navigation timed out after ${timeout}ms`)
        this._errorManager.log(HTTP_STATUS.REQUEST_TIMEOUT, path, err)
        emit(this._events, EVENTS.ERROR, { error: err, path, statusCode: HTTP_STATUS.REQUEST_TIMEOUT })
        console.error('[SafaRouter]', err.message)
      }, timeout)
    }

    emit(this._events, EVENTS.LOADING, { path, loading: true })
    emit(this._events, EVENTS.BEFORE_NAVIGATE, { path, method })

    try {
      const ctx = { path, method, query, cancelled: false, redirect: null }
      await this._middleware.run(ctx)
      if (this._navId !== navId) { this._isLoading = false; return }
      if (ctx.redirect) return this._navigate(ctx.redirect, 'replace', ctx.query, {}, depth + 1)
      if (ctx.cancelled) {
        const abortErr = new NavigationAbortError()
        this._errorManager.log(HTTP_STATUS.REQUEST_TIMEOUT, path, abortErr)
        emit(this._events, EVENTS.ERROR, { path, error: abortErr, statusCode: HTTP_STATUS.REQUEST_TIMEOUT })
        this._isLoading = false
        return
      }

      // ── Maintenance mode check ──
      if (this._maintenanceMode) {
        const allowed = this.config.maintenanceMode?.allowedPaths || []
        const bypasses = allowed.some(pat => {
          if (pat.endsWith('**')) return path.startsWith(pat.slice(0, -2))
          if (pat.endsWith('*')) return path.startsWith(pat.slice(0, -1))
          return pat === path
        })
        if (!bypasses) {
          emit(this._events, EVENTS.MAINTENANCE, { path })
          const err = new MaintenanceModeError(path)
          return this._handleError(path, err, navId, signal, HTTP_STATUS.SERVICE_UNAVAILABLE)
        }
      }

      // ── Access control check ──
      const blocked = this._accessController.isBlocked(path)
      if (blocked) {
        emit(this._events, EVENTS.ACCESS_DENIED, { path, reason: blocked.message })
        this._pathname = path
        return this._handleError(path, blocked, navId, signal, HTTP_STATUS.FORBIDDEN)
      }
      if (this._accessController.isIgnored(path)) {
        return this._handleNotFound(path, method, navId, state, signal, null, HTTP_STATUS.NOT_FOUND)
      }

      const routeMatch = this._hasRoutes() ? this._routeTree.resolve(path) : null
      let pageContent, layoutFns = []

      if (routeMatch) {
        // ── Route guard ──
        const guard = routeMatch.node.guard
        if (guard) {
          let guardResult
          try {
            guardResult = await guard({ params: routeMatch.params, query, router: this })
          } catch {}
          if (this._navId !== navId) { this._isLoading = false; return }
          if (guardResult === false || typeof guardResult === 'string') {
            const redirectPath = typeof guardResult === 'string' ? guardResult : '/'
            return this._navigate(redirectPath, 'replace', {}, {}, depth + 1)
          }
        }

        // ── Route data loader (SWR) ──
        const loader = routeMatch.node.loader
        const loaderTtl = routeMatch.node.meta?.loaderTtl
        if (loader) {
          const swr = this._loaderCache.get(routeMatch.node.fullPath || path, routeMatch.params, query)
          if (swr && !swr.stale) {
            routeMatch.data = swr.data
          } else if (swr && swr.stale) {
            routeMatch.data = swr.data
            this._loaderCache.fetch(routeMatch.node.fullPath || path, routeMatch.params, query, () =>
              loader({ params: routeMatch.params, query, router: this }), loaderTtl
            ).then(fresh => {
              if (this._navId === navId) {
                routeMatch.data = fresh
                this._renderComponents()
              }
            }).catch(() => {})
          } else {
            try {
              routeMatch.data = await this._loaderCache.fetch(
                routeMatch.node.fullPath || path, routeMatch.params, query,
                () => loader({ params: routeMatch.params, query, router: this }), loaderTtl
              )
              if (this._navId !== navId) { this._isLoading = false; return }
            } catch (e) {
              if (e instanceof HttpError) throw e
            }
          }
        }

        // ── Parallel slot loaders ──
        const slots = routeMatch.slots
        if (slots) {
          routeMatch.slotData = {}
          const slotEntries = Object.entries(slots)
          await Promise.all(slotEntries.map(async ([name, slot]) => {
            if (!slot.loader) return
            try {
              routeMatch.slotData[name] = await slot.loader({
                params: routeMatch.params, query, router: this,
              })
            } catch (e) {
              if (e instanceof HttpError) throw e
            }
          }))
        }

        if (routeMatch.node.loading) {
          const loadingFn = await this._loadComponent(routeMatch.node.loading)
          if (this._navId !== navId) { this._isLoading = false; return }
          if (loadingFn && this._targetEl) {
            this._targetEl.innerHTML = typeof loadingFn === 'function'
              ? loadingFn({ path, router: this })
              : loadingFn
          }
        }
        const pageDef = routeMatch.node.page
        if (pageDef) {
          if (typeof pageDef === 'string') {
            const dir = this.config.pagesDir ? this.config.pagesDir.replace(/\/+$/, '') + '/' : ''
            const resolved = pageDef.startsWith('/') || pageDef.startsWith('http') ? pageDef : dir + pageDef
            pageContent = await this._loadComponent(resolved)
          } else {
            pageContent = await this._loadComponent(pageDef)
          }
        } else if (this.config.pagesDir) {
          pageContent = await this._fetchPage(path, signal)
          if (pageContent === null) {
            await this._handleNotFound(path, method, navId, state, signal)
            this._isLoading = false
            return
          }
        }
        for (const l of routeMatch.layouts) {
          if (!l) continue
          const lfn = await this._loadComponent(l)
          if (lfn) layoutFns.push(lfn)
        }
        const loaded = await this._resolveGlobalLayout()
        if (loaded) layoutFns.unshift(loaded)
        this._routeData = routeMatch
      } else if (this.config.pagesDir) {
        const loadingHtml = await this._fetchSpecial(path, 'loading.html', signal)
        if (loadingHtml && this._targetEl) {
          this._targetEl.innerHTML = loadingHtml
        }
        pageContent = this._cacheGet(path)
        if (!pageContent) {
          pageContent = await this._fetchPage(path, signal)
          if (pageContent && this.config.cacheRoutes) this._cachePut(path, pageContent)
        }
        if (pageContent === null) {
          const notFoundHtml = await this._fetchSpecial(path, 'not-found.html', signal)
          if (this._navId !== navId) { this._isLoading = false; return }
          if (notFoundHtml) {
            if (method === 'push') this._history.push(path, state)
            else if (method === 'replace') this._history.replace(path, state)
            this._pathname = path
            this._isLoading = false
            if (this._targetEl) this._targetEl.innerHTML = notFoundHtml
            return
          }
          await this._handleNotFound(path, method, navId, state, signal)
          this._isLoading = false
          return
        }
        if (this._navId !== navId) { this._isLoading = false; return }
        const loaded = await this._resolveGlobalLayout()
        if (loaded) layoutFns.push(loaded)
        this._routeData = { node: { page: null }, params: {}, layouts: [] }
      } else {
        await this._handleNotFound(path, method, navId, state, signal)
        this._isLoading = false
        return
      }

      if (this._navId !== navId) { this._isLoading = false; return }

      this._scrollManager.save(this._pathname)
      this._previousPathname = this._pathname

      this._pathname = path
      this._params = routeMatch?.params || {}
      this._query = query

      emit(this._events, EVENTS.BEFORE_RENDER, { pathname: path })
      if (routeMatch?.intercept && this._shouldIntercept(routeMatch.intercept)) {
        this._interceptActive = true
        this._previousRouteData = this._routeData
        this._interceptContent = pageContent
        this._interceptLayoutFns = layoutFns
        await this._renderIntercept(pageContent, layoutFns)
      } else {
        await this._render(pageContent, layoutFns)
      }
      emit(this._events, EVENTS.AFTER_RENDER, { pathname: path })
      this._renderComponents()
      this._renderSlots()

      if (this._navId !== navId) { this._isLoading = false; return }

      if (method === 'push') this._history.push(path, state)
      else if (method === 'replace') this._history.replace(path, state)

      this._isLoading = false

      this._scrollManager.restore(this._pathname, this.config.scrollToTop)
      this._updateTitle()
      this._focus()

      console.log(`به صفحه ی ${path} خوش آمدید\nصفا باشه`)

      emit(this._events, EVENTS.ROUTE_CHANGE, {
        pathname: path, params: this._params, query: this._query,
      })
      emit(this._events, EVENTS.AFTER_NAVIGATE, { pathname: path })
    } catch (err) {
      if (err?.name === 'AbortError') { this._isLoading = false; return }
      this._isLoading = false
      await this._handleError(path, err, navId, signal)
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      this._abortController = null
    }
  }

  _getTransitionConfig() {
    const routeTransition = this._routeData?.node?.meta?.transition
    if (routeTransition) {
      return {
        duration: routeTransition.duration ?? this.config.transitionDuration,
        enterClass: routeTransition.enterClass ?? this.config.transitionEnterClass,
        exitClass: routeTransition.exitClass ?? this.config.transitionExitClass,
        enterActiveClass: routeTransition.enterActiveClass ?? this.config.transitionEnterActiveClass,
        exitActiveClass: routeTransition.exitActiveClass ?? this.config.transitionExitActiveClass,
      }
    }
    return null
  }

  async _render(pageContent, layoutFns) {
    if (!this._targetEl) return

    const data = this._routeData?.data

    const html = this._resolveTemplate(layoutFns.length > 0
      ? await this._applyLayoutChain(pageContent, layoutFns, 0, data)
      : (typeof pageContent === 'function'
          ? pageContent({ params: this._params, query: this._query, router: this, data })
          : (pageContent || '')))

    const transCfg = this._getTransitionConfig()
    const duration = transCfg?.duration ?? this.config.transitionDuration

    if (duration > 0) {
      if (transCfg?.duration) this._transitions.setDuration(transCfg.duration)
      await this._transitions.run(this._targetEl, async () => {
        this._targetEl.innerHTML = html
        this._bindLinks()
        if (this.config.prefetchStrategy === 'visible') this._observeLinks()
      }, transCfg)
    } else {
      this._targetEl.innerHTML = html
      this._bindLinks()
      if (this.config.prefetchStrategy === 'visible') this._observeLinks()
    }
  }

  async _applyLayoutChain(pageContent, layoutFns, idx, data) {
    if (idx >= layoutFns.length) {
      if (typeof pageContent === 'function') {
        return pageContent({ params: this._params, query: this._query, router: this, data })
      }
      return pageContent || ''
    }
    const layoutFn = layoutFns[idx]
    const content = await this._applyLayoutChain(pageContent, layoutFns, idx + 1, data)
    return layoutFn({ children: content, params: this._params, query: this._query, router: this, data })
  }

  async _resolveGlobalLayout() {
    if (!this._globalLayout) return null
    let lfn = this._globalLayout
    if (typeof lfn === 'string') {
      const res = await fetch(this._resolveUrl(lfn))
      if (res.ok) {
        const html = await res.text()
        lfn = ({ children }) => this._renderHtmlLayout(html, children)
      }
    }
    const loaded = await this._loadComponent(lfn)
    return loaded || null
  }

  async _renderWithLayouts(pageContent, statusCode, path, data = {}) {
    let html
    if (typeof pageContent === 'function') {
      html = pageContent({ path: path || this._pathname, router: this, statusCode, ...data })
    } else {
      html = pageContent || ''
    }
    const layoutFn = await this._resolveGlobalLayout()
    if (layoutFn) {
      html = await this._applyLayoutChain(html, [layoutFn], 0, data)
    }
    html = this._resolveTemplate(html)
    if (this._targetEl) {
      this._targetEl.innerHTML = html
      this._bindLinks()
    }
    this._updateTitle()
    this._renderComponents()
    emit(this._events, EVENTS.AFTER_RENDER, { pathname: this._pathname })
  }

  _updateTitle() {
    if (typeof document === 'undefined') return
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
    if (!this._targetEl || typeof this._targetEl.querySelector !== 'function') return
    const h1 = this._targetEl.querySelector('h1')
    if (h1) {
      h1.focus({ preventScroll: true })
    }
  }

  _bindLinks() {
    if (!this._targetEl || typeof this._targetEl.querySelectorAll !== 'function') return
    const links = this._targetEl.querySelectorAll('[data-safa-link]')
    for (const el of links) {
      if (el.getAttribute('target') === '_blank') continue
      el.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        if (e.button !== 0) return
        const href = el.getAttribute('href')
        if (href) { e.preventDefault(); this.push(href) }
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
        const res = await fetch(this._resolveUrl(url))
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

  async _handleNotFound(path, method, navId, state = {}, signal, statusCode = HTTP_STATUS.NOT_FOUND) {
    if (navId !== undefined && this._navId !== navId) { this._isLoading = false; return }
    const status = statusCode || HTTP_STATUS.NOT_FOUND
    emit(this._events, EVENTS.NOT_FOUND, { path, statusCode: status })

    console.warn(`⚠️ صفحه ی ${path} یافت نشد\nصفا باشه`)
    this._errorManager.log(status, path, new Error(`Not found: ${path}`))

    this._routeData = null

    // Try ErrorManager specific error pages first (e.g. 404.html, 4xx.html)
    const showStack = this.config.errors?.stackTraces !== false
    let notFoundPage = null
    try {
      const errPageDir = this.config.errors?.pageDir ? this._resolveUrl(this.config.errors.pageDir) : null
      notFoundPage = await this._errorManager.resolvePage(status, errPageDir, signal)
    } catch {}
    if (notFoundPage) {
      if (method === 'push') this._history.push(path, state)
      else if (method === 'replace') this._history.replace(path, state)
      this._pathname = path
      this._extractTitle(notFoundPage)
      await this._renderWithLayouts(notFoundPage, status, path)
      return
    }

    // Fallback: try generic not-found.html
    const notFoundHtml = this.config.pagesDir ? await this._fetchSpecial(path, 'not-found.html', signal) : null
    if (notFoundHtml) {
      if (method === 'push') this._history.push(path, state)
      else if (method === 'replace') this._history.replace(path, state)
      this._pathname = path
      this._extractTitle(notFoundHtml)
      await this._renderWithLayouts(notFoundHtml, status, path)
      return
    }

    // Final fallback: globalNotFound component or built-in 404
    const notFound = this._globalNotFound
    if (notFound) {
      try {
        const fn = await this._loadComponent(notFound)
        if (method === 'push') this._history.push(path, state)
        else if (method === 'replace') this._history.replace(path, state)
        this._pathname = path
        await this._renderWithLayouts(fn, status, path)
        return
      } catch { /* fall through */ }
    }
    if (this._targetEl) {
      try {
        this._targetEl.innerHTML = this._fallback404(path, status, showStack)
        this._bindLinks()
      }
      catch { this._targetEl.textContent = `Not Found: ${path}` }
    }
    this._updateTitle()
    this._renderComponents()
    emit(this._events, EVENTS.AFTER_RENDER, { pathname: this._pathname })
  }

  async _handleError(path, err, navId, signal, statusCode) {
    if (navId !== undefined && this._navId !== navId) { this._isLoading = false; return }
    const status = statusCode || (err?.statusCode) || HTTP_STATUS.INTERNAL_SERVER_ERROR
    const showStack = this.config.errors?.stackTraces !== false

    const routeError = this._routeData?.node?.error
    this._routeData = null
    console.error(`❌ خطا در صفحه ی ${path}: ${err.message || err}\nصفا باشه`)
    this._errorManager.log(status, path, err)
    emit(this._events, EVENTS.ERROR, { path, error: err, statusCode: status })
    if (routeError) {
      try {
        const fn = await this._loadComponent(routeError)
        await this._renderWithLayouts(fn, status, path, { error: err })
        return
      } catch { /* fall through */ }
    }

    // Try ErrorManager specific error pages first (e.g. 403.html, 500.html, 503.html)
    let mgrPage = null
    try {
      const errPageDir = this.config.errors?.pageDir ? this._resolveUrl(this.config.errors.pageDir) : null
      mgrPage = await this._errorManager.resolvePage(status, errPageDir, signal)
    } catch {}
    if (mgrPage) {
      this._extractTitle(mgrPage)
      await this._renderWithLayouts(mgrPage, status, path)
      return
    }

    // Fallback: try generic error.html
    const errorHtml = this.config.pagesDir ? await this._fetchSpecial(path, 'error.html', signal) : null
    if (errorHtml) {
      this._extractTitle(errorHtml)
      await this._renderWithLayouts(errorHtml, status, path)
      return
    }

    // Final fallback: globalError component or built-in error
    if (this._globalError) {
      try {
        const fn = await this._loadComponent(this._globalError)
        await this._renderWithLayouts(fn, status, path, { error: err })
        return
      } catch { /* fall through */ }
    }
    if (this._targetEl) {
      try {
        this._targetEl.innerHTML = this._fallbackError(err, status, showStack)
        this._bindLinks()
      }
      catch { this._targetEl.textContent = `Error: ${err.message}` }
    }
    this._updateTitle()
    this._renderComponents()
    emit(this._events, EVENTS.AFTER_RENDER, { pathname: this._pathname })
  }

  _resolveTemplate(html) {
    if (!html || typeof html !== 'string') return html
    return html
      .replace(/\{\{\s*path\s*\}\}/gi, this._pathname)
      .replace(/\{\{\s*params\.(\w+)\s*\}\}/g, (_, k) => this._params[k] || '')
      .replace(/\{\{\s*query\.(\w+)\s*\}\}/g, (_, k) => this._query[k] || '')
      .replace(/\{\{\s*data\.(\w+)\s*\}\}/g, (_, k) => {
        const d = this._routeData?.data || {}
        return d[k] !== undefined ? String(d[k]) : ''
      })
  }

  _renderSlots() {
    if (typeof document === 'undefined') return
    const slots = this._routeData?.slots
    if (!slots) return
    const slotData = this._routeData?.slotData || {}
    const ctx = { path: this._pathname, router: this, params: this._params, query: this._query }
    for (const [name, slot] of Object.entries(slots)) {
      if (!slot.page) continue
      const fn = typeof slot.page === 'function' ? slot.page : null
      if (!fn) continue
      const data = slotData[name]
      const html = this._resolveTemplate(fn({ ...ctx, data }))
      const target = document.querySelector(`[data-safa-slot="${name}"]`)
      if (target) {
        target.innerHTML = html
        const links = target.querySelectorAll('[data-safa-link]')
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
    }
  }

  _shouldIntercept(intercept) {
    if (!this._previousRouteData) return false
    if (intercept === true) return true
    if (typeof intercept === 'object' && intercept.from) {
      const fromPath = this._previousRouteData.node?.fullPath || this._previousPathname || ''
      if (typeof intercept.from === 'string') {
        return fromPath === intercept.from || new RegExp(intercept.from).test(fromPath)
      }
      if (intercept.from instanceof RegExp) {
        return intercept.from.test(fromPath)
      }
    }
    return false
  }

  async _renderIntercept(pageContent, layoutFns) {
    if (typeof document === 'undefined' || !this._targetEl) return
    const data = this._routeData?.data
    const html = this._resolveTemplate(layoutFns.length > 0
      ? await this._applyLayoutChain(pageContent, layoutFns, 0, data)
      : (typeof pageContent === 'function'
          ? pageContent({ params: this._params, query: this._query, router: this, data })
          : (pageContent || '')))
    const overlay = document.createElement('div')
    overlay.className = 'safa-intercept-overlay'
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;overflow-y:auto;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;'
    const content = document.createElement('div')
    content.className = 'safa-intercept-content'
    content.style.cssText = 'background:#fff;border-radius:8px;max-width:90vw;max-height:90vh;overflow:auto;position:relative;'
    content.innerHTML = html
    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = '&times;'
    closeBtn.className = 'safa-intercept-close'
    closeBtn.style.cssText = 'position:absolute;top:8px;right:12px;border:none;background:none;font-size:24px;cursor:pointer;z-index:1;'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.addEventListener('click', () => this.dismissInterceptor())
    content.prepend(closeBtn)
    overlay.appendChild(content)
    this._targetEl.appendChild(overlay)
    this._bindLinks()
    this._interceptOverlay = overlay
  }

  dismissInterceptor() {
    if (!this._interceptActive) return
    this._interceptActive = false
    if (this._interceptOverlay) {
      this._interceptOverlay.remove()
      this._interceptOverlay = null
    }
    this._interceptContent = null
    this._interceptLayoutFns = null
    if (this._previousRouteData) {
      this._routeData = this._previousRouteData
      this._previousRouteData = null
    }
    this._history.back()
  }

  _renderComponents() {
    if (typeof document === 'undefined') return
    const ctx = { path: this._pathname, router: this, params: this._params, query: this._query }
    const routeMeta = this._routeData?.node?.meta || {}
    const hideComponents = routeMeta.hideComponents
    const hideAll = hideComponents === true
    const hideList = Array.isArray(hideComponents) ? hideComponents : []
    for (const [name, fn] of Object.entries(this._components)) {
      if (typeof fn !== 'function') continue
      if (hideAll || hideList.includes(name)) continue
      const html = this._resolveTemplate(fn(ctx))
      const target = document.querySelector(`[data-safa-component="${name}"]`)
      if (target) {
        target.innerHTML = html
        const links = target.querySelectorAll('[data-safa-link]')
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
    }
  }

  _fallback404(path, statusCode = 404, showStack = true) {
    const homeLink = `<a href="/" data-safa-link style="color:var(--color-accent);text-decoration:underline;">Back to home</a>`
    return [
      '<div class="safa-error safa-404" style="text-align:center;padding:3rem 0;">',
      `<h1 style="font-size:4rem;font-weight:800;margin-bottom:0.5rem;">${statusCode}</h1>`,
      `<p style="margin-bottom:1rem;">Page not found: <code>${path}</code></p>`,
      homeLink,
      '</div>',
    ].join('')
  }

  _fallbackError(err, statusCode = 500, showStack = true) {
    const homeLink = `<a href="/" data-safa-link style="color:var(--color-accent);text-decoration:underline;">Back to home</a>`
    const message = this._errorManager.formatError(err, showStack)
    const code = statusCode || 500
    return [
      '<div class="safa-error" style="text-align:center;padding:3rem 0;">',
      `<h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;">${code} — Something went wrong</h1>`,
      `<pre style="text-align:left;margin:1rem 0;">${message}</pre>`,
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

  getRoute(path) {
    if (!this._routeTree) return null
    return this._routeTree.resolve(normalizePath(path))
  }

  _onHistoryChange({ path, action, state }) {
    if (action === 'back') return
    if (action === 'popstate') {
      this._resolve(this._stripBase(path), 'replace')
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
