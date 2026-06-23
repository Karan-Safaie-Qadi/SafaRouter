import { RouteTree } from './RouteTree.js'
import { RouteMatcher } from './RouteMatcher.js'
import { normalizePath, parseQuery } from './utils.js'

export function matchRoute(path, routes = {}) {
  const tree = new RouteTree(routes)
  const normalized = normalizePath(path)
  const [pathname, search] = normalized.split('?')
  const match = tree.resolve(pathname)
  if (!match) return null
  return {
    path: pathname,
    params: match.params,
    query: parseQuery(search ? `?${search}` : ''),
    node: match.node,
    layouts: match.layouts,
  }
}

export function matchPattern(path, patterns = []) {
  const matcher = RouteMatcher.create(patterns)
  return matcher.match(normalizePath(path))
}

export function renderRoute(path, routes = {}, context = {}) {
  const match = matchRoute(path, routes)
  if (!match) return null

  async function renderComponent(mod) {
    if (!mod) return ''
    if (typeof mod === 'function') {
      const result = mod({ params: match.params, router: context.router })
      if (result && typeof result.then === 'function') return result
      return result
    }
    return String(mod)
  }

  async function renderWithLayouts(pageContent, layoutFns, idx) {
    if (idx >= layoutFns.length) {
      return renderComponent(pageContent)
    }
    const content = await renderWithLayouts(pageContent, layoutFns, idx + 1)
    const layoutFn = layoutFns[idx]
    if (typeof layoutFn === 'function') {
      return layoutFn({ children: content, params: match.params, router: context.router })
    }
    return String(layoutFn).replace(/\{\s*children\s*\}/gi, content)
  }

  return renderWithLayouts(match.node.page, match.layouts, 0)
}

export function routeExists(path, routes = {}) {
  return matchRoute(path, routes) !== null
}

export function listRoutes(routes = {}) {
  const tree = new RouteTree(routes)
  return tree.flatten()
}
