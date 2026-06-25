import { RealtimeManager } from '../RealtimeManager.js'

export const name = 'realtime'

export function init(router, config) {
  const rt = new RealtimeManager(router, config.realtime)
  router._realtime = rt

  const originalStart = router.start.bind(router)
  const originalDestroy = router.destroy.bind(router)

  router.start = async function (target) {
    const result = await originalStart(target)
    rt.start()
    return result
  }

  router.destroy = function () {
    rt.destroy()
    originalDestroy()
  }
}

export function destroy(router) {
  if (router._realtime) router._realtime.destroy()
  delete router._realtime
}
