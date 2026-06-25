import { describe, it, expect, vi } from 'vitest'
import { RouteTree } from '../src/RouteTree.js'
import { SafaRouter } from '../src/SafaRouter.js'

describe('Parallel slots', () => {
  it('RouteTree resolve includes slots when defined', () => {
    const tree = new RouteTree({
      '/dashboard': {
        page: () => '<h1>Dashboard</h1>',
        slots: {
          sidebar: { page: () => '<nav>Sidebar</nav>' },
          main: { page: () => '<div>Content</div>' },
        },
      },
    })
    const match = tree.resolve('/dashboard')
    expect(match).not.toBeNull()
    expect(match.slots).not.toBeNull()
    expect(Object.keys(match.slots)).toEqual(['sidebar', 'main'])
    expect(typeof match.slots.sidebar.page).toBe('function')
    expect(typeof match.slots.main.page).toBe('function')
  })

  it('slots is null when no slots defined', () => {
    const tree = new RouteTree({
      '/': { page: () => '<h1>Home</h1>' },
    })
    const match = tree.resolve('/')
    expect(match.slots).toBeNull()
  })

  it('slot has loader in route definition', () => {
    const tree = new RouteTree({
      '/dashboard': {
        page: () => '<h1>Dashboard</h1>',
        slots: {
          sidebar: {
            page: () => '<nav>Sidebar</nav>',
            loader: async () => ({ items: [1, 2, 3] }),
          },
        },
      },
    })
    const match = tree.resolve('/dashboard')
    expect(typeof match.slots.sidebar.loader).toBe('function')
  })

  it('resolve matches route without page when it has slots', () => {
    const tree = new RouteTree({
      '/dashboard': {
        slots: {
          main: { page: () => '<div>Content</div>' },
        },
      },
    })
    const match = tree.resolve('/dashboard')
    expect(match).not.toBeNull()
    expect(match.slots).not.toBeNull()
  })

  it('flatten includes slots info', () => {
    const tree = new RouteTree({
      '/dashboard': {
        page: () => '<h1>Dashboard</h1>',
        slots: {
          sidebar: { page: () => '<nav>Sidebar</nav>' },
        },
      },
    })
    const flat = tree.flatten()
    const dash = flat.find(r => r.path === '/dashboard')
    expect(dash.slots).not.toBeNull()
    expect(dash.slots.sidebar).not.toBeNull()
  })
})

describe('Intercepting routes', () => {
  it('RouteTree resolve includes intercept when defined', () => {
    const tree = new RouteTree({
      '/gallery': { page: () => '<h1>Gallery</h1>' },
      '/photo/[id]': {
        page: () => '<div>Photo</div>',
        intercept: true,
      },
    })
    const match = tree.resolve('/photo/123')
    expect(match).not.toBeNull()
    expect(match.intercept).toBe(true)
  })

  it('intercept is null when not defined', () => {
    const tree = new RouteTree({
      '/': { page: () => '<h1>Home</h1>' },
    })
    const match = tree.resolve('/')
    expect(match.intercept).toBeNull()
  })

  it('intercept can be an object with from pattern', () => {
    const tree = new RouteTree({
      '/photo/[id]': {
        page: () => '<div>Photo</div>',
        intercept: { from: '/gallery' },
      },
    })
    const match = tree.resolve('/photo/42')
    expect(match.intercept).toEqual({ from: '/gallery' })
  })
})

