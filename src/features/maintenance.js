import { EVENTS } from '../constants.js'
import { emit } from '../utils.js'

export const name = 'maintenance'

export function init(router, config) {
  const isEnabled = config.maintenanceMode?.enabled || false
  router._maintenanceMode = isEnabled

  router.isMaintenance = () => router._maintenanceMode

  router.setMaintenance = (enabled, opts = {}) => {
    router._maintenanceMode = enabled
    if (enabled) {
      if (opts.page) router.config.maintenanceMode = { ...router.config.maintenanceMode, page: opts.page }
      if (opts.component) router.config.maintenanceMode = { ...router.config.maintenanceMode, component: opts.component }
      if (opts.allowedPaths) router.config.maintenanceMode = { ...router.config.maintenanceMode, allowedPaths: opts.allowedPaths }
    }
  }

  router._hooks.beforeNavigate.push(async ({ path }) => {
    if (!router._maintenanceMode) return
    const allowed = router.config.maintenanceMode?.allowedPaths || []
    if (allowed.some(p => path.startsWith(p))) return
    emit(router._events, EVENTS.MAINTENANCE, { path, method: 'push' })
    const page = router.config.maintenanceMode?.page
    const Component = router.config.maintenanceMode?.component
    if (Component && typeof Component === 'function') {
      router._render(Component({ path, router }))
    } else if (page) {
      const html = await router._fetchPage(page)
      router._render(html || '')
    } else {
      router._render('<h1>503</h1><p>Site is under maintenance</p>')
    }
    return false
  })
}

export function destroy(router) {
  delete router._maintenanceMode
  delete router.isMaintenance
  delete router.setMaintenance
}
