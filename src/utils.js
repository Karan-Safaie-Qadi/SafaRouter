export function normalizePath(path) {
  if (!path || path === '/') return '/'
  const p = path.replace(/\/+/g, '/').replace(/\/$/, '')
  return p || '/'
}

export function parseQuery(search) {
  if (!search || search === '?') return {}
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params) result[key] = value
  return result
}

export function joinPaths(...parts) {
  return normalizePath(parts.filter(Boolean).join('/'))
}

export function isDynamicSegment(segment) {
  return /^\[/.test(segment) && /\]$/.test(segment)
}

export function isRouteGroup(segment) {
  return /^\(/.test(segment) && /\)$/.test(segment)
}

export function extractParamName(segment) {
  const m = segment.match(/^\[(?:\.\.\.)?([^\]]+)\]$/)
  return m ? m[1] : null
}

export function emit(events, name, data) {
  if (!events[name]) return
  for (const fn of events[name]) {
    try {
      fn(data)
    } catch (e) {
      console.error(`[SafaRouter] Event handler error for "${name}":`, e)
    }
  }
}

export function useRouter(router) {
  let state = {
    pathname: router.pathname,
    params: router.params,
    query: router.query,
    loading: router.loading,
  }

  const subscribers = new Set()

  const unsubscribe = router.on('routechange', () => {
    state = {
      pathname: router.pathname,
      params: router.params,
      query: router.query,
      loading: router.loading,
    }
    for (const fn of subscribers) fn(state)
  })

  return {
    get state() { return state },
    subscribe(fn) {
      subscribers.add(fn)
      fn(state)
      return () => subscribers.delete(fn)
    },
    push: router.push.bind(router),
    replace: router.replace.bind(router),
    back: router.back.bind(router),
    forward: router.forward.bind(router),
    navigate: router.navigate.bind(router),
    unsubscribe,
  }
}

export function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function createURL(path, base = location.origin) {
  try {
    return new URL(path, base)
  } catch {
    return null
  }
}

export function isExternalURL(url) {
  if (!url) return false
  if (url.startsWith('//')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).origin !== location.origin
    } catch {
      return true
    }
  }
  return false
}

export function isSamePath(a, b) {
  return normalizePath(a) === normalizePath(b)
}
