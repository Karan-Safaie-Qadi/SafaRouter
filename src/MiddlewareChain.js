export class MiddlewareChain {
  constructor() {
    this._stack = []
  }

  use(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Middleware must be a function')
    }
    this._stack.push(fn)
    return this
  }

  async run(ctx) {
    let i = 0
    const next = async () => {
      if (i >= this._stack.length) return ctx
      return this._stack[i++](ctx, next)
    }
    return next()
  }

  clear() {
    this._stack = []
  }

  remove(fn) {
    this._stack = this._stack.filter(f => f !== fn)
  }

  get length() {
    return this._stack.length
  }
}
