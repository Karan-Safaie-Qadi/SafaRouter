import { describe, it, expect } from 'vitest'
import { RouteMatcher } from '../src/RouteMatcher.js'

describe('RouteMatcher', () => {
  it('matches static routes', () => {
    const m = RouteMatcher.create(['/about', '/contact'])
    const res = m.match('/about')
    expect(res).not.toBeNull()
    expect(res.pattern).toBe('/about')
  })

  it('matches dynamic routes', () => {
    const m = RouteMatcher.create(['/blog/[slug]'])
    const res = m.match('/blog/my-post')
    expect(res).not.toBeNull()
    expect(res.params.slug).toBe('my-post')
  })

  it('matches catch-all routes', () => {
    const m = RouteMatcher.create(['/docs/[...path]'])
    const res = m.match('/docs/a/b/c')
    expect(res).not.toBeNull()
    expect(res.params.path).toEqual(['a', 'b', 'c'])
  })

  it('matches optional catch-all', () => {
    const m = RouteMatcher.create(['/docs/[[...path]]'])
    expect(m.match('/docs')).not.toBeNull()
    expect(m.match('/docs/a/b')).not.toBeNull()
  })

  it('returns null for no match', () => {
    const m = RouteMatcher.create(['/about'])
    expect(m.match('/nonexistent')).toBeNull()
  })

  it('prefers static over dynamic', () => {
    const m = RouteMatcher.create(['/blog/[slug]', '/blog/latest'])
    const res = m.match('/blog/latest')
    expect(res.pattern).toBe('/blog/latest')
  })

  it('builds URL from params', () => {
    const m = new RouteMatcher()
    const url = m.build('/blog/[slug]', { slug: 'hello' })
    expect(url).toBe('/blog/hello')
  })

  it('builds URL with multiple params', () => {
    const m = new RouteMatcher()
    const url = m.build('/[lang]/docs/[slug]', { lang: 'en', slug: 'getting-started' })
    expect(url).toBe('/en/docs/getting-started')
  })

  it('clear removes all patterns', () => {
    const m = RouteMatcher.create(['/about'])
    m.clear()
    expect(m.patterns).toHaveLength(0)
  })

  it('addMultiple adds patterns', () => {
    const m = new RouteMatcher()
    m.addMultiple(['/a', '/b'])
    expect(m.patterns).toHaveLength(2)
  })

  it('stringify replaces multiple params', () => {
    const m = new RouteMatcher()
    const url = m.build('/[lang]/docs/[slug]', { lang: 'en', slug: 'guide' })
    expect(url).toBe('/en/docs/guide')
  })
})
