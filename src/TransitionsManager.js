export class TransitionsManager {
  constructor(config = {}) {
    this._duration = config.transitionDuration || 0
    this._enterClass = config.transitionEnterClass || 'page-enter'
    this._exitClass = config.transitionExitClass || 'page-exit'
    this._enterActiveClass = config.transitionEnterActiveClass || 'page-enter-active'
    this._exitActiveClass = config.transitionExitActiveClass || 'page-exit-active'
    this._custom = config.transitionCustom || null
  }

  async run(el, renderFn) {
    if (this._duration <= 0 && !this._custom) {
      return renderFn()
    }

    await this._exit(el)
    await renderFn()
    await this._enter(el)
  }

  async _exit(el) {
    if (!el || this._duration <= 0) return
    const { promise, resolve } = this._createDeferred()
    el.classList.add(this._exitClass)
    el.classList.add(this._exitActiveClass)
    const timer = setTimeout(() => {
      el.classList.remove(this._exitClass)
      el.classList.remove(this._exitActiveClass)
      resolve()
    }, this._duration)
    promise._timer = timer
    return promise
  }

  async _enter(el) {
    if (!el || this._duration <= 0) return
    const { promise, resolve } = this._createDeferred()
    el.classList.add(this._enterClass)
    requestAnimationFrame(() => {
      el.classList.add(this._enterActiveClass)
      el.classList.remove(this._enterClass)
    })
    const timer = setTimeout(() => {
      el.classList.remove(this._enterActiveClass)
      resolve()
    }, this._duration)
    promise._timer = timer
    return promise
  }

  cancelExit(el) {
    if (!el) return
    el.classList.remove(this._exitClass, this._exitActiveClass)
  }

  cancelEnter(el) {
    if (!el) return
    el.classList.remove(this._enterClass, this._enterActiveClass)
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
