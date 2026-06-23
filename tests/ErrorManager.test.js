import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorManager } from '../src/ErrorManager.js'

function createManager(opts = {}) {
  return new ErrorManager(opts)
}

describe('ErrorManager', () => {
  describe('constructor', () => {
    it('creates default error pages for all HTTP status codes', () => {
      const em = createManager()
      expect(em.getDefaultPage(404)).toContain('404')
      expect(em.getDefaultPage(500)).toContain('500')
      expect(em.getDefaultPage(403)).toContain('403')
      expect(em.getDefaultPage(418)).toContain('418')
    })

    it('falls back to generic client/server pages for unknown codes', () => {
      const em = createManager()
      const page = em.getDefaultPage(999)
      expect(page).toBeTruthy()
    })
  })

  describe('getStatusConfig', () => {
    it('returns enabled by default', () => {
      const em = createManager({ errors: { enabled: true } })
      const cfg = em.getStatusConfig(404)
      expect(cfg.enabled).toBe(true)
      expect(cfg.group).toBe('client-error')
    })

    it('disables all errors when global enabled is false', () => {
      const em = createManager({ errors: { enabled: false } })
      expect(em.getStatusConfig(404).enabled).toBe(false)
    })

    it('disables via status-specific config', () => {
      const em = createManager({ errors: { status: { 404: { enabled: false } } } })
      expect(em.isEnabled(404)).toBe(false)
    })

    it('disables via group config', () => {
      const em = createManager({ errors: { groups: { 'client-error': { enabled: false } } } })
      expect(em.isEnabled(403)).toBe(false)
    })
  })

  describe('setStatusEnabled / setGroupEnabled', () => {
    it('toggles individual status codes at runtime', () => {
      const em = createManager()
      expect(em.isEnabled(404)).toBe(true)
      em.setStatusEnabled(404, false)
      expect(em.isEnabled(404)).toBe(false)
      em.setStatusEnabled(404, true)
      expect(em.isEnabled(404)).toBe(true)
    })

    it('toggles groups at runtime', () => {
      const em = createManager()
      em.setGroupEnabled('client-error', false)
      expect(em.isEnabled(403)).toBe(false)
      expect(em.isEnabled(404)).toBe(false)
    })
  })

  describe('getRedirect', () => {
    it('returns null when no redirect configured', () => {
      const em = createManager()
      expect(em.getRedirect(404)).toBeNull()
    })

    it('returns redirect when configured', () => {
      const em = createManager({ errors: { redirect: { 410: 404 } } })
      expect(em.getRedirect(410)).toBe(404)
    })
  })

  describe('getDefaultPage', () => {
    it('returns HTML with status code for known codes', () => {
      const em = createManager()
      const html = em.getDefaultPage(404)
      expect(html).toContain('Not Found')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('returns generic client error for unknown client status code', () => {
      const em = createManager()
      const html = em.getDefaultPage(460)
      expect(html).toContain('Client Error')
    })

    it('returns generic server error for unknown 5xx group', () => {
      const em = createManager()
      const html = em.getDefaultPage(599)
      expect(html).toContain('Server Error')
    })
  })

  describe('formatError', () => {
    it('includes stack trace when showStack is true', () => {
      const em = createManager()
      const err = new Error('test error')
      err.stack = 'Error: test error\n  at foo (bar.js:1:2)'
      const formatted = em.formatError(err, true)
      expect(formatted).toContain('test error')
      expect(formatted).toContain('bar.js')
    })

    it('excludes stack trace when showStack is false', () => {
      const em = createManager()
      const err = new Error('test error')
      err.stack = 'Error: test error\n  at foo (bar.js:1:2)'
      const formatted = em.formatError(err, false)
      expect(formatted).not.toContain('bar.js')
      expect(formatted).toBe('test error')
    })

    it('returns fallback for null error', () => {
      const em = createManager()
      expect(em.formatError(null)).toBe('An error occurred')
    })
  })

  describe('log', () => {
    it('calls custom log handler if provided', () => {
      const handler = vi.fn()
      const em = createManager()
      em.setLogHandler(handler)
      em.log(404, '/test', new Error('not found'))
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        path: '/test',
      }))
    })

    it('does not throw if handler throws', () => {
      const em = createManager()
      em.setLogHandler(() => { throw new Error('handler error') })
      expect(() => em.log(404, '/test', new Error('x'))).not.toThrow()
    })
  })

  describe('clearCache', () => {
    it('clears the cache without errors', () => {
      const em = createManager()
      em._cachePut('key', 'value')
      em.clearCache()
      expect(em._cache.size).toBe(0)
    })
  })
})
