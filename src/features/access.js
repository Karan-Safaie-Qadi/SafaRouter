import { AccessController } from '../AccessController.js'
import { EVENTS } from '../constants.js'
import { emit } from '../utils.js'

export const name = 'access'

export function init(router, config) {
  const controller = new AccessController(config)
  router._accessController = controller

  router.blockRoute = (pattern) => { controller.block(pattern); return router }
  router.unblockRoute = (pattern) => { controller.unblock(pattern); return router }
  router.ignoreRoute = (pattern) => { controller.ignore(pattern); return router }
  router.unignoreRoute = (pattern) => { controller.unignore(pattern); return router }

  router._hooks.beforeNavigate.push(async ({ path, method }) => {
    const blocked = controller.isBlocked(path)
    if (blocked) {
      emit(router._events, EVENTS.ACCESS_DENIED, { path, reason: blocked.message, method })
      router._render(controller._fallback403(), router._layoutFns || [])
      return false
    }
    if (controller.isIgnored(path)) return false
  })
}

export function destroy(router) {
  delete router._accessController
  delete router.blockRoute
  delete router.unblockRoute
  delete router.ignoreRoute
  delete router.unignoreRoute
}
