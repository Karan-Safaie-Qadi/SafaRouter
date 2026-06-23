import { AccessDeniedError } from './errors.js'
import { normalizePath } from './utils.js'

export class AccessController {
  constructor(config = {}) {
    this._blocked = []
    this._ignored = []
    this._patterns = []
    const access = config.access || {}
    this._blocked = this._normalizePatterns(access.blocked || [])
    this._ignored = this._normalizePatterns(access.ignored || [])
  }

  block(pattern) {
    const p = this._normalizePattern(pattern)
    if (!this._blocked.some(x => x.pattern === pattern)) {
      this._blocked.push(p)
    }
  }

  unblock(pattern) {
    this._blocked = this._blocked.filter(x => x.pattern !== pattern)
  }

  ignore(pattern) {
    const p = this._normalizePattern(pattern)
    if (!this._ignored.some(x => x.pattern === pattern)) {
      this._ignored.push(p)
    }
  }

  unignore(pattern) {
    this._ignored = this._ignored.filter(x => x.pattern !== pattern)
  }

  isBlocked(path) {
    const npath = normalizePath(path)
    if (this._matchPatterns(this._blocked, npath)) {
      return new AccessDeniedError(npath)
    }
    return null
  }

  isIgnored(path) {
    const npath = normalizePath(path)
    return this._matchPatterns(this._ignored, npath)
  }

  isAccessible(path) {
    const npath = normalizePath(path)
    return !this._matchPatterns(this._ignored, npath) && !this._matchPatterns(this._blocked, npath)
  }

  _normalizePatterns(patterns) {
    return (patterns || []).map(p => this._normalizePattern(p))
  }

  _normalizePattern(pattern) {
    const str = String(pattern)
    if (str.endsWith('/')) {
      return { pattern: str.slice(0, -1), exact: false, wildcard: false, doubleWildcard: false, endsWithSlash: true }
    }
    if (str.endsWith('**')) {
      return { pattern: str.slice(0, -2), exact: false, wildcard: false, doubleWildcard: true, endsWithSlash: true }
    }
    if (str.endsWith('*')) {
      return { pattern: str.slice(0, -1), exact: false, wildcard: true, doubleWildcard: false, endsWithSlash: false }
    }
    return { pattern: str, exact: true, wildcard: false, doubleWildcard: false, endsWithSlash: false }
  }

  _matchPatterns(patterns, npath) {
    for (const p of patterns) {
      if (p.exact && p.pattern === npath) return true
      if (p.exact && p.endsWithSlash && (p.pattern === npath || p.pattern + '/' === npath)) return true
      if (p.wildcard && npath.startsWith(p.pattern)) {
        const rest = npath.slice(p.pattern.length)
        if (rest === '' || !rest.includes('/')) return true
      }
      if (p.doubleWildcard) {
        const base = p.pattern.endsWith('/') ? p.pattern.slice(0, -1) : p.pattern
        if (npath === base || npath.startsWith(p.pattern) || npath.startsWith(base + '/')) return true
      }
      if (p.endsWithSlash && !p.exact && !p.wildcard && !p.doubleWildcard) {
        if (p.pattern === npath || p.pattern + '/' === npath) return true
      }
    }
    return false
  }
}
