import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SafaRouter, defineRoute, defineRoutes, createRouter } from '../src/typed.js'
import { SafaRouter as OriginalSafaRouter } from '../src/SafaRouter.js'

function createMockRouter(opts = {}) {
  const router = new OriginalSafaRouter({
    target: '#app',
    pageDir: 'test-app/html-pages',
    ...opts,
  })
  router._history = { push: vi.fn(), replace: vi.fn(), init: vi.fn(), destroy: vi.fn(), back: vi.fn(), forward: vi.fn(), go: vi.fn(), clearState: vi.fn(), onChange: vi.fn(() => () => {}), isSupported: () => true, path: '/', length: 0, state: {} }
  if (typeof document === 'undefined') {
    global.document = { title: '', documentElement: { lang: 'en' }, createElement: () => ({}), querySelector: () => null }
  }
  return router
}

describe('typed router exports', () => {
  it('re-exports SafaRouter from main module', () => {
    expect(SafaRouter).toBe(OriginalSafaRouter)
  })

  it('defineRoute returns config unchanged', () => {
    const config = { page: 'index.html', meta: { title: 'Home' } }
    expect(defineRoute(config)).toBe(config)
  })

  it('defineRoutes returns routes object unchanged', () => {
    const routes = { '/': { page: 'index.html' }, '/about': { page: 'about.html' } }
    expect(defineRoutes(routes)).toBe(routes)
  })

  it('createRouter returns a SafaRouter instance', () => {
    const router = createRouter({ '/': { page: 'index.html' } }, { target: '#app', pageDir: 'test-app/html-pages' })
    expect(router).toBeInstanceOf(OriginalSafaRouter)
    expect(router.getConfig().routes).toEqual({ '/': { page: 'index.html' } })
  })

  it('createRouter works without options', () => {
    const router = createRouter({})
    expect(router).toBeInstanceOf(OriginalSafaRouter)
  })

  it('defineRoute accepts loader with typed params', async () => {
    const route = defineRoute({
      page: 'index.html',
      loader: async ({ params }) => {
        const slug = params.slug
        return { slug }
      },
    })
    expect(route.loader).toBeDefined()
    const result = await route.loader({ params: { slug: 'hello' }, query: {}, router: null })
    expect(result).toEqual({ slug: 'hello' })
  })

  it('createRouter merges routes into config', () => {
    const routes = { '/': { page: 'index.html' } }
    const router = createRouter(routes, { target: '#app' })
    expect(router.getConfig().routes).toStrictEqual(routes)
  })
})
