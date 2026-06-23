export class Link {
  constructor(config = {}) {
    this._href = config.href || '/'
    this._children = config.children || this._href
    this._className = config.className || ''
    this._activeClass = config.activeClass || 'active'
    this._router = config.router || null
    this._attrs = config.attrs || {}
    this._el = null
    this._unsub = null
  }

  render(container) {
    this._el = document.createElement('a')
    if (container) {
      if (typeof container === 'string') {
        const el = document.querySelector(container)
        if (el) el.appendChild(this._el)
      } else if (container instanceof Node) {
        container.appendChild(this._el)
      }
    }
    this._el.href = this._router?.config?.useHash
      ? `#${this._href}`
      : this._href
    if (this._className) this._el.className = this._className

    if (typeof this._children === 'string') {
      this._el.textContent = this._children
    } else if (this._children instanceof Node) {
      this._el.appendChild(this._children)
    } else if (Array.isArray(this._children)) {
      for (const c of this._children) {
        if (c instanceof Node) this._el.appendChild(c)
      }
    }

    for (const [k, v] of Object.entries(this._attrs)) {
      this._el.setAttribute(k, v)
    }

    this._el.addEventListener('click', (e) => this._onClick(e))

    if (this._router) {
      if (this._router.config.prefetch) {
        this._el.addEventListener('mouseenter', () => this._prefetch(), { once: true })
      }
      this._unsub = this._router.on('routechange', () => this._refresh())
      this._refresh()
    }

    return this._el
  }

  _prefetch() {
    if (this._router && this._router.prefetch) {
      this._router.prefetch(this._href)
    }
  }

  _onClick(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (e.button !== 0) return
    e.preventDefault()
    if (this._router) this._router.push(this._href)
  }

  _refresh() {
    if (!this._el || !this._router) return
    const cur = this._router.pathname
    const active =
      cur === this._href ||
      (this._href !== '/' && cur.startsWith(this._href))
    this._el.classList.toggle(this._activeClass, active)
  }

  setHref(href) {
    this._href = href
    if (this._el) {
      this._el.href = this._router?.config?.useHash ? `#${href}` : href
    }
  }

  destroy() {
    if (this._unsub) {
      this._unsub()
      this._unsub = null
    }
    if (this._el) {
      this._el.remove()
      this._el = null
    }
  }
}
