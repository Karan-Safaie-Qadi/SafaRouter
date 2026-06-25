import { describe, it, expect } from 'vitest'
import { LoaderCache } from '../src/LoaderCache.js'

describe('LoaderCache', () => {
  it('returns null when disabled', () => {
    const cache = new LoaderCache({ enabled: false })
    const route = '/blog/[slug]'
    cache.set(route, { slug: 'hi' }, {}, 'data')
    expect(cache.get(route, { slug: 'hi' }, {})).toBeNull()
  })

  it('stores and retrieves fresh data', () => {
    const cache = new LoaderCache({ staleTime: 60000 })
    cache.set('/blog/[slug]', { slug: 'hi' }, {}, { title: 'Hello' })
    const result = cache.get('/blog/[slug]', { slug: 'hi' }, {})
    expect(result).toEqual({ data: { title: 'Hello' }, stale: false })
  })

  it('returns null for missing entry', () => {
    const cache = new LoaderCache()
    expect(cache.get('/missing', {}, {})).toBeNull()
  })

  it('marks data as stale after staleTime', async () => {
    const cache = new LoaderCache({ staleTime: 10 })
    cache.set('/a', {}, {}, 'data')
    await new Promise(r => setTimeout(r, 30))
    const result = cache.get('/a', {}, {})
    expect(result.stale).toBe(true)
    expect(result.data).toBe('data')
  })

  it('uses per-entry TTL when provided', async () => {
    const cache = new LoaderCache({ staleTime: 60000 })
    cache.set('/a', {}, {}, 'fast', 10)
    await new Promise(r => setTimeout(r, 30))
    const result = cache.get('/a', {}, {})
    expect(result.stale).toBe(true)
  })

  it('deduplicates concurrent fetches', async () => {
    const cache = new LoaderCache()
    let callCount = 0
    const fetcher = () => {
      callCount++
      return Promise.resolve('result')
    }
    const [a, b] = await Promise.all([
      cache.fetch('/a', {}, {}, fetcher),
      cache.fetch('/a', {}, {}, fetcher)
    ])
    expect(a).toBe('result')
    expect(b).toBe('result')
    expect(callCount).toBe(1)
  })

  it('invalidates specific entry', () => {
    const cache = new LoaderCache()
    cache.set('/blog/[slug]', { slug: 'a' }, {}, 'hello')
    cache.set('/blog/[slug]', { slug: 'b' }, {}, 'world')
    cache.invalidate('/blog/[slug]', { slug: 'a' }, {})
    expect(cache.get('/blog/[slug]', { slug: 'a' }, {})).toBeNull()
    expect(cache.get('/blog/[slug]', { slug: 'b' }, {})).not.toBeNull()
  })

  it('invalidates all entries for a route path', () => {
    const cache = new LoaderCache()
    cache.set('/blog/[slug]', { slug: 'a' }, {}, 'hello')
    cache.set('/blog/[slug]', { slug: 'b' }, {}, 'world')
    cache.invalidate('/blog/[slug]')
    expect(cache.get('/blog/[slug]', { slug: 'a' }, {})).toBeNull()
    expect(cache.get('/blog/[slug]', { slug: 'b' }, {})).toBeNull()
  })

  it('clears all cache', () => {
    const cache = new LoaderCache()
    cache.set('/a', {}, {}, 1)
    cache.set('/b', {}, {}, 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('/a', {}, {})).toBeNull()
  })

  it('enforces maxSize', () => {
    const cache = new LoaderCache({ maxSize: 2 })
    cache.set('/a', {}, {}, 1)
    cache.set('/b', {}, {}, 2)
    cache.set('/c', {}, {}, 3)
    expect(cache.size).toBe(2)
  })

  it('evicts old entries when maxSize reached (LRU-like)', () => {
    const cache = new LoaderCache({ maxSize: 2 })
    cache.set('/a', {}, {}, 1)
    cache.set('/b', {}, {}, 2)
    cache.set('/c', {}, {}, 3)
    expect(cache.get('/a', {}, {})).toBeNull()
    expect(cache.get('/b', {}, {})).not.toBeNull()
    expect(cache.get('/c', {}, {})).not.toBeNull()
  })
})
