import { describe, it, expect } from 'vitest'
import { safaRouter } from '../src/vite-plugin.js'

describe('safaRouter Vite plugin', () => {
  it('returns a Vite plugin object with name and transform', () => {
    const plugin = safaRouter()
    expect(plugin.name).toBe('safa-router')
    expect(typeof plugin.transform).toBe('function')
  })

  it('injects access feature import when access config detected', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', access: { blocked: ['/admin'] } })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/access'")
  })

  it('injects realtime feature import when realtime config detected', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', realtime: { enabled: true } })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/realtime'")
  })

  it('injects maintenance feature when maintenanceMode detected', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', maintenanceMode: { enabled: true } })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/maintenance'")
  })

  it('injects components feature when components has keys', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', components: { header: myHeader } })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/components'")
  })

  it('does not inject components for empty components config', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', components: {} })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeUndefined()
  })

  it('injects errors feature when errorLogging detected', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', errorLogging: { enabled: true } })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/errors'")
  })

  it('returns undefined for non-SafaRouter code', () => {
    const plugin = safaRouter()
    const result = plugin.transform('const router = new VueRouter({})', 'test.js')
    expect(result).toBeUndefined()
  })

  it('detects feature usage from method calls', () => {
    const plugin = safaRouter()
    const code = 'router.blockRoute("/admin")'
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/access'")
  })

  it('detects transitions from transitionExitClass', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', transitionExitClass: 'slide-out' })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/transitions'")
  })

  it('injects scroll feature when scrollRestoration is in config', () => {
    const plugin = safaRouter()
    const code = `new SafaRouter({ target: '#app', scrollRestoration: true })`
    const result = plugin.transform(code, 'test.js')
    expect(result).toBeDefined()
    expect(result.code).toContain("import 'safa-router/features/scroll'")
  })

  it('returns undefined when no SafaRouter config or method calls', () => {
    const plugin = safaRouter()
    const result = plugin.transform('const x = 1', 'test.js')
    expect(result).toBeUndefined()
  })
})
