// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { SafaRouter } from '../src/SafaRouter.js'

describe('hideComponents', () => {
  function createRouter(opts = {}) {
    const router = new SafaRouter({
      target: '#app',
      routes: opts.routes || {},
      ...opts,
    })
    router._targetEl = { innerHTML: '', querySelectorAll: () => [] }
    return router
  }

  it('renders all components by default (no hideComponents)', () => {
    const fn1 = vi.fn(() => '<p>header</p>')
    const fn2 = vi.fn(() => '<p>footer</p>')
    const router = createRouter({
      routes: { '/': { page: '<p>home</p>' } },
      components: { header: fn1, footer: fn2 },
    })
    router._pathname = '/'
    router._routeData = { node: { meta: {} } }
    router._components = router.config.components
    document.querySelector = vi.fn(() => ({ innerHTML: '', querySelectorAll: () => [] }))
    router._renderComponents()
    expect(fn1).toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
  })

  it('hides all components when hideComponents is true', () => {
    const fn1 = vi.fn(() => '<p>header</p>')
    const router = createRouter({
      routes: { '/': { page: '<p>home</p>', meta: { hideComponents: true } } },
      components: { header: fn1 },
    })
    router._pathname = '/'
    router._routeData = { node: { meta: { hideComponents: true } } }
    router._components = router.config.components
    document.querySelector = vi.fn(() => ({ innerHTML: '', querySelectorAll: () => [] }))
    router._renderComponents()
    expect(fn1).not.toHaveBeenCalled()
  })

  it('hides specific component when listed in hideComponents array', () => {
    const fn1 = vi.fn(() => '<p>header</p>')
    const fn2 = vi.fn(() => '<p>sidebar</p>')
    const router = createRouter({
      routes: { '/': { page: '<p>home</p>', meta: { hideComponents: ['header'] } } },
      components: { header: fn1, sidebar: fn2 },
    })
    router._pathname = '/'
    router._routeData = { node: { meta: { hideComponents: ['header'] } } }
    router._components = router.config.components
    document.querySelector = vi.fn(() => ({ innerHTML: '', querySelectorAll: () => [] }))
    router._renderComponents()
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
  })
})
