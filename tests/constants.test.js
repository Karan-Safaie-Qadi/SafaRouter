import { describe, it, expect } from 'vitest'
import { EVENTS, SEGMENT_TYPES, PARAM_PATTERNS, PATTERN_SCORES, DEFAULT_CONFIG } from '../src/constants.js'

describe('EVENTS', () => {
  it('defines all lifecycle events', () => {
    expect(EVENTS.BEFORE_NAVIGATE).toBe('beforenavigate')
    expect(EVENTS.ROUTE_CHANGE).toBe('routechange')
    expect(EVENTS.AFTER_NAVIGATE).toBe('afternavigate')
    expect(EVENTS.ERROR).toBe('error')
    expect(EVENTS.NOT_FOUND).toBe('notfound')
    expect(EVENTS.LOADING).toBe('loading')
    expect(EVENTS.READY).toBe('ready')
    expect(EVENTS.DESTROY).toBe('destroy')
  })
})

describe('PARAM_PATTERNS', () => {
  it('matches [param] with capture group', () => {
    const m = '[slug]'.match(PARAM_PATTERNS.DYNAMIC)
    expect(m[1]).toBe('slug')
  })
  it('matches [...param] with capture group', () => {
    const m = '[...rest]'.match(PARAM_PATTERNS.CATCH_ALL)
    expect(m[1]).toBe('rest')
  })
  it('matches [[...param]] with capture group', () => {
    const m = '[[...rest]]'.match(PARAM_PATTERNS.OPTIONAL_CATCH_ALL)
    expect(m[1]).toBe('rest')
  })
  it('matches (group) with capture group', () => {
    const m = '(auth)'.match(PARAM_PATTERNS.GROUP)
    expect(m[1]).toBe('auth')
  })
})

describe('PATTERN_SCORES', () => {
  it('static has highest score', () => {
    expect(PATTERN_SCORES[SEGMENT_TYPES.STATIC]).toBe(100)
    expect(PATTERN_SCORES[SEGMENT_TYPES.DYNAMIC]).toBe(10)
    expect(PATTERN_SCORES[SEGMENT_TYPES.CATCH_ALL]).toBe(1)
  })
})

describe('DEFAULT_CONFIG', () => {
  it('has all default keys', () => {
    expect(DEFAULT_CONFIG.target).toBe('#app')
    expect(DEFAULT_CONFIG.basePath).toBe('')
    expect(DEFAULT_CONFIG.useHash).toBe(false)
    expect(DEFAULT_CONFIG.scrollToTop).toBe(false)
    expect(DEFAULT_CONFIG.prefetch).toBe(true)
  })
})
