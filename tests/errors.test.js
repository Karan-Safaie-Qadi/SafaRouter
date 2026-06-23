import { describe, it, expect } from 'vitest'
import { SafaError, RouteNotFoundError, NavigationError, RouteLoadError, NavigationAbortError, HttpError, AccessDeniedError, MaintenanceModeError } from '../src/errors.js'

describe('SafaError', () => {
  it('creates error with code', () => {
    const err = new SafaError('test', 'TEST_CODE')
    expect(err.message).toBe('test')
    expect(err.code).toBe('TEST_CODE')
    expect(err.name).toBe('SafaError')
  })

  it('toJSON returns serialized error', () => {
    const err = new SafaError('test', 'CODE')
    expect(err.toJSON()).toEqual({ name: 'SafaError', message: 'test', code: 'CODE' })
  })
})

describe('RouteNotFoundError', () => {
  it('sets pathname property', () => {
    const err = new RouteNotFoundError('/foo')
    expect(err.pathname).toBe('/foo')
    expect(err.code).toBe('ROUTE_NOT_FOUND')
  })
})

describe('RouteLoadError', () => {
  it('wraps original error', () => {
    const original = new Error('fetch failed')
    const err = new RouteLoadError('/page', original)
    expect(err.pathname).toBe('/page')
    expect(err.original).toBe(original)
    expect(err.message).toContain('fetch failed')
  })
})

describe('NavigationAbortError', () => {
  it('has default message', () => {
    const err = new NavigationAbortError()
    expect(err.message).toContain('Navigation cancelled')
  })
})

describe('HttpError', () => {
  it('creates error with status code and group', () => {
    const err = new HttpError(404, '/missing')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('HTTP_404')
    expect(err.group).toBe('client-error')
    expect(err.pathname).toBe('/missing')
  })

  it('toJSON includes statusCode and pathname', () => {
    const err = new HttpError(500, '/crash')
    const json = err.toJSON()
    expect(json.statusCode).toBe(500)
    expect(json.pathname).toBe('/crash')
    expect(json.group).toBe('server-error')
  })
})

describe('AccessDeniedError', () => {
  it('creates error with 403 status', () => {
    const err = new AccessDeniedError('/admin')
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('ACCESS_DENIED')
    expect(err.pathname).toBe('/admin')
  })
})

describe('MaintenanceModeError', () => {
  it('creates error with 503 status', () => {
    const err = new MaintenanceModeError('/site')
    expect(err.statusCode).toBe(503)
    expect(err.code).toBe('MAINTENANCE_MODE')
    expect(err.pathname).toBe('/site')
  })
})
