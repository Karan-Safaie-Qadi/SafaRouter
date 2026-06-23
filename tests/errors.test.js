import { describe, it, expect } from 'vitest'
import { SafaError, RouteNotFoundError, NavigationError, RouteLoadError, NavigationAbortError } from '../src/errors.js'

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
