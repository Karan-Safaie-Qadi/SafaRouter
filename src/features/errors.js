import { ErrorManager } from '../ErrorManager.js'

export const name = 'errors'

export function init(router, config) {
  const manager = new ErrorManager(config)
  router._errorManager = manager
  Object.defineProperty(router, 'errorManager', { get: () => manager })
}

export function destroy(router) {
  delete router._errorManager
}
