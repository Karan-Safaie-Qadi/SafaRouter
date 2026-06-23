import { describe, it, expect } from 'vitest'
import { AccessController } from '../src/AccessController.js'
import { AccessDeniedError } from '../src/errors.js'

function createController(opts = {}) {
  return new AccessController(opts)
}

describe('AccessController', () => {
  describe('constructor', () => {
    it('initializes with empty blocked/ignored by default', () => {
      const ac = createController()
      expect(ac.isAccessible('/')).toBe(true)
      expect(ac.isBlocked('/')).toBeNull()
      expect(ac.isIgnored('/')).toBe(false)
    })

    it('initializes blocked patterns from config', () => {
      const ac = createController({ access: { blocked: ['/admin', '/api/*'] } })
      expect(ac.isBlocked('/admin')).toBeInstanceOf(AccessDeniedError)
      expect(ac.isBlocked('/api/users')).toBeInstanceOf(AccessDeniedError)
    })

    it('initializes ignored patterns from config', () => {
      const ac = createController({ access: { ignored: ['/old', '/temp/**'] } })
      expect(ac.isIgnored('/old')).toBe(true)
      expect(ac.isIgnored('/temp/files/data')).toBe(true)
    })
  })

  describe('block/unblock', () => {
    it('blocks a path and returns AccessDeniedError', () => {
      const ac = createController()
      ac.block('/secret')
      const result = ac.isBlocked('/secret')
      expect(result).toBeInstanceOf(AccessDeniedError)
      expect(result.pathname).toBe('/secret')
    })

    it('unblock removes a pattern', () => {
      const ac = createController()
      ac.block('/secret')
      ac.unblock('/secret')
      expect(ac.isBlocked('/secret')).toBeNull()
    })

    it('does not duplicate patterns', () => {
      const ac = createController()
      ac.block('/admin')
      ac.block('/admin')
      expect(ac._blocked.length).toBe(1)
    })
  })

  describe('ignore/unignore', () => {
    it('ignores a path', () => {
      const ac = createController()
      ac.ignore('/hidden')
      expect(ac.isIgnored('/hidden')).toBe(true)
      expect(ac.isAccessible('/hidden')).toBe(false)
    })

    it('unignore removes a pattern', () => {
      const ac = createController()
      ac.ignore('/hidden')
      ac.unignore('/hidden')
      expect(ac.isIgnored('/hidden')).toBe(false)
    })
  })

  describe('isAccessible', () => {
    it('returns true for accessible paths', () => {
      const ac = createController({ access: { blocked: ['/admin'], ignored: ['/old'] } })
      expect(ac.isAccessible('/')).toBe(true)
      expect(ac.isAccessible('/about')).toBe(true)
    })

    it('returns false for blocked paths', () => {
      const ac = createController({ access: { blocked: ['/admin'] } })
      expect(ac.isAccessible('/admin')).toBe(false)
    })

    it('returns false for ignored paths', () => {
      const ac = createController({ access: { ignored: ['/temp'] } })
      expect(ac.isAccessible('/temp')).toBe(false)
    })
  })

  describe('pattern matching', () => {
    it('exact match', () => {
      const ac = createController()
      ac.block('/admin')
      expect(ac.isBlocked('/admin')).toBeInstanceOf(AccessDeniedError)
      expect(ac.isBlocked('/admin/')).toBeInstanceOf(AccessDeniedError)
      expect(ac.isBlocked('/admin/settings')).toBeNull()
    })

    it('wildcard * matches single level', () => {
      const ac = createController()
      ac.block('/api/*')
      expect(ac.isBlocked('/api/users')).toBeInstanceOf(AccessDeniedError)
      expect(ac.isBlocked('/api/users/123')).toBeNull()
    })

    it('double wildcard ** matches all levels', () => {
      const ac = createController()
      ac.block('/private/**')
      expect(ac.isBlocked('/private')).toBeInstanceOf(AccessDeniedError)
      expect(ac.isBlocked('/private/files/data')).toBeInstanceOf(AccessDeniedError)
    })

    it('trailing slash matches with or without slash', () => {
      const ac = createController()
      ac.block('/dashboard/')
      expect(ac.isBlocked('/dashboard')).toBeInstanceOf(AccessDeniedError)
      expect(ac.isBlocked('/dashboard/')).toBeInstanceOf(AccessDeniedError)
    })
  })
})
