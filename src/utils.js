export function normalizePath(path) {
  if (!path || path === '/') return '/'
  const p = path.replace(/\/+/g, '/').replace(/\/$/, '')
  return p || '/'
}

export function shallowEqual(a, b) {
  if (a === b) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return a === b
  const ka = Object.keys(a), kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) if (a[k] !== b[k]) return false
  return true
}

export function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function parseQuery(search) {
  if (!search || search === '?') return {}
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params) {
    if (key in result) {
      result[key] = [].concat(result[key], value)
    } else {
      result[key] = value
    }
  }
  return result
}

export function buildQuery(params) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return ''
  const parts = []
  for (const key of Object.keys(params)) {
    const val = params[key]
    if (Array.isArray(val)) {
      for (const v of val) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
      }
    } else if (val !== undefined && val !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    }
  }
  return parts.length ? '?' + parts.join('&') : ''
}

export function joinPaths(...parts) {
  return normalizePath(parts.filter(Boolean).join('/'))
}

export function isDynamicSegment(segment) {
  return /^\[/.test(segment) && /\]$/.test(segment)
}

export function isCatchAllSegment(segment) {
  return /^\[\.\.\./.test(segment)
}

export function isOptionalCatchAll(segment) {
  return /^\[\[\.\.\./.test(segment)
}

export function isRouteGroupSegment(segment) {
  return /^\(/.test(segment) && /\)$/.test(segment)
}

export const isRouteGroup = isRouteGroupSegment

export function extractParamName(segment) {
  const m = segment.match(/^\[\[?(?:\.\.\.)?([^\]]+)\]\]?$/)
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
  let active = true

  const onRouteChange = () => {
    if (!active) return
    state = {
      pathname: router.pathname,
      params: router.params,
      query: router.query,
      loading: router.loading,
    }
    for (const fn of subscribers) {
      try { fn(state) } catch {}
    }
  }

  const routeUnsub = router.on('routechange', onRouteChange)
  const destroyUnsub = router.on('destroy', () => {
    active = false
    subscribers.clear()
    routeUnsub()
  })

  return {
    get state() { return state },
    subscribe(fn) {
      if (!active) return () => {}
      subscribers.add(fn)
      fn(state)
      return () => { subscribers.delete(fn) }
    },
    push: router.push.bind(router),
    replace: router.replace.bind(router),
    back: router.back.bind(router),
    forward: router.forward.bind(router),
    navigate: router.navigate.bind(router),
    unsubscribe() {
      active = false
      subscribers.clear()
      routeUnsub()
      destroyUnsub()
    },
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
  if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('fax:')) return true
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

export function deepMerge(target, ...sources) {
  const result = Array.isArray(target) ? [...target] : { ...target }
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue
    for (const key of Object.keys(src)) {
      if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
        result[key] = deepMerge(result[key] || {}, src[key])
      } else {
        result[key] = src[key]
      }
    }
  }
  return result
}
