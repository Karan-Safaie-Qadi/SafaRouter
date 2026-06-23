import { describe, it, expect } from 'vitest'
import { RouteTree } from '../src/RouteTree.js'

describe('RouteTree', () => {
  it('creates root node with empty routes', () => {
    const tree = new RouteTree({})
    expect(tree.root.segment).toBe('')
    expect(tree.root.fullPath).toBe('/')
  })

  it('builds flat routes', () => {
    const tree = new RouteTree({
      '/': { page: () => 'home' },
      '/about': { page: () => 'about' },
    })
    const home = tree.resolve('/')
    expect(home).not.toBeNull()
    expect(home.node.page()).toBe('home')

    const about = tree.resolve('/about')
    expect(about).not.toBeNull()
    expect(about.node.page()).toBe('about')
  })

  it('resolves nested routes', () => {
    const tree = new RouteTree({
      '/': { page: () => 'home' },
      '/blog': {
        page: () => 'blog',
        children: {
          '[slug]': { page: () => 'post' },
        },
      },
    })
    const post = tree.resolve('/blog/my-post')
    expect(post).not.toBeNull()
    expect(post.params.slug).toBe('my-post')
  })

  it('resolves catch-all routes', () => {
    const tree = new RouteTree({
      '/docs': {
        children: {
          '[...path]': { page: () => 'docs' },
        },
      },
    })
    const res = tree.resolve('/docs/a/b/c')
    expect(res).not.toBeNull()
    expect(res.params.path).toEqual(['a', 'b', 'c'])
  })

  it('resolves flat catch-all key with slashes', () => {
    const tree = new RouteTree({
      '/docs/[...path]': { page: () => 'docs' },
    })
    const res = tree.resolve('/docs/a/b/c')
    expect(res).not.toBeNull()
    expect(res.params.path).toEqual(['a', 'b', 'c'])
  })

  it('returns null for unmatched routes', () => {
    const tree = new RouteTree({
      '/': { page: () => 'home' },
    })
    expect(tree.resolve('/nonexistent')).toBeNull()
  })

  it('builds layout chain including root layout', () => {
    const rootLayout = () => 'root'
    const dashLayout = () => 'dash'
    const tree = new RouteTree({
      '/': { layout: rootLayout, page: () => 'home' },
      '/dashboard': {
        layout: dashLayout,
        page: () => 'dash',
      },
    })
    const dash = tree.resolve('/dashboard')
    expect(dash.layouts).toEqual([rootLayout, dashLayout])
  })

  it('ignores route groups in path resolution', () => {
    const tree = new RouteTree({
      '(main)': {
        children: {
          '/profile': { page: () => 'profile' },
        },
      },
    })
    const res = tree.resolve('/profile')
    expect(res).not.toBeNull()
    expect(res.node.page()).toBe('profile')
  })

  it('resolves static over dynamic', () => {
    const tree = new RouteTree({
      '/blog': {
        children: {
          '[slug]': { page: () => 'dynamic' },
          'latest': { page: () => 'static' },
        },
      },
    })
    const res = tree.resolve('/blog/latest')
    expect(res).not.toBeNull()
    expect(res.node.page()).toBe('static')
  })

  it('flattens routes', () => {
    const tree = new RouteTree({
      '/': { page: () => 'home', meta: { title: 'Home' } },
      '/about': { page: () => 'about' },
    })
    const flat = tree.flatten()
    expect(flat.length).toBe(2)
    expect(flat.find(r => r.path === '/').meta.title).toBe('Home')
  })

  it('handles nested groups', () => {
    const tree = new RouteTree({
      '(app)': {
        children: {
          '(auth)': {
            children: {
              '/login': { page: () => 'login' },
              '/register': { page: () => 'register' },
            },
          },
          '/dashboard': { page: () => 'dashboard' },
        },
      },
    })
    expect(tree.resolve('/login')).not.toBeNull()
    expect(tree.resolve('/register')).not.toBeNull()
    expect(tree.resolve('/dashboard')).not.toBeNull()
    expect(tree.resolve('/login').node.page()).toBe('login')
  })
})

describe('RouteNode', () => {
  it('getLayoutChain includes own layout and ancestors', () => {
    const tree = new RouteTree({
      '/': { layout: () => 'root' },
      '/dashboard': {
        layout: () => 'dash',
        page: () => 'page',
      },
    })
    const res = tree.resolve('/dashboard')
    expect(res.layouts.length).toBeGreaterThanOrEqual(1)
  })
})
