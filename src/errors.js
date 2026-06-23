export class SafaError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message)
    this.name = 'SafaError'
    this.code = code
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
