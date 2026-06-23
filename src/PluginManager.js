import { EVENTS } from './constants.js'

export class PluginManager {
  constructor(router) {
    this._router = router
    this._plugins = new Map()
  }

  async use(plugin) {
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('Plugin must be an object with a name property')
    }
    if (!plugin.name) {
      throw new Error('Plugin must have a name')
    }
    if (this._plugins.has(plugin.name)) {
      console.warn(`[SafaRouter] Plugin "${plugin.name}" already registered, skipping`)
      return this
    }

    const wrapped = { ...plugin, _cleanup: [] }
    this._plugins.set(plugin.name, wrapped)

    if (typeof plugin.install === 'function') {
      try {
        const result = await plugin.install(this._router)
        if (typeof result === 'function') {
          wrapped._cleanup.push(result)
        }
      } catch (err) {
        console.error(`[SafaRouter] Plugin "${plugin.name}" install failed:`, err)
      }
    }

    if (typeof plugin.onBeforeNavigate === 'function') {
      const unsub = this._router.onBeforeNavigate(plugin.onBeforeNavigate)
      wrapped._cleanup.push(unsub)
    }
    if (typeof plugin.onAfterNavigate === 'function') {
      const unsub = this._router.afterEach(plugin.onAfterNavigate)
      wrapped._cleanup.push(unsub)
    }
    if (typeof plugin.onRouteChange === 'function') {
      const unsub = this._router.onRouteChange(plugin.onRouteChange)
      wrapped._cleanup.push(unsub)
    }
    if (typeof plugin.onError === 'function') {
      const unsub = this._router.onError(plugin.onError)
      wrapped._cleanup.push(unsub)
    }
    if (typeof plugin.onBeforeRender === 'function') {
      const unsub = this._router.on(EVENTS.BEFORE_RENDER, plugin.onBeforeRender)
      wrapped._cleanup.push(unsub)
    }
    if (typeof plugin.onAfterRender === 'function') {
      const unsub = this._router.on(EVENTS.AFTER_RENDER, plugin.onAfterRender)
      wrapped._cleanup.push(unsub)
    }
    if (typeof plugin.middleware === 'function') {
      this._router.use(plugin.middleware)
    }

    return this
  }

  eject(name) {
    const plugin = this._plugins.get(name)
    if (!plugin) return false
    for (const cleanup of plugin._cleanup) {
      try { cleanup() } catch {}
    }
    this._plugins.delete(name)
    return true
  }

  get(name) {
    return this._plugins.get(name) || null
  }

  list() {
    return Array.from(this._plugins.keys())
  }

  has(name) {
    return this._plugins.has(name)
  }

  ejectAll() {
    for (const name of this._plugins.keys()) {
      this.eject(name)
    }
  }

  get count() {
    return this._plugins.size
  }
}
