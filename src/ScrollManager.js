let _elIdCounter = 0
function _elId(el) {
  if (el.id) return el.id
  if (!el._scrollId) el._scrollId = `_scroll_${++_elIdCounter}`
  return el._scrollId
}

export class ScrollManager {
  constructor() {
    this._memory = new Map()
    this._observers = new Map()
    this._elementScroll = new Map()
  }

  save(pathname) {
    if (typeof window === 'undefined') return
    this._memory.set(pathname, window.scrollY)
    for (const [el, rect] of this._elementScroll) {
      const key = `${pathname}::${_elId(el)}`
      this._memory.set(key, rect)
    }
  }

  restore(pathname, scrollToTop = false) {
    if (typeof window === 'undefined') return
    if (scrollToTop) {
      window.scrollTo(0, 0)
      return
    }
    const saved = this._memory.get(pathname)
    if (saved !== undefined && typeof saved === 'number') {
      requestAnimationFrame(() => window.scrollTo(0, saved))
    }
  }

  trackScrollElement(el) {
    if (this._observers.has(el)) return
    let ticking = false
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this._elementScroll.set(el, el.scrollTop)
          ticking = false
        })
        ticking = true
      }
    }
    el.addEventListener('scroll', handler, { passive: true })
    this._observers.set(el, handler)
  }

  untrackScrollElement(el) {
    const handler = this._observers.get(el)
    if (handler) {
      el.removeEventListener('scroll', handler)
      this._observers.delete(el)
      this._elementScroll.delete(el)
    }
  }

  clear() {
    this._memory.clear()
    this._elementScroll.clear()
    for (const [el, handler] of this._observers) {
      el.removeEventListener('scroll', handler)
    }
    this._observers.clear()
  }

  has(pathname) {
    return this._memory.has(pathname)
  }

  get size() {
    return this._memory.size
  }
}
