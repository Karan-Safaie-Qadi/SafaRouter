export class HistoryManager {
  constructor({ useHash = false, basePath = '' } = {}) {
    this._useHash = useHash
    this._basePath = basePath
    this._listeners = []
    this._bound = this._onPop.bind(this)
  }

  init() {
    window.addEventListener('popstate', this._bound)
  }

  destroy() {
    window.removeEventListener('popstate', this._bound)
    this._listeners = []
  }

  get path() {
    if (this._useHash) {
      const h = location.hash.slice(1)
      return h || '/'
    }
    let p = location.pathname
    if (this._basePath && p.startsWith(this._basePath)) {
      p = p.slice(this._basePath.length) || '/'
    }
    return p
  }

  push(url, state = {}) {
    const scrollY = window.scrollY
    history.pushState({ ...state, _scrollY: scrollY }, '', this._url(url))
    this._notify(url, 'push')
  }

  replace(url, state = {}) {
    const scrollY = window.scrollY
    history.replaceState({ ...state, _scrollY: scrollY }, '', this._url(url))
    this._notify(url, 'replace')
  }

  back() {
    history.back()
  }

  forward() {
    history.forward()
  }

  go(delta) {
    history.go(delta)
  }

  onChange(fn) {
    this._listeners.push(fn)
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn)
    }
  }

  _url(path) {
    if (this._useHash) return `#${path}`
    return this._basePath ? `${this._basePath}${path}` : path
  }

  _onPop(e) {
    this._notify(this.path, 'popstate', e.state)
  }

  _notify(path, action, state) {
    for (const fn of this._listeners) {
      try {
        fn({ path, action, state })
      } catch (err) {
        console.error('[SafaRouter] History listener error:', err)
      }
    }
  }
}
