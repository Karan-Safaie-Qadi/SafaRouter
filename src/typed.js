import { SafaRouter } from './SafaRouter.js'

export { SafaRouter }

export function defineRoute(config) {
  return config
}

export function defineRoutes(routes) {
  return routes
}

export function createRouter(routes, options = {}) {
  return new SafaRouter({ ...options, routes })
}
