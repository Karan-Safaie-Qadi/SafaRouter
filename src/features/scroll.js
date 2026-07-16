import { ScrollManager } from '../ScrollManager.js'

export const name = 'scroll'

export function init(router, config) {
  const sm = new ScrollManager()
  router._scrollManager = sm
  Object.defineProperty(router, 'scrollManager', { get: () => sm })

  router._hooks.afterNavigate.push(() => {
    sm.restore(router._pathname, router.config.scrollToTop)
  })
}

export function destroy(router) {
  if (router._scrollManager) router._scrollManager.clear()
  delete router._scrollManager
}
