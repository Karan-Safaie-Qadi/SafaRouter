export class MiddlewareChain {
  constructor() {
    this._stack = []
  }

  use(fn, priority = 0) {
    if (typeof fn !== 'function') {
      throw new Error('Middleware must be a function')
    }
    fn._priority = priority
    fn._name = fn.name || ''
    this._stack.push(fn)
    this._stack.sort((a, b) => (b._priority || 0) - (a._priority || 0))
    return this
  }

  useNamed(name, fn, priority = 0) {
    fn._name = name
    return this.use(fn, priority)
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
    if (typeof fn === 'string') {
      this._stack = this._stack.filter(f => f._name !== fn)
    } else {
      this._stack = this._stack.filter(f => f !== fn)
    }
    return this
  }

  insertBefore(refName, fn, priority = 0) {
    const idx = this._stack.findIndex(f => f._name === refName)
    if (idx === -1) { this.use(fn, priority); return this }
    fn._priority = priority
    fn._name = fn.name || ''
    this._stack.splice(idx, 0, fn)
    return this
  }

  insertAfter(refName, fn, priority = 0) {
    const idx = this._stack.findIndex(f => f._name === refName)
    if (idx === -1) { this.use(fn, priority); return this }
    fn._priority = priority
    fn._name = fn.name || ''
    this._stack.splice(idx + 1, 0, fn)
    return this
  }

  clone() {
    const chain = new MiddlewareChain()
    chain._stack = this._stack.map(f => f)
    return chain
  }

  get length() {
    return this._stack.length
  }

  get stack() {
    return this._stack.map(f => ({ name: f._name, priority: f._priority || 0 }))
  }
}
