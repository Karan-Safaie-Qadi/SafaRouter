import { normalizePath, isRouteGroup } from './utils.js'

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
    this.loader = null
    this.guard = null
    this.slots = null
    this.intercept = null
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
    if (this.layout) chain.push(this.layout)
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
      if (/^\[[^[\].]+\]$/.test(c.segment)) return c
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

  static create(routes) {
    return new RouteTree(routes)
  }

  _build(parent, routes, base) {
    if (!routes || typeof routes !== 'object') return

    for (const [key, val] of Object.entries(routes)) {
      const isGroup = isRouteGroup(key)
      const isRoot = key === '/' || key === ''

      if (isRoot) {
        if (typeof val === 'object' && val !== null) {
          if (val.meta) parent.meta = val.meta
          if (val.layout) parent.layout = val.layout
          if (val.page) parent.page = val.page
          if (val.loading) parent.loading = val.loading
          if (val.error) parent.error = val.error
          if (val.notFound) parent.notFound = val.notFound
          if (val.loader) parent.loader = val.loader
          if (val.guard) parent.guard = val.guard
          if (val.slots) parent.slots = val.slots
          if (val.intercept) parent.intercept = val.intercept
          if (val.children) this._build(parent, val.children, base)
        } else if (typeof val === 'function') {
          parent.page = val
        }
        continue
      }

      const segs = (isGroup ? key : key.replace(/^\//, '')).split('/')
      let cursor = parent
      let currentBase = base

      for (let si = 0; si < segs.length; si++) {
        const seg = segs[si]
        const isLast = si === segs.length - 1
        const childBase = isGroup ? currentBase : normalizePath(`${currentBase}/${seg}`)

        let child = cursor._findChild(seg)
        if (!child) {
          child = new RouteNode({ segment: seg, fullPath: childBase })
          cursor.addChild(child)
        }

        if (isLast) {
          if (typeof val === 'object' && val !== null) {
            if (val.meta) child.meta = val.meta
            if (val.layout) child.layout = val.layout
            if (val.page) child.page = val.page
            if (val.loading) child.loading = val.loading
            if (val.error) child.error = val.error
            if (val.notFound) child.notFound = val.notFound
            if (val.loader) child.loader = val.loader
            if (val.guard) child.guard = val.guard
            if (val.slots) child.slots = val.slots
            if (val.intercept) child.intercept = val.intercept
            if (val.children) this._build(child, val.children, childBase)
          } else if (typeof val === 'function') {
            child.page = val
          }
        }

        cursor = child
        currentBase = childBase
      }
    }
  }

  resolve(pathname) {
    const segs = normalizePath(pathname).split('/').filter(Boolean)
    return this._resolve(this.root, segs, 0, {})
  }

  _resolve(node, segs, idx, params) {
    if (idx >= segs.length) {
      if (node.page || node.slots) {
        return { node, params, layouts: node.getLayoutChain(), slots: node.slots || null, intercept: node.intercept || null }
      }
      const ca = node._findCatchAll()
      if (ca && ca.page) {
        const name = ca.segment.replace(/^\[+\.\.\.|\]\]?$/g, '')
        return { node: ca, params: { ...params, [name]: [] }, layouts: ca.getLayoutChain(), slots: null, intercept: null }
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
      const name = ca.segment.replace(/^\[+\.\.\.|\]\]?$/g, '')
      return {
        node: ca,
        params: { ...params, [name]: segs.slice(idx) },
        layouts: ca.getLayoutChain(),
        slots: null,
        intercept: null,
      }
    }

    return null
  }

  flatten() {
    const result = []
    const walk = (node) => {
      if (node.page) {
        result.push({ path: node.fullPath, page: node.page, meta: node.meta, slots: node.slots })
      }
      for (const child of node.children) walk(child)
    }
    walk(this.root)
    return result
  }

  find(pathname) {
    return this.resolve(pathname)
  }

  getRoute(pathname) {
    return this.resolve(pathname)
  }
}
