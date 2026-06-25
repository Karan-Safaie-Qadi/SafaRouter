import { describe, it, expect } from 'vitest'
import { SafaRouter } from '../src/SafaRouter.js'

describe('SafaRouter (modular architecture)', () => {
  it('exports static version', () => {
    expect(SafaRouter.version).toBe('2.0.1')
  })

  it('creates router with default config', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(router.config).toBeDefined()
    expect(router._events).toBeDefined()
  })

  it('has all core methods', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(typeof router.push).toBe('function')
    expect(typeof router.replace).toBe('function')
    expect(typeof router.back).toBe('function')
    expect(typeof router.forward).toBe('function')
    expect(typeof router.reload).toBe('function')
    expect(typeof router.on).toBe('function')
    expect(typeof router.off).toBe('function')
    expect(typeof router.use).toBe('function')
    expect(typeof router.beforeEach).toBe('function')
    expect(typeof router.afterEach).toBe('function')
  })

  it('has all feature methods (backward compat)', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(typeof router.blockRoute).toBe('function')
    expect(typeof router.unblockRoute).toBe('function')
    expect(typeof router.ignoreRoute).toBe('function')
    expect(typeof router.unignoreRoute).toBe('function')
    expect(typeof router.isMaintenance).toBe('function')
    expect(typeof router.setMaintenance).toBe('function')
    expect(router.errorManager).toBeDefined()
    expect(router.accessController).toBeDefined()
  })
})
