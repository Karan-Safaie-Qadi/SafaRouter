import { RouteMatcher } from './RouteMatcher.js'
import { RouteTree } from './RouteTree.js'
import { HistoryManager } from './HistoryManager.js'
import { MiddlewareChain } from './MiddlewareChain.js'
import { Link } from './Link.js'
import { normalizePath, parseQuery, emit, createURL, isExternalURL } from './utils.js'
import { EVENTS, DEFAULT_CONFIG } from './constants.js'
import { RouteLoadError, SafaError } from './errors.js'

export class SafaRouter {
  static version = '1.0.0'

  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options }

    this._events = {}
    for (const key of Object.values(EVENTS)) this._events[key] = []

    this._matcher = new RouteMatcher()
    this._history = new HistoryManager({
      useHash: this.config.useHash,
      basePath: this.config.basePath,
    })
    this._middleware = new MiddlewareChain()
    this._cache = new Map()

    this._pathname = '/'
    this._params = {}
    this._query = {}
    this._routeData = null
    this._isLoading = false
    this._started = false
    this._targetEl = null

    this._globalNotFound = this.config.notFound || null
    this._globalError = this.config.error || null

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

    this._routeTree = new RouteTree(this.config.routes)
    this._seedMatcher()
    this._history.init()
    this._unsubHistory = this._history.onChange(this._boundNav)
    await this._resolve(this._history.path, 'replace')
    emit(this._events, EVENTS.READY, { pathname: this._pathname })
    this._started = true
    return this
  }

  destroy() {
    this._started = false
    if (this._unsubHistory) {
      this._unsubHistory()
      this._unsubHistory = null
    }
    this._history.destroy()
    for (const k of Object.keys(this._events)) this._events[k] = []
    this._cache.clear()
    this._targetEl = null
    emit(this._events, EVENTS.DESTROY, {})
  }

  async push(url, state = {}) {
    if (isExternalURL(url)) {
      window.location.href = url
      return
    }
    const u = createURL(url) || new URL(url, location.origin)
    await this._navigate(normalizePath(u.pathname), 'push', parseQuery(u.search), state)
  }

  async replace(url, state = {}) {
    if (isExternalURL(url)) {
      window.location.replace(url)
      return
    }
    const u = createURL(url) || new URL(url, location.origin)
    await this._navigate(normalizePath(u.pathname), 'replace', parseQuery(u.search), state)
  }

  back() {
    this._history.back()
  }

  forward() {
    this._history.forward()
  }

  reload() {
    this._resolve(this._pathname, 'replace')
  }

  navigate(url) {
    return this.push(url)
  }

  get pathname() {
    return this._pathname
  }

  get params() {
    return { ...this._params }
  }

  get query() {
    return { ...this._query }
  }

  get loading() {
    return this._isLoading
  }

  on(name, fn) {
    if (!this._events[name]) this._events[name] = []
    this._events[name].push(fn)
    return () => {
      this._events[name] = this._events[name].filter((f) => f !== fn)
    }
  }

  off(name, fn) {
    if (!this._events[name]) return
    this._events[name] = this._events[name].filter((f) => f !== fn)
  }

  use(fn) {
    this._middleware.use(fn)
    return this
  }

  onError(fn) {
    return this.on(EVENTS.ERROR, fn)
  }

  onNotFound(fn) {
    return this.on(EVENTS.NOT_FOUND, fn)
  }

  onRouteChange(fn) {
    return this.on(EVENTS.ROUTE_CHANGE, fn)
  }

  createLink(config) {
    return new Link({ ...config, router: this })
  }

  async prefetch(path) {
    const normalized = normalizePath(path)
    if (this._cache.has(normalized)) return
    const route = this._routeTree.resolve(normalized)
    if (!route) return
    try {
      const mod = await this._loadComponent(route.node.page)
      if (mod && this.config.cacheRoutes) {
        this._cache.set(normalized, mod)
      }
    } catch {
      // prefetch failures are silently ignored
    }
  }

  _seedMatcher() {
    const walk = (routes, base) => {
      if (!routes || typeof routes !== 'object') return
      for (const [key, val] of Object.entries(routes)) {
        const isGroup = key.startsWith('(') && key.endsWith(')')
        const fp =
          isGroup
            ? base
            : base === '/'
              ? `/${key}`
              : `${base}/${key}`
        if (typeof val === 'object' && val !== null) {
          if (val.page) this._matcher.add(fp)
          if (val.children) walk(val.children, fp)
        } else if (typeof val === 'function') {
          this._matcher.add(fp)
        }
      }
    }
    walk(this.config.routes, '/')
  }

  async _navigate(path, method, query = {}, state = {}) {
    if (path === this._pathname) return
    await this._resolve(path, method, query, state)
  }

  async _resolve(path, method, query = {}, state = {}) {
    this._isLoading = true
    emit(this._events, EVENTS.LOADING, { path, loading: true })
    emit(this._events, EVENTS.BEFORE_NAVIGATE, { path, method })

    try {
      const ctx = { path, method, query, cancelled: false, redirect: null }
      await this._middleware.run(ctx)
      if (ctx.redirect) return this._navigate(ctx.redirect, 'replace')
      if (ctx.cancelled) {
        this._isLoading = false
        return
      }

      const route = this._routeTree.resolve(path)
      if (!route) {
        await this._handleNotFound(path, method, query)
        this._isLoading = false
        return
      }

      if (route.node.loading) {
        const loadingFn = await this._loadComponent(route.node.loading)
        if (loadingFn && this._targetEl) {
          this._targetEl.innerHTML = typeof loadingFn === 'function'
            ? loadingFn({ path, router: this })
            : loadingFn
        }
      }

      const pageFn = await this._loadComponent(route.node.page)
      const layoutFns = []
      for (const l of route.layouts) {
        if (!l) continue
        const lfn = await this._loadComponent(l)
        if (lfn) layoutFns.push(lfn)
      }

      if (method === 'push') this._history.push(path, state)
      else if (method === 'replace') this._history.replace(path, state)

      const matched = this._matcher.match(path)
      this._pathname = path
      this._params = matched ? matched.params : route.params
      this._query = query
      this._routeData = route
      this._isLoading = false

      this._render(pageFn, layoutFns)

      emit(this._events, EVENTS.ROUTE_CHANGE, {
        pathname: path,
        params: this._params,
        query: this._query,
      })
      emit(this._events, EVENTS.AFTER_NAVIGATE, { pathname: path })

      if (this.config.scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      this._updateTitle()
      this._focus()
    } catch (err) {
      this._isLoading = false
      await this._handleError(path, err)
    }
  }

  async _render(pageFn, layoutFns) {
    if (!this._targetEl) return

    const renderLayer = (idx) => {
      if (idx >= layoutFns.length) {
        if (typeof pageFn === 'function') {
          return pageFn({
            params: this._params,
            query: this._query,
            router: this,
          })
        }
        return pageFn || ''
      }
      const layoutFn = layoutFns[idx]
      const content = renderLayer(idx + 1)
      return layoutFn({
        children: content,
        params: this._params,
        router: this,
      })
    }

    const html = await renderLayer(0)
    const duration = this.config.transitionDuration
    if (duration > 0) {
      this._targetEl.style.opacity = '0'
      this._targetEl.style.transition = `opacity ${duration}ms ease`
    }
    this._targetEl.innerHTML = html
    this._bindLinks()
    if (duration > 0) {
      requestAnimationFrame(() => {
        this._targetEl.style.opacity = '1'
      })
    }
  }

  _updateTitle() {
    const template = this.config.titleTemplate
    if (!template) return
    const title = this._routeData?.node?.meta?.title ||
                  this._routeData?.node?.segment ||
                  this._pathname.replace(/[/-]/g, ' ').trim() ||
                  'Home'
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
      const result = typeof mod === 'function' ? mod() : mod
      const resolved = result instanceof Promise ? await result : result
      return resolved && resolved.default ? resolved.default : resolved
    } catch (e) {
      throw new RouteLoadError(
        typeof mod === 'function' ? mod.name || 'anonymous' : 'module',
        e
      )
    }
  }

  async _handleNotFound(path, method) {
    emit(this._events, EVENTS.NOT_FOUND, { path })

    const notFound = this._routeData?.node?.notFound || this._globalNotFound
    if (notFound) {
      try {
        const fn = await this._loadComponent(notFound)
        if (method === 'push') this._history.push(path)
        else if (method === 'replace') this._history.replace(path)
        this._pathname = path
        const html =
          typeof fn === 'function' ? fn({ path, router: this }) : fn
        if (this._targetEl) this._targetEl.innerHTML = html
        return
      } catch {
        // fall through
      }
    }
    if (this._targetEl) this._targetEl.innerHTML = this._fallback404(path)
  }

  async _handleError(path, err) {
    console.error('[SafaRouter]', err)
    emit(this._events, EVENTS.ERROR, { path, error: err })

    if (this._globalError) {
      try {
        const fn = await this._loadComponent(this._globalError)
        const html =
          typeof fn === 'function'
            ? fn({ error: err, path, router: this })
            : fn
        if (this._targetEl) this._targetEl.innerHTML = html
        return
      } catch {
        // fall through
      }
    }
    if (this._targetEl) {
      try {
        this._targetEl.innerHTML = this._fallbackError(err)
      } catch {
        this._targetEl.textContent = `Error: ${err.message}`
      }
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

  get currentRoute() {
    return this._routeData
  }

  get matchedRoute() {
    return this._matcher.match(this._pathname)
  }

  getRoute(path) {
    return this._routeTree.resolve(normalizePath(path))
  }

  _onHistoryChange({ path, action, state }) {
    if (action === 'popstate') {
      this._resolve(path, 'replace')
      if (state && state._scrollY !== undefined && !this.config.scrollToTop) {
        window.scrollTo(0, state._scrollY)
      }
    }
  }
}
