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
      try {
        return this._stack[i++](ctx, next)
      } catch (err) {
        console.error('[SafaRouter] Middleware error:', err)
        throw err
      }
    }
    return next()
  }

  clear() {
    this._stack = []
    return this
  }

  remove(fn) {
    this._stack = this._stack.filter(f => f !== fn)
    return this
  }

  clone() {
    const chain = new MiddlewareChain()
    chain._stack = [...this._stack]
    return chain
  }

  get length() {
    return this._stack.length
  }
}
