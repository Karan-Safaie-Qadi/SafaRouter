import { normalizePath, isRouteGroup, isDynamicSegment } from './utils.js'

class RouteNode {
  constructor({ segment, fullPath, meta } = {}) {
    this.segment = segment || ''
    this.fullPath = fullPath || ''
    this.meta = meta || null
    this.page = null
    this.layout = null
    this.loading = null
    this.error = null
    this.notFound = null
    this.children = []
    this.parent = null
    this.isGroup = isRouteGroup(segment)
  }

  addChild(node) {
    node.parent = this
    this.children.push(node)
  }

  getLayoutChain() {
    const chain = []
    let cur = this.parent
    while (cur) {
      if (cur.layout) chain.unshift(cur.layout)
      cur = cur.parent
    }
    return chain
  }

  _findChild(segment) {
    for (const c of this.children) {
      if (c.isGroup) {
        const nested = c._findChild(segment)
        if (nested) return nested
      }
      if (c.segment === segment) return c
    }
    return null
  }

  _findDynamic(segment) {
    for (const c of this.children) {
      if (c.isGroup) {
        const nested = c._findDynamic(segment)
        if (nested) return nested
      }
      if (c.segment.startsWith('[') && c.segment.endsWith(']')) return c
    }
    return null
  }

  _findCatchAll() {
    for (const c of this.children) {
      if (c.isGroup) {
        const nested = c._findCatchAll()
        if (nested) return nested
      }
      if (c.segment.startsWith('[...') || c.segment.startsWith('[[...')) return c
    }
    return null
  }
}

export class RouteTree {
  constructor(routes) {
    this.root = new RouteNode({ fullPath: '/' })
    this._build(this.root, routes, '/')
  }

  _build(parent, routes, base) {
    if (!routes || typeof routes !== 'object') return

    for (const [key, val] of Object.entries(routes)) {
      const isGroup = isRouteGroup(key)
      const fp = isGroup ? normalizePath(base) : normalizePath(`${base}/${key}`)
      const node = new RouteNode({ segment: key, fullPath: fp })

      if (typeof val === 'object' && val !== null) {
        if (val.meta) node.meta = val.meta
        if (val.layout) node.layout = val.layout
        if (val.page) node.page = val.page
        if (val.loading) node.loading = val.loading
        if (val.error) node.error = val.error
        if (val.notFound) node.notFound = val.notFound
        this._build(node, val.children || val, fp)
      } else if (typeof val === 'function') {
        node.page = val
      }

      parent.addChild(node)
    }
  }

  resolve(pathname) {
    const segs = normalizePath(pathname).split('/').filter(Boolean)
    return this._resolve(this.root, segs, 0, {})
  }

  _resolve(node, segs, idx, params) {
    if (idx >= segs.length) {
      if (node.page) {
        return { node, params, layouts: node.getLayoutChain() }
      }
      const ca = node._findCatchAll()
      if (ca && ca.page) {
        return { node: ca, params: { ...params }, layouts: ca.getLayoutChain() }
      }
      return null
    }

    const seg = segs[idx]

    const exact = node._findChild(seg)
    if (exact) {
      const res = this._resolve(exact, segs, idx + 1, { ...params })
      if (res) return res
    }

    const dyn = node._findDynamic(seg)
    if (dyn) {
      const name = dyn.segment.replace(/^\[|\]$/g, '')
      const res = this._resolve(dyn, segs, idx + 1, {
        ...params,
        [name]: seg,
      })
      if (res) return res
    }

    const ca = node._findCatchAll()
    if (ca) {
      const name = ca.segment.replace(/^\[\.\.\.|\]\]?$/g, '')
      return {
        node: ca,
        params: { ...params, [name]: segs.slice(idx) },
        layouts: ca.getLayoutChain(),
      }
    }

    return null
  }

  flatten() {
    const result = []
    const walk = (node) => {
      if (node.page) {
        result.push({ path: node.fullPath, page: node.page, meta: node.meta })
      }
      for (const child of node.children) walk(child)
    }
    walk(this.root)
    return result
  }

  find(pathname) {
    return this.resolve(pathname)
  }
}
