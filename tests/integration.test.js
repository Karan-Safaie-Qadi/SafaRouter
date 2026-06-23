import { describe, it, expect, vi } from 'vitest'
import { SafaRouter } from '../src/SafaRouter.js'
import { EVENTS } from '../src/constants.js'
import { emit } from '../src/utils.js'

describe('SafaRouter v1.3.0 integration', () => {
  function createRouter(opts = {}) {
    const router = new SafaRouter({
      target: '#app',
      routes: opts.routes || {},
      ...opts,
    })
    router._targetEl = { innerHTML: '', querySelectorAll: () => [] }
    return router
  }

  describe('errorManager', () => {
    it('is available as a property', () => {
      const router = createRouter()
      expect(router.errorManager).toBeDefined()
      expect(router.errorManager.getDefaultPage(404)).toContain('404')
    })

    it('logs errors via errorManager', () => {
      const router = createRouter()
      const handler = vi.fn()
      router.errorManager.setLogHandler(handler)
      router._navId = 1
      router._handleError('/test', new Error('fail'), 1, null)
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        path: '/test',
        statusCode: 500,
      }))
    })
  })

  describe('accessController', () => {
    it('is available as a property', () => {
      const router = createRouter()
      expect(router.accessController).toBeDefined()
      expect(router.accessController.isAccessible('/')).toBe(true)
    })

    it('blockRoute adds blocked pattern', () => {
      const router = createRouter()
      router.blockRoute('/admin')
      expect(router.accessController.isBlocked('/admin')).toBeTruthy()
    })

    it('unblockRoute removes blocked pattern', () => {
      const router = createRouter()
      router.blockRoute('/admin')
      router.unblockRoute('/admin')
      expect(router.accessController.isBlocked('/admin')).toBeNull()
    })

    it('ignoreRoute adds ignored pattern', () => {
      const router = createRouter()
      router.ignoreRoute('/hidden')
      expect(router.accessController.isIgnored('/hidden')).toBe(true)
    })

    it('unignoreRoute removes ignored pattern', () => {
      const router = createRouter()
      router.ignoreRoute('/hidden')
      router.unignoreRoute('/hidden')
      expect(router.accessController.isIgnored('/hidden')).toBe(false)
    })

    it('emits ACCESS_DENIED event on blocked path', async () => {
      const router = createRouter({ access: { blocked: ['/secret'] } })
      router._history = { push: vi.fn(), replace: vi.fn(), onChange: vi.fn(), init: vi.fn() }
      const spy = vi.fn()
      router.onAccessDenied(spy)
      router._started = true
      await router._resolve('/secret', 'replace')
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        path: '/secret',
      }))
    })
  })

  describe('maintenance mode', () => {
    it('isMaintenance returns false by default', () => {
      const router = createRouter()
      expect(router.isMaintenance()).toBe(false)
    })

    it('setMaintenance toggles mode', () => {
      const router = createRouter()
      router.setMaintenance(true)
      expect(router.isMaintenance()).toBe(true)
      router.setMaintenance(false)
      expect(router.isMaintenance()).toBe(false)
    })

    it('setMaintenance with options updates config', () => {
      const router = createRouter()
      router.setMaintenance(true, { page: '/custom-503.html' })
      expect(router.config.maintenanceMode.page).toBe('/custom-503.html')
    })

    it('emits MAINTENANCE event when in maintenance mode', async () => {
      const router = createRouter()
      router._history = { push: vi.fn(), replace: vi.fn(), onChange: vi.fn(), init: vi.fn() }
      router._targetEl = { innerHTML: '' }
      const spy = vi.fn()
      router.onMaintenance(spy)
      router._started = true
      router.setMaintenance(true)
      await router._resolve('/about', 'replace')
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        path: '/about',
      }))
    })

    it('bypasses maintenance for allowed paths', async () => {
      const router = createRouter()
      router._routeTree = { resolve: () => null, flatten: () => [] }
      router._history = { push: vi.fn(), replace: vi.fn(), onChange: vi.fn(), init: vi.fn() }
      router._targetEl = { innerHTML: '' }
      const spy = vi.fn()
      router.onMaintenance(spy)
      router.setMaintenance(true, { allowedPaths: ['/login', '/assets/**'] })
      router._started = true
      await router._resolve('/login', 'replace')
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('retry', () => {
    it('retry attempts navigation multiple times', async () => {
      const router = createRouter()
      router._navigate = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce()
      router._started = true
      await router.retry('/test', { retries: 2 })
      expect(router._navigate).toHaveBeenCalledTimes(2)
    })
  })

  describe('onAccessDenied / onMaintenance', () => {
    it('onAccessDenied subscribes to ACCESS_DENIED event', () => {
      const router = createRouter()
      const fn = vi.fn()
      const unsub = router.onAccessDenied(fn)
      emit(router._events, EVENTS.ACCESS_DENIED, { path: '/admin' })
      expect(fn).toHaveBeenCalled()
      unsub()
      fn.mockClear()
      emit(router._events, EVENTS.ACCESS_DENIED, { path: '/admin' })
      expect(fn).not.toHaveBeenCalled()
    })

    it('onMaintenance subscribes to MAINTENANCE event', () => {
      const router = createRouter()
      const fn = vi.fn()
      router.onMaintenance(fn)
      emit(router._events, EVENTS.MAINTENANCE, { path: '/about' })
      expect(fn).toHaveBeenCalled()
    })
  })
})
