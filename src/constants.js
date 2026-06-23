export const EVENTS = {
  BEFORE_NAVIGATE: 'beforenavigate',
  NAVIGATE: 'navigate',
  ROUTE_CHANGE: 'routechange',
  AFTER_NAVIGATE: 'afternavigate',
  ERROR: 'error',
  NOT_FOUND: 'notfound',
  LOADING: 'loading',
  READY: 'ready',
  DESTROY: 'destroy',
  LINK_CLICK: 'linkclick',
}

export const SEGMENT_TYPES = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
  CATCH_ALL: 'catch-all',
  OPTIONAL_CATCH_ALL: 'optional-catch-all',
  GROUP: 'group',
}

export const PARAM_PATTERNS = {
  DYNAMIC: /^\[([^\[]+)\]$/,
  CATCH_ALL: /^\[\.\.\.([^\[]+)\]$/,
  OPTIONAL_CATCH_ALL: /^\[\[\.\.\.[^\[]+\]\]$/,
  GROUP: /^\((.+)\)$/,
}

export const PATTERN_SCORES = {
  [SEGMENT_TYPES.STATIC]: 100,
  [SEGMENT_TYPES.DYNAMIC]: 10,
  [SEGMENT_TYPES.CATCH_ALL]: 1,
  [SEGMENT_TYPES.OPTIONAL_CATCH_ALL]: 0,
  [SEGMENT_TYPES.GROUP]: 0,
}

export const DEFAULT_CONFIG = {
  target: '#app',
  basePath: '',
  useHash: false,
  scrollToTop: true,
  prefetch: true,
  cacheRoutes: true,
  titleTemplate: '%s — SafaRouter',
  transitionDuration: 0,
}
