import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SafaDevServer } from '../src/DevServer.js'

describe('SafaDevServer', () => {
  let server

  beforeEach(() => {
    server = new SafaDevServer({ root: 'test-app', watch: false })
  })

  describe('constructor', () => {
    it('sets defaults', () => {
      const s = new SafaDevServer()
      expect(s.port).toBe(3000)
      expect(s.root).toBe('.')
      expect(s.watch).toBe(true)
    })

    it('accepts custom config', () => {
      const s = new SafaDevServer({ port: 5000, root: 'app', basePath: '/app' })
      expect(s.port).toBe(5000)
      expect(s.root).toBe('app')
      expect(s.basePath).toBe('/app')
    })
  })

  describe('start/stop', () => {
    it('start returns this for chaining', () => {
      const s = new SafaDevServer({ watch: false })
      const ret = s.start()
      expect(ret).toBe(s)
      s.stop()
    })

    it('start is idempotent', () => {
      const s = new SafaDevServer({ watch: false })
      const instances = new Set()
      instances.add(s._server)
      s.start()
      instances.add(s._server)
      s.start()
      instances.add(s._server)
      expect(instances.size).toBe(2)
      s.stop()
    })

    it('stop returns this for chaining', () => {
      const s = new SafaDevServer({ watch: false })
      s.start()
      const ret = s.stop()
      expect(ret).toBe(s)
    })
  })
})
