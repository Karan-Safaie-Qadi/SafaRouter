import { describe, it, expect, vi } from 'vitest'
import { PluginManager } from '../src/PluginManager.js'

function createMockRouter() {
  const handlers = {}
  return {
    use: vi.fn(),
    onBeforeNavigate: vi.fn(fn => {
      handlers.beforeNavigate = fn
      return () => { delete handlers.beforeNavigate }
    }),
    afterEach: vi.fn(fn => {
      handlers.afterNavigate = fn
      return () => { delete handlers.afterNavigate }
    }),
    onRouteChange: vi.fn(fn => {
      handlers.routeChange = fn
      return () => { delete handlers.routeChange }
    }),
    onError: vi.fn(fn => {
      handlers.error = fn
      return () => { delete handlers.error }
    }),
    _handlers: handlers,
  }
}

describe('PluginManager', () => {
  it('registers a plugin with name', () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    const plugin = { name: 'test' }
    pm.use(plugin)
    expect(pm.has('test')).toBe(true)
    expect(pm.list()).toEqual(['test'])
  })

  it('throws if plugin has no name', async () => {
    const pm = new PluginManager(createMockRouter())
    await expect(pm.use({})).rejects.toThrow('name')
  })

  it('calls install function', async () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    const install = vi.fn()
    await pm.use({ name: 'test', install })
    expect(install).toHaveBeenCalledWith(router)
  })

  it('ejects plugin and calls cleanup', async () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    const cleanup = vi.fn()
    await pm.use({ name: 'test', install: () => cleanup })
    expect(pm.eject('test')).toBe(true)
    expect(pm.has('test')).toBe(false)
  })

  it('eject returns false for unknown plugin', () => {
    const pm = new PluginManager(createMockRouter())
    expect(pm.eject('nope')).toBe(false)
  })

  it('ejectAll removes all plugins', () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    pm.use({ name: 'a' })
    pm.use({ name: 'b' })
    expect(pm.count).toBe(2)
    pm.ejectAll()
    expect(pm.count).toBe(0)
  })

  it('get returns plugin ref', () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    const plugin = { name: 'test', version: '1.0' }
    pm.use(plugin)
    expect(pm.get('test')).not.toBeNull()
  })

  it('warns on duplicate plugin', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const pm = new PluginManager(createMockRouter())
    pm.use({ name: 'dup' })
    pm.use({ name: 'dup' })
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('registers lifecycle hooks', () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    const hook = vi.fn()
    pm.use({
      name: 'hooked',
      onBeforeNavigate: hook,
      onAfterNavigate: hook,
      onRouteChange: hook,
      onError: hook,
    })
    expect(router.onBeforeNavigate).toHaveBeenCalled()
    expect(router.afterEach).toHaveBeenCalled()
    expect(router.onRouteChange).toHaveBeenCalled()
    expect(router.onError).toHaveBeenCalled()
  })

  it('registers middleware', () => {
    const router = createMockRouter()
    const pm = new PluginManager(router)
    const mw = vi.fn()
    pm.use({ name: 'mw', middleware: mw })
    expect(router.use).toHaveBeenCalledWith(mw)
  })
})
