export class TransitionsManager {
  constructor(config = {}) {
    this._duration = config.transitionDuration || 0
    this._enterClass = config.transitionEnterClass || 'page-enter'
    this._exitClass = config.transitionExitClass || 'page-exit'
    this._enterActiveClass = config.transitionEnterActiveClass || 'page-enter-active'
    this._exitActiveClass = config.transitionExitActiveClass || 'page-exit-active'
    this._timer = null
    this._activeEl = null
    this._currentClasses = null
  }

  async run(el, renderFn, config) {
    const prevClasses = this._currentClasses
    this._cancel(prevClasses)
    if (this._duration <= 0) return renderFn()
    this._activeEl = el
    this._currentClasses = {
      enter: config?.enterClass ?? this._enterClass,
      exit: config?.exitClass ?? this._exitClass,
      enterActive: config?.enterActiveClass ?? this._enterActiveClass,
      exitActive: config?.exitActiveClass ?? this._exitActiveClass,
    }
    await this._exit(el)
    if (this._activeEl !== el) return
    await renderFn()
    if (this._activeEl !== el) return
    await this._enter(el)
    this._currentClasses = null
  }

  _cancel(classes) {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
    const cls = classes || this._currentClasses || {
      enter: this._enterClass,
      exit: this._exitClass,
      enterActive: this._enterActiveClass,
      exitActive: this._exitActiveClass,
    }
    if (this._activeEl) {
      this._activeEl.classList.remove(
        cls.exit, cls.exitActive,
        cls.enter, cls.enterActive
      )
      this._activeEl = null
    }
  }

  async _exit(el) {
    if (!el || !this._currentClasses) return
    const { promise, resolve } = this._createDeferred()
    el.classList.add(this._currentClasses.exit, this._currentClasses.exitActive)
    this._timer = setTimeout(() => {
      el.classList.remove(this._currentClasses.exit, this._currentClasses.exitActive)
      this._timer = null
      resolve()
    }, this._duration)
    return promise
  }

  async _enter(el) {
    if (!el || !this._currentClasses) return
    if (typeof requestAnimationFrame === 'undefined') return
    const { promise, resolve } = this._createDeferred()
    el.classList.add(this._currentClasses.enter)
    requestAnimationFrame(() => {
      el.classList.add(this._currentClasses.enterActive)
      el.classList.remove(this._currentClasses.enter)
    })
    this._timer = setTimeout(() => {
      el.classList.remove(this._currentClasses.enterActive)
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
