import { describe, it, expect } from 'vitest'
import { MiddlewareChain } from '../src/MiddlewareChain.js'

describe('MiddlewareChain', () => {
  it('runs middleware in order', async () => {
    const order = []
    const chain = new MiddlewareChain()
    chain.use(async (ctx, next) => { order.push(1); return next() })
    chain.use(async (ctx, next) => { order.push(2); return next() })
    await chain.run({})
    expect(order).toEqual([1, 2])
  })

  it('passes ctx through chain', async () => {
    const chain = new MiddlewareChain()
    chain.use((ctx, next) => { ctx.value = 1; return next() })
    chain.use((ctx, next) => { ctx.value += 1; return next() })
    const ctx = {}
    await chain.run(ctx)
    expect(ctx.value).toBe(2)
  })

  it('can cancel navigation', async () => {
    const chain = new MiddlewareChain()
    chain.use((ctx, next) => { ctx.cancelled = true })
    chain.use((ctx, next) => { ctx.value = 1; return next() })
    const ctx = {}
    await chain.run(ctx)
    expect(ctx.cancelled).toBe(true)
    expect(ctx.value).toBeUndefined()
  })

  it('can redirect', async () => {
    const chain = new MiddlewareChain()
    chain.use((ctx, next) => { ctx.redirect = '/login' })
    const ctx = {}
    await chain.run(ctx)
    expect(ctx.redirect).toBe('/login')
  })

  it('throws when middleware is not a function', () => {
    const chain = new MiddlewareChain()
    expect(() => chain.use('not a function')).toThrow()
  })

  it('clear removes all middleware', () => {
    const chain = new MiddlewareChain()
    chain.use(() => {})
    expect(chain.length).toBe(1)
    chain.clear()
    expect(chain.length).toBe(0)
  })

  it('remove removes specific middleware', () => {
    const chain = new MiddlewareChain()
    const fn = () => {}
    chain.use(fn)
    chain.use(() => {})
    expect(chain.length).toBe(2)
    chain.remove(fn)
    expect(chain.length).toBe(1)
  })

  it('clone creates independent copy', () => {
    const chain = new MiddlewareChain()
    chain.use(() => {})
    const clone = chain.clone()
    expect(clone.length).toBe(1)
    chain.clear()
    expect(clone.length).toBe(1)
  })

  it('handles middleware errors gracefully', async () => {
    const chain = new MiddlewareChain()
    chain.use(() => { throw new Error('fail') })
    await expect(chain.run({})).rejects.toThrow('fail')
  })
})
