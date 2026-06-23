export class ScrollManager {
  constructor() {
    this._memory = new Map()
    this._observers = new Map()
    this._elementScroll = new Map()
  }

  save(pathname) {
    this._memory.set(pathname, window.scrollY)
    for (const [el, rect] of this._elementScroll) {
      const key = `${pathname}::${el}`
      this._memory.set(key, rect)
    }
  }

  restore(pathname, scrollToTop = false) {
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' })
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

  restoreElementScroll(pathname, container) {
    const key = `${pathname}::${container}`
    const saved = this._memory.get(key)
    if (saved !== undefined) {
      container.scrollTop = saved
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
