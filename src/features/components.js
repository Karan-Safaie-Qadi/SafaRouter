export const name = 'components'

export function init(router, config) {
  router._components = config.components || {}

  router._renderComponents = function () {
    const ctx = { path: router._pathname, router, params: router._params, query: router._query }
    const routeMeta = router._routeData?.node?.meta || {}
    const hideComponents = routeMeta.hideComponents
    const hideAll = hideComponents === true
    const hideList = Array.isArray(hideComponents) ? hideComponents : []
    for (const [name, fn] of Object.entries(router._components)) {
      if (typeof fn !== 'function') continue
      if (hideAll || hideList.includes(name)) continue
      const html = router._resolveTemplate(fn(ctx))
      const target = document.querySelector(`[data-safa-component="${name}"]`)
      if (target) {
        target.innerHTML = html
        const links = target.querySelectorAll('[data-safa-link]')
        for (const el of links) {
          if (el.getAttribute('target') === '_blank') continue
          el.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            if (e.button !== 0) return
            e.preventDefault()
            const href = el.getAttribute('href')
            if (href) router.push(href)
          })
        }
      }
    }
  }

  router._hooks.afterNavigate.push(() => {
    router._renderComponents()
  })
}

export function destroy(router) {
  delete router._components
  delete router._renderComponents
}
