import { describe, it, expect } from 'vitest'
import { SafaRouter } from '../src/core/SafaRouter.js'

describe('SafaRouter core (minimal)', () => {
  it('exports static version', () => {
    expect(SafaRouter.version).toBe('2.0.1')
  })

  it('creates router without any feature dependencies', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(router._features).toBeDefined()
    expect(Object.keys(router._features).length).toBe(0)
  })

  it('has core routing methods', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(typeof router.push).toBe('function')
    expect(typeof router.replace).toBe('function')
    expect(typeof router.back).toBe('function')
    expect(typeof router.forward).toBe('function')
    expect(typeof router.reload).toBe('function')
    expect(typeof router.on).toBe('function')
    expect(typeof router.off).toBe('function')
    expect(typeof router.beforeEach).toBe('function')
    expect(typeof router.afterEach).toBe('function')
    expect(typeof router.use).toBe('function')
    expect(typeof router.getFeature).toBe('function')
  })

  it('does NOT have feature methods by default', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(router.blockRoute).toBeUndefined()
    expect(router.isMaintenance).toBeUndefined()
    expect(router.errorManager).toBeUndefined()
    expect(router.accessController).toBeUndefined()
  })

  it('use() registers a feature module', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    const testFeature = { name: 'test', init: () => {}, destroy: () => {} }
    router.use(testFeature)
    expect(router._features.test).toBe(testFeature)
  })

  it('use() does not register duplicate feature', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    const testFeature = { name: 'test', init: () => {}, destroy: () => {} }
    router.use(testFeature)
    router.use(testFeature)
    expect(Object.keys(router._features).length).toBe(1)
  })

  it('getFeature returns registered instance', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    const testFeature = { name: 'test', init: () => {}, destroy: () => {} }
    router.use(testFeature, { key: 'value' })
    expect(router.getFeature('test')).toEqual({ key: 'value' })
  })

  it('getFeature returns null for unregistered feature', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(router.getFeature('nonexistent')).toBeNull()
  })

  it('has event system', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    const handler = () => {}
    const unsub = router.on('test', handler)
    expect(typeof unsub).toBe('function')
    router.off('test', handler)
  })
})
