import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ScrollManager } from '../src/ScrollManager.js'

describe('ScrollManager', () => {
  beforeEach(() => {
    global.window = { scrollY: 100, scrollTo: vi.fn() }
    global.requestAnimationFrame = vi.fn(cb => cb())
  })

  afterEach(() => {
    delete global.window
    delete global.requestAnimationFrame
  })

  it('saves and restores scroll position', () => {
    const sm = new ScrollManager()
    sm.save('/page')
    expect(sm.has('/page')).toBe(true)
    sm.restore('/page')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100)
  })

  it('scrolls to top when scrollToTop is true', () => {
    const sm = new ScrollManager()
    sm.restore('/page', true)
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('does nothing for unknown path', () => {
    const sm = new ScrollManager()
    sm.restore('/unknown')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('clear removes all saved positions', () => {
    const sm = new ScrollManager()
    sm.save('/a')
    sm.save('/b')
    expect(sm.size).toBe(2)
    sm.clear()
    expect(sm.size).toBe(0)
  })

  it('tracks and untracks scroll elements', () => {
    const sm = new ScrollManager()
    const el = { addEventListener: vi.fn(), removeEventListener: vi.fn(), scrollTop: 50 }
    sm.trackScrollElement(el)
    expect(el.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    sm.untrackScrollElement(el)
    expect(el.removeEventListener).toHaveBeenCalled()
  })
})
