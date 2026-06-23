import { describe, it, expect } from 'vitest'
import {
  normalizePath, parseQuery, joinPaths,
  isDynamicSegment, isCatchAllSegment, isOptionalCatchAll,
  isRouteGroupSegment, extractParamName,
  isExternalURL, isSamePath, debounce,
} from '../src/utils.js'

describe('normalizePath', () => {
  it('returns / for empty or root', () => {
    expect(normalizePath('')).toBe('/')
    expect(normalizePath('/')).toBe('/')
  })
  it('removes trailing slash', () => {
    expect(normalizePath('/about/')).toBe('/about')
  })
  it('collapses double slashes', () => {
    expect(normalizePath('//about//us')).toBe('/about/us')
  })
  it('handles normal paths', () => {
    expect(normalizePath('/blog/post')).toBe('/blog/post')
  })
})

describe('parseQuery', () => {
  it('parses query string', () => {
    expect(parseQuery('?a=1&b=2')).toEqual({ a: '1', b: '2' })
  })
  it('returns empty object for empty input', () => {
    expect(parseQuery('')).toEqual({})
    expect(parseQuery('?')).toEqual({})
  })
})

describe('joinPaths', () => {
  it('joins path segments', () => {
    expect(joinPaths('a', 'b', 'c')).toBe('/a/b/c')
  })
  it('filters empty segments', () => {
    expect(joinPaths('a', '', 'b')).toBe('/a/b')
  })
})

describe('isDynamicSegment', () => {
  it('detects [param]', () => {
    expect(isDynamicSegment('[slug]')).toBe(true)
    expect(isDynamicSegment('[...rest]')).toBe(true)
    expect(isDynamicSegment('[[...rest]]')).toBe(true)
  })
  it('rejects static segments', () => {
    expect(isDynamicSegment('about')).toBe(false)
    expect(isDynamicSegment('')).toBe(false)
  })
})

describe('isCatchAllSegment', () => {
  it('detects catch-all', () => {
    expect(isCatchAllSegment('[...rest]')).toBe(true)
  })
  it('rejects dynamic and optional', () => {
    expect(isCatchAllSegment('[slug]')).toBe(false)
    expect(isCatchAllSegment('[[...rest]]')).toBe(false)
  })
})

describe('isOptionalCatchAll', () => {
  it('detects optional catch-all', () => {
    expect(isOptionalCatchAll('[[...rest]]')).toBe(true)
  })
  it('rejects regular catch-all', () => {
    expect(isOptionalCatchAll('[...rest]')).toBe(false)
  })
})

describe('isRouteGroupSegment', () => {
  it('detects (group)', () => {
    expect(isRouteGroupSegment('(auth)')).toBe(true)
    expect(isRouteGroupSegment('(main)')).toBe(true)
  })
  it('rejects non-groups', () => {
    expect(isRouteGroupSegment('[slug]')).toBe(false)
    expect(isRouteGroupSegment('about')).toBe(false)
  })
})

describe('extractParamName', () => {
  it('extracts from [param]', () => {
    expect(extractParamName('[slug]')).toBe('slug')
  })
  it('extracts from [...param]', () => {
    expect(extractParamName('[...rest]')).toBe('rest')
  })
  it('returns null for static', () => {
    expect(extractParamName('about')).toBeNull()
  })
})

describe('isExternalURL', () => {
  it('detects external URLs', () => {
    expect(isExternalURL('https://example.com')).toBe(true)
  })
  it('returns false for relative URLs', () => {
    expect(isExternalURL('/about')).toBe(false)
  })
  it('returns false for empty', () => {
    expect(isExternalURL('')).toBe(false)
  })
})

describe('isSamePath', () => {
  it('compares normalized paths', () => {
    expect(isSamePath('/about/', '/about')).toBe(true)
  })
  it('distinguishes different paths', () => {
    expect(isSamePath('/about', '/contact')).toBe(false)
  })
})

describe('debounce', () => {
  it('delays execution', async () => {
    let count = 0
    const fn = debounce(() => count++, 50)
    fn()
    fn()
    fn()
    expect(count).toBe(0)
    await new Promise(r => setTimeout(r, 100))
    expect(count).toBe(1)
  })
})
