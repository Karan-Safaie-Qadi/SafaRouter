export class TransitionsManager {
  constructor(config = {}) {
    this._duration = config.transitionDuration || 0
    this._enterClass = config.transitionEnterClass || 'page-enter'
    this._exitClass = config.transitionExitClass || 'page-exit'
    this._enterActiveClass = config.transitionEnterActiveClass || 'page-enter-active'
    this._exitActiveClass = config.transitionExitActiveClass || 'page-exit-active'
    this._timer = null
    this._activeEl = null
  }

  async run(el, renderFn) {
    this._cancel()
    if (this._duration <= 0) return renderFn()
    this._activeEl = el
    await this._exit(el)
    if (this._activeEl !== el) return
    await renderFn()
    if (this._activeEl !== el) return
    await this._enter(el)
  }

  _cancel() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
    if (this._activeEl) {
      this._activeEl.classList.remove(
        this._exitClass, this._exitActiveClass,
        this._enterClass, this._enterActiveClass
      )
      this._activeEl = null
    }
  }

  async _exit(el) {
    if (!el) return
    const { promise, resolve } = this._createDeferred()
    el.classList.add(this._exitClass, this._exitActiveClass)
    this._timer = setTimeout(() => {
      el.classList.remove(this._exitClass, this._exitActiveClass)
      this._timer = null
      resolve()
    }, this._duration)
    return promise
  }

  async _enter(el) {
    if (!el) return
    const { promise, resolve } = this._createDeferred()
    el.classList.add(this._enterClass)
    requestAnimationFrame(() => {
      el.classList.add(this._enterActiveClass)
      el.classList.remove(this._enterClass)
    })
    this._timer = setTimeout(() => {
      el.classList.remove(this._enterActiveClass)
      this._timer = null
      resolve()
    }, this._duration)
    return promise
  }

  _createDeferred() {
    let resolve
    const promise = new Promise(r => { resolve = r })
    return { promise, resolve }
  }

  setDuration(ms) {
    this._duration = ms
  }

  get config() {
    return {
      duration: this._duration,
      enterClass: this._enterClass,
      exitClass: this._exitClass,
      enterActiveClass: this._enterActiveClass,
      exitActiveClass: this._exitActiveClass,
    }
  }
}
