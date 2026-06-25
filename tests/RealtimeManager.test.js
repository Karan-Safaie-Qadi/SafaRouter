import { describe, it, expect, vi } from 'vitest'
import { RealtimeManager } from '../src/RealtimeManager.js'
import { EVENTS } from '../src/constants.js'

function mockRouter() {
  return {
    _started: true,
    _pathname: '/',
    clearCache: vi.fn(),
    reload: vi.fn(),
    emit: vi.fn(),
  }
}

describe('RealtimeManager', () => {
  describe('constructor', () => {
    it('stores router and config', () => {
      const router = mockRouter()
      const rm = new RealtimeManager(router, { enabled: true, mode: 'polling', interval: 1000 })
      expect(rm._router).toBe(router)
      expect(rm._enabled).toBe(true)
      expect(rm._mode).toBe('polling')
      expect(rm._interval).toBe(1000)
    })

    it('defaults to SSE mode with 2000ms interval', () => {
      const rm = new RealtimeManager(mockRouter())
      expect(rm._mode).toBe('sse')
      expect(rm._interval).toBe(2000)
    })
  })

  describe('start/destroy', () => {
    it('start does nothing when not enabled', () => {
      const rm = new RealtimeManager(mockRouter(), { enabled: false, mode: 'polling' })
      rm._poll = vi.fn()
      rm.start()
      expect(rm._poll).not.toHaveBeenCalled()
    })

    it('start does nothing after destroy', () => {
      const rm = new RealtimeManager(mockRouter(), { enabled: true, mode: 'polling' })
      rm.destroy()
      rm._poll = vi.fn()
      rm.start()
      expect(rm._poll).not.toHaveBeenCalled()
    })

    it('destroy clears timers and connections', () => {
      const rm = new RealtimeManager(mockRouter(), { enabled: true, mode: 'polling' })
      rm._timer = setTimeout(() => {}, 1000)
      rm.destroy()
      expect(rm._destroyed).toBe(true)
      expect(rm._timer).toBeNull()
    })
  })

  describe('polling mode', () => {
    it('calls _handleUpdate when data.changed is true', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changed: true, path: '/' }),
      })
      const router = mockRouter()
      const rm = new RealtimeManager(router, { enabled: true, mode: 'polling', interval: 5000 })
      await rm._poll()
      if (rm._timer) { clearTimeout(rm._timer); rm._timer = null }
      expect(router.reload).toHaveBeenCalled()
    })

    it('does not reload when data.changed is false', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changed: false }),
      })
      const router = mockRouter()
      const rm = new RealtimeManager(router, { enabled: true, mode: 'polling', interval: 5000 })
      await rm._poll()
      if (rm._timer) { clearTimeout(rm._timer); rm._timer = null }
      expect(router.reload).not.toHaveBeenCalled()
    })

    it('handles fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('network'))
      const router = mockRouter()
      const rm = new RealtimeManager(router, { enabled: true, mode: 'polling', interval: 5000 })
      await rm._poll()
      if (rm._timer) { clearTimeout(rm._timer); rm._timer = null }
      expect(router.reload).not.toHaveBeenCalled()
    })
  })

  describe('onChange callback', () => {
    it('calls onChange if provided instead of default handler', async () => {
      const onChange = vi.fn()
      const router = mockRouter()
      const rm = new RealtimeManager(router, { enabled: true, mode: 'polling', onChange })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changed: true, path: '/other' }),
      })
      await rm._poll()
      if (rm._timer) { clearTimeout(rm._timer); rm._timer = null }
      expect(onChange).toHaveBeenCalledWith({ changed: true, path: '/other' }, router)
      expect(router.reload).not.toHaveBeenCalled()
    })
  })
})