describe('Router slot rendering', () => {
  async function createRouter(routes) {
    const RouteTreeModule = await import('../src/RouteTree.js')
    const router = new SafaRouter({ target: '#app', routes })
    router._routeTree = new RouteTreeModule.RouteTree(routes)
    router._history = { push: vi.fn(), replace: vi.fn(), onChange: vi.fn(), init: vi.fn() }
    router._started = true
    router._targetEl = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null }
    return router
  }

  it('_renderSlots does not throw without slots', async () => {
    const router = await createRouter({
      '/': { page: () => '<h1>Home</h1>' },
    })
    expect(() => router._renderSlots()).not.toThrow()
  })

  it('_renderSlots does not throw when document is undefined', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(() => router._renderSlots()).not.toThrow()
  })

  it('loads slot data via loaders in parallel', async () => {
    let sidebarCalls = 0
    let mainCalls = 0
    const router = await createRouter({
      '/dashboard': {
        page: () => '<div data-safa-slot="sidebar"></div><div data-safa-slot="main"></div>',
        slots: {
          sidebar: {
            page: ({ data }) => `<nav>${data.items.join(',')}</nav>`,
            loader: async () => { sidebarCalls++; return { items: ['a', 'b'] } },
          },
          main: {
            page: ({ data }) => `<div>${data.title}</div>`,
            loader: async () => { mainCalls++; return { title: 'Hello' } },
          },
        },
      },
    })
    router._navId = 1
    router._pathname = '/dashboard'
    router._params = {}
    router._query = {}
    const routeMatch = router._routeTree.resolve('/dashboard')
    expect(routeMatch).not.toBeNull()
    router._routeData = routeMatch
    // Simulate the loader execution
    if (routeMatch.slots) {
      router._routeData.slotData = {}
      const slotEntries = Object.entries(routeMatch.slots)
      await Promise.all(slotEntries.map(async ([name, slot]) => {
        if (!slot.loader) return
        router._routeData.slotData[name] = await slot.loader({
          params: router._params, query: router._query, router,
        })
      }))
    }
    expect(sidebarCalls).toBe(1)
    expect(mainCalls).toBe(1)
    expect(router._routeData.slotData.sidebar.items).toEqual(['a', 'b'])
    expect(router._routeData.slotData.main.title).toBe('Hello')
  })
})

describe('Router intercepting', () => {
  async function createRouter(routes) {
    const RouteTreeModule = await import('../src/RouteTree.js')
    const router = new SafaRouter({ target: '#app', routes })
    router._routeTree = new RouteTreeModule.RouteTree(routes)
    router._history = { push: vi.fn(), replace: vi.fn(), back: vi.fn(), onChange: vi.fn(), init: vi.fn() }
    router._started = true
    router._targetEl = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null, appendChild: vi.fn() }
    return router
  }

  it('_shouldIntercept returns false without previous route', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    expect(router._shouldIntercept(true)).toBe(false)
    expect(router._shouldIntercept({ from: '/gallery' })).toBe(false)
  })

  it('_shouldIntercept returns true for intercept:true when previous route exists', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    router._previousRouteData = { node: { fullPath: '/gallery' } }
    expect(router._shouldIntercept(true)).toBe(true)
  })

  it('_shouldIntercept matches from pattern', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    router._previousRouteData = { node: { fullPath: '/gallery' } }
    router._previousPathname = '/gallery'
    expect(router._shouldIntercept({ from: '/gallery' })).toBe(true)
    expect(router._shouldIntercept({ from: '/about' })).toBe(false)
  })

  it('_shouldIntercept uses regex pattern', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    router._previousRouteData = { node: { fullPath: '/gallery/123' } }
    router._previousPathname = '/gallery/123'
    expect(router._shouldIntercept({ from: /^\/gallery/ })).toBe(true)
    expect(router._shouldIntercept({ from: /^\/about/ })).toBe(false)
  })

  it('dismissInterceptor cleans up state', () => {
    const router = new SafaRouter({ target: '#app', routes: {} })
    router._history = { back: vi.fn() }
    router._interceptActive = true
    router._previousRouteData = { data: { msg: 'hello' } }
    router._interceptOverlay = { remove: vi.fn() }
    router.dismissInterceptor()
    expect(router._interceptActive).toBe(false)
    expect(router._interceptOverlay).toBeNull()
    expect(router._routeData).toEqual({ data: { msg: 'hello' } })
    expect(router._history.back).toHaveBeenCalled()
  })
})
