import { TransitionsManager } from '../TransitionsManager.js'

export const name = 'transitions'

export function init(router, config) {
  const tm = new TransitionsManager({
    transitionDuration: config.transitionDuration,
    transitionEnterClass: config.transitionEnterClass,
    transitionExitClass: config.transitionExitClass,
    transitionEnterActiveClass: config.transitionEnterActiveClass,
    transitionExitActiveClass: config.transitionExitActiveClass,
  })
  router._transitions = tm
}

export function destroy(router) {
  delete router._transitions
}
