export class LoaderCache {
  constructor(options = {}) {
    this._cache = new Map()
    this._pending = new Map()
    this._staleTime = options.staleTime ?? 30000
    this._enabled = options.enabled !== false
    this._maxSize = options.maxSize ?? 100
  }

  _makeKey(routePath, params, query) {
    return `swr:${routePath}:${JSON.stringify(params)}:${JSON.stringify(query)}`
  }

  get(routePath, params, query) {
    if (!this._enabled) return null
    const entry = this._cache.get(this._makeKey(routePath, params, query))
    if (!entry) return null
    const stale = Date.now() - entry.timestamp > (entry.ttl ?? this._staleTime)
    return { data: entry.data, stale }
  }

  set(routePath, params, query, data, ttl) {
    if (!this._enabled) return
    const key = this._makeKey(routePath, params, query)
    if (this._cache.size >= this._maxSize) {
      const first = this._cache.keys().next()
      if (!first.done) this._cache.delete(first.value)
    }
    this._cache.set(key, { data, timestamp: Date.now(), ttl })
    this._pending.delete(key)
  }

  invalidate(routePath, params, query) {
    const prefix = `swr:${routePath}:`
    if (params || query) {
      this._cache.delete(this._makeKey(routePath, params, query))
    } else {
      for (const key of this._cache.keys()) {
        if (key.startsWith(prefix)) this._cache.delete(key)
      }
    }
  }

  async fetch(routePath, params, query, fetcher, ttl) {
    const key = this._makeKey(routePath, params, query)
    if (this._pending.has(key)) return this._pending.get(key)
    const promise = Promise.resolve().then(() => fetcher()).then(data => {
      this.set(routePath, params, query, data, ttl)
      this._pending.delete(key)
      return data
    }).catch(err => {
      this._pending.delete(key)
      throw err
    })
    this._pending.set(key, promise)
    return promise
  }

  clear() {
    this._cache.clear()
    this._pending.clear()
  }

  get size() { return this._cache.size }
}
