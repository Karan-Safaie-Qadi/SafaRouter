export function bindLinks(router) {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-safa-link]')
    if (!link) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (e.button !== 0) return
    const href = link.getAttribute('href')
    if (!href) return
    e.preventDefault()
    router.push(href)
  })
}

export function prefetchOnHover(router) {
  let timer
  document.addEventListener('mouseenter', (e) => {
    const link = e.target.closest('[data-safa-link]')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href) return
    clearTimeout(timer)
    timer = setTimeout(() => router.prefetch(href), 100)
  }, true)
}
