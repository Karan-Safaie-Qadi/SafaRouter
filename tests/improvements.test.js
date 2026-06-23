import { describe, it, expect, vi } from 'vitest'
import { SafaRouter } from '../src/SafaRouter.js'
import { useRouter, emit } from '../src/utils.js'
import { EVENTS } from '../src/constants.js'
import { Link } from '../src/Link.js'

function createMockRouter(opts = {}) {
  const router = new SafaRouter({
    target: '#app',
    routes: opts.routes || {},
    pagesDir: opts.pagesDir,
    maxCacheSize: opts.maxCacheSize,
  })
  return router
}

describe('LRU Cache', () => {
  it('evicts oldest entry when cache exceeds maxCacheSize', () => {
    const router = createMockRouter({ maxCacheSize: 3 })
    router._cachePut('/a', 'content-a')
    router._cachePut('/b', 'content-b')
    router._cachePut('/c', 'content-c')
    expect(router._cache.size).toBe(3)
    router._cachePut('/d', 'content-d')
    expect(router._cache.size).toBe(3)
    expect(router._cacheGet('/a')).toBeUndefined()
    expect(router._cacheGet('/d')).toBe('content-d')
  })

  it('reorders on cacheGet, preserving recently accessed', () => {
    const router = createMockRouter({ maxCacheSize: 3 })
    router._cachePut('/a', 'A')
    router._cachePut('/b', 'B')
    router._cachePut('/c', 'C')
    router._cacheGet('/a')
    router._cachePut('/d', 'D')
    expect(router._cacheGet('/a')).toBe('A')
    expect(router._cacheGet('/b')).toBeUndefined()
  })

  it('does not evict when maxCacheSize is 0 (unlimited)', () => {
    const router = createMockRouter({ maxCacheSize: 0 })
    for (let i = 0; i < 100; i++) router._cachePut(`/p${i}`, i)
    expect(router._cache.size).toBe(100)
  })

  it('updates value and moves to front on re-put', () => {
    const router = createMockRouter({ maxCacheSize: 3 })
    router._cachePut('/a', 'old')
    router._cachePut('/b', 'B')
    router._cachePut('/c', 'C')
    router._cachePut('/a', 'new')
    expect(router._cacheGet('/a')).toBe('new')
    router._cachePut('/d', 'D')
    expect(router._cacheGet('/b')).toBeUndefined()
    expect(router._cacheGet('/d')).toBe('D')
  })
})

describe('Link active state', () => {
  it('does not mark active for similar but different paths', () => {
    const router = createMockRouter()
    router._pathname = '/blogger'
    const link = new Link({ router, href: '/blog', activeClass: 'active' })
    link._el = { classList: { toggle: vi.fn() } }
    link._refresh()
    expect(link._el.classList.toggle).toHaveBeenCalledWith('active', false)

    router._pathname = '/blog'
    link._refresh()
    expect(link._el.classList.toggle).toHaveBeenCalledWith('active', true)
  })

  it('marks child routes as active', () => {
    const router = createMockRouter()
    router._pathname = '/blog/post-1'
    const link = new Link({ router, href: '/blog', activeClass: 'active' })
    link._el = { classList: { toggle: vi.fn() } }
    link._refresh()
    expect(link._el.classList.toggle).toHaveBeenCalledWith('active', true)
  })
})

describe('useRouter auto-cleanup', () => {
  it('unsubscribe clears subscribers and route listener', () => {
    const router = createMockRouter()
    const { subscribe, unsubscribe } = useRouter(router)
    const fn = vi.fn()
    subscribe(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    fn.mockClear()
    unsubscribe()
    emit(router._events, EVENTS.ROUTE_CHANGE, { pathname: '/' })
    expect(fn).toHaveBeenCalledTimes(0)
  })

  it('cleans up on destroy event', () => {
    const router = createMockRouter()
    const { subscribe } = useRouter(router)
    const fn = vi.fn()
    subscribe(fn)
    fn.mockClear()
    emit(router._events, EVENTS.DESTROY, {})
    emit(router._events, EVENTS.ROUTE_CHANGE, { pathname: '/' })
    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('Redirect loop ERROR event', () => {
  it('emits ERROR event on redirect loop', async () => {
    const router = createMockRouter()
    let callCount = 0
    router.use((ctx, next) => {
      callCount++
      ctx.redirect = '/other'
      return next()
    })
    const handler = vi.fn()
    router.on(EVENTS.ERROR, handler)
    await router._navigate('/test', 'push', {}, {}, 11)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0].error.message).toBe('Redirect loop detected')
    expect(handler.mock.calls[0][0].path).toBe('/test')
  })
})

describe('_handleNotFound state', () => {
  it('passes state to history.push in HTML notFound', async () => {
    const router = createMockRouter({ pagesDir: '.' })
    router._fetchSpecial = vi.fn(async () => '<h1>404</h1>')
    router._renderWithLayouts = vi.fn(async (html) => html)
    router._globalLayout = null
    router._targetEl = { innerHTML: '' }
    const pushSpy = vi.fn()
    const replaceSpy = vi.fn()
    router._history.push = pushSpy
    router._history.replace = replaceSpy
    await router._handleNotFound('/missing', 'push', undefined, { from: 'test', code: 404 })
    expect(pushSpy).toHaveBeenCalledWith('/missing', { from: 'test', code: 404 })
  })

  it('passes state to history.replace in HTML notFound', async () => {
    const router = createMockRouter({ pagesDir: '.' })
    router._fetchSpecial = vi.fn(async () => '<h1>404</h1>')
    router._renderWithLayouts = vi.fn(async (html) => html)
    router._globalLayout = null
    router._targetEl = { innerHTML: '' }
    const pushSpy = vi.fn()
    const replaceSpy = vi.fn()
    router._history.push = pushSpy
    router._history.replace = replaceSpy
    await router._handleNotFound('/missing', 'replace', undefined, { from: 'test' })
    expect(replaceSpy).toHaveBeenCalledWith('/missing', { from: 'test' })
  })
})
