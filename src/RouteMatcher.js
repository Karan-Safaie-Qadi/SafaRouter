import { normalizePath } from './utils.js'
import { PARAM_PATTERNS, SEGMENT_TYPES, PATTERN_SCORES } from './constants.js'

class RoutePattern {
  constructor(pattern) {
    this.raw = pattern
    this.path = normalizePath(pattern)
    this.segments = this.path === '/' ? [] : this.path.split('/').filter(Boolean)
    this.paramNames = []
    this._validate()
    this._compile()
  }

  _validate() {
    const names = new Set()
    for (const seg of this.segments) {
      const m = seg.match(/^\[(?:\.\.\.)?([^\]]+)\]$/)
      if (m) {
        if (names.has(m[1])) {
          throw new Error(`Duplicate param name "${m[1]}" in pattern "${this.raw}"`)
        }
        names.add(m[1])
      }
    }
  }

  _compile() {
    let regexStr = '^'

    for (const seg of this.segments) {
      if (PARAM_PATTERNS.OPTIONAL_CATCH_ALL.test(seg)) {
        const name = seg.match(PARAM_PATTERNS.OPTIONAL_CATCH_ALL)[1]
        this.paramNames.push(name)
        regexStr += '(?:/(.*))?'
      } else if (PARAM_PATTERNS.CATCH_ALL.test(seg)) {
        const name = seg.match(PARAM_PATTERNS.CATCH_ALL)[1]
        this.paramNames.push(name)
        regexStr += '/(.+)'
      } else if (PARAM_PATTERNS.DYNAMIC.test(seg)) {
        const name = seg.match(PARAM_PATTERNS.DYNAMIC)[1]
        this.paramNames.push(name)
        regexStr += '/([^/]+)'
      } else if (PARAM_PATTERNS.GROUP.test(seg)) {
        continue
      } else {
        regexStr += `/${seg}`
      }
    }

    regexStr += '/?$'
    this.regex = new RegExp(regexStr)
  }

  get score() {
    let s = 0
    for (const seg of this.segments) {
      if (PARAM_PATTERNS.OPTIONAL_CATCH_ALL.test(seg)) {
        s += PATTERN_SCORES[SEGMENT_TYPES.OPTIONAL_CATCH_ALL]
      } else if (PARAM_PATTERNS.CATCH_ALL.test(seg)) {
        s += PATTERN_SCORES[SEGMENT_TYPES.CATCH_ALL]
      } else if (PARAM_PATTERNS.DYNAMIC.test(seg)) {
        s += PATTERN_SCORES[SEGMENT_TYPES.DYNAMIC]
      } else if (PARAM_PATTERNS.GROUP.test(seg)) {
        continue
      } else {
        s += PATTERN_SCORES[SEGMENT_TYPES.STATIC]
      }
    }
    return s
  }

  match(url) {
    const p = normalizePath(url)
    const m = p.match(this.regex)
    if (!m) return null

    const params = {}
    let idx = 0
    for (const name of this.paramNames) {
      const val = m[++idx]
      if (val !== undefined) {
        params[name] = val.includes('/') ? val.split('/') : val
      }
    }
    return params
  }

  stringify(params = {}) {
    let path = this.raw
    for (const [key, val] of Object.entries(params)) {
      const v = Array.isArray(val) ? val.join('/') : String(val)
      path = path.replace(`[[...${key}]]`, v)
      path = path.replace(`[...${key}]`, v)
      path = path.replace(`[${key}]`, v)
    }
    return normalizePath(path)
  }
}

export class RouteMatcher {
  constructor() {
    this._patterns = []
  }

  add(pattern) {
    const rp = new RoutePattern(pattern)
    this._patterns.push(rp)
    this._patterns.sort((a, b) => b.score - a.score)
    return this
  }

  addMultiple(patterns) {
    for (const p of patterns) this.add(p)
    return this
  }

  match(url) {
    for (const p of this._patterns) {
      const params = p.match(url)
      if (params !== null) {
        return { pattern: p.raw, path: p.path, params }
      }
    }
    return null
  }

  build(pattern, params) {
    return new RoutePattern(pattern).stringify(params)
  }

  clear() {
    this._patterns = []
    return this
  }

  get patterns() {
    return this._patterns.map(p => p.raw)
  }
}
