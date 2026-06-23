import { describe, it, expect } from 'vitest'
import { matchRoute, matchPattern, routeExists, listRoutes, renderRoute } from '../src/ssr.js'

describe('matchRoute', () => {
  const routes = {
    '/': { page: () => 'home' },
    '/blog': {
      page: () => 'blog',
      children: {
        '[slug]': { page: ({ params }) => `post: ${params.slug}` },
      },
    },
  }

  it('matches root', () => {
    const res = matchRoute('/', routes)
    expect(res).not.toBeNull()
    expect(res.path).toBe('/')
  })

  it('matches static route', () => {
    const res = matchRoute('/blog', routes)
    expect(res).not.toBeNull()
    expect(res.params).toEqual({})
  })

  it('matches dynamic route with params', () => {
    const res = matchRoute('/blog/my-post', routes)
    expect(res).not.toBeNull()
    expect(res.params.slug).toBe('my-post')
  })

  it('returns null for no match', () => {
    expect(matchRoute('/nonexistent', routes)).toBeNull()
  })
})

describe('matchPattern', () => {
  it('matches static pattern', () => {
    const res = matchPattern('/about', ['/about', '/contact'])
    expect(res).not.toBeNull()
    expect(res.pattern).toBe('/about')
  })

  it('matches dynamic pattern', () => {
    const res = matchPattern('/blog/post', ['/blog/[slug]'])
    expect(res).not.toBeNull()
    expect(res.params.slug).toBe('post')
  })

  it('returns null for no match', () => {
    expect(matchPattern('/nope', ['/about'])).toBeNull()
  })
})

describe('routeExists', () => {
  const routes = { '/about': { page: () => 'about' } }

  it('returns true for existing', () => {
    expect(routeExists('/about', routes)).toBe(true)
  })

  it('returns false for missing', () => {
    expect(routeExists('/nope', routes)).toBe(false)
  })
})

describe('listRoutes', () => {
  it('lists all routes', () => {
    const routes = {
      '/': { page: () => 'home', meta: { title: 'Home' } },
      '/about': { page: () => 'about' },
    }
    const list = listRoutes(routes)
    expect(list.length).toBe(2)
    expect(list.find(r => r.path === '/').meta.title).toBe('Home')
  })
})

describe('renderRoute', () => {
  const routes = {
    '/': {
      layout: ({ children }) => `<root>${children}</root>`,
      page: () => '<h1>Home</h1>',
    },
    '/about': { page: () => '<h1>About</h1>' },
  }

  it('renders root with layout', async () => {
    const html = await renderRoute('/', routes)
    expect(html).toBe('<root><h1>Home</h1></root>')
  })

  it('renders page with root layout inherited', async () => {
    const html = await renderRoute('/about', routes)
    expect(html).toBe('<root><h1>About</h1></root>')
  })

  it('returns null for unmatched', async () => {
    const html = await renderRoute('/nope', routes)
    expect(html).toBeNull()
  })
})
