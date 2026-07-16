import { HTTP_STATUS_TEXT, ERROR_GROUP_MAP, ERROR_GROUPS } from './constants.js'

export class SafaError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message)
    this.name = 'SafaError'
    this.code = code
  }

  toJSON() {
    return { name: this.name, message: this.message, code: this.code }
  }
}

export class RouteNotFoundError extends SafaError {
  constructor(pathname) {
    super(`No route matched: ${pathname}`, 'ROUTE_NOT_FOUND')
    this.name = 'RouteNotFoundError'
    this.pathname = pathname
  }
}

export class NavigationError extends SafaError {
  constructor(message, pathname) {
    super(message, 'NAVIGATION_ERROR')
    this.name = 'NavigationError'
    this.pathname = pathname
  }
}

export class RouteLoadError extends SafaError {
  constructor(pathname, original) {
    super(
      `Failed to load route "${pathname}": ${original.message}`,
      'ROUTE_LOAD_ERROR'
    )
    this.name = 'RouteLoadError'
    this.pathname = pathname
    this.original = original
  }
}

export class NavigationAbortError extends SafaError {
  constructor(reason = 'Navigation cancelled by middleware') {
    super(reason, 'NAVIGATION_ABORTED')
    this.name = 'NavigationAbortError'
  }
}

export class HttpError extends SafaError {
  constructor(statusCode, pathname, original) {
    const text = HTTP_STATUS_TEXT[statusCode] || 'Unknown Error'
    super(`${statusCode} ${text}: ${pathname}`, `HTTP_${statusCode}`)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.pathname = pathname
    this.original = original || null
    this.group = ERROR_GROUP_MAP[statusCode] || ERROR_GROUPS.CLIENT_ERROR
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      pathname: this.pathname,
      group: this.group,
    }
  }
}

export class AccessDeniedError extends SafaError {
  constructor(pathname, reason = 'Access denied') {
    super(reason, 'ACCESS_DENIED')
    this.name = 'AccessDeniedError'
    this.pathname = pathname
    this.statusCode = 403
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      pathname: this.pathname,
    }
  }
}

export class MaintenanceModeError extends SafaError {
  constructor(pathname, reason = 'Site is under maintenance') {
    super(reason, 'MAINTENANCE_MODE')
    this.name = 'MaintenanceModeError'
    this.pathname = pathname
    this.statusCode = 503
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      pathname: this.pathname,
    }
  }
}

export function createAbortError(message = 'Aborted') {
  try {
    return new DOMException(message, 'AbortError')
  } catch {
    const err = new Error(message)
    err.name = 'AbortError'
    return err
  }
}
