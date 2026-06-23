export default function rootLayout({ children, router }) {
  const current = router.pathname
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/sandbox', label: 'Sandbox' },
    { href: '/errors', label: 'Errors' },
    { href: '/access', label: 'Access' },
    { href: '/loader', label: 'Loader' },
    { href: '/guard', label: 'Guard' },
    { href: '/transition', label: 'FX' },
    { href: '/sitemap', label: 'Sitemap' },
    { href: '/slow', label: 'Slow Page' },
    { href: '/profile/me', label: 'Profile' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  const navItems = links
    .map(
      (link) =>
        `<a href="${link.href}" class="${current === link.href ? 'active' : ''}" data-safa-link>${link.label}</a>`
    )
    .join('')

  const navEl = document.getElementById('nav')
  if (navEl && !navEl.hasChildNodes()) {
    navEl.innerHTML = `<span class="brand" aria-label="SafaRouter home">SafaRouter <span class="version" style="font-size:0.65rem;opacity:0.6;">v1.3.0</span></span><div class="nav-loader" role="progressbar" aria-label="Loading"></div>${navItems}`
    navEl.querySelectorAll('[data-safa-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        const href = el.getAttribute('href')
        if (href) router.push(href)
      })
    })
    router.on('loading', ({ loading }) => {
      navEl.classList.toggle('is-loading', loading)
    })
    router.on('routechange', () => {
      navEl.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href')
        a.classList.toggle('active', href === router.pathname ||
          (href !== '/' && href && router.pathname.startsWith(href)))
      })
    })
  }

  const maintenanceBanner = router.isMaintenance()
    ? `<div style="background:var(--color-warning);color:#000;text-align:center;padding:0.5rem;font-size:0.875rem;font-weight:600;border-radius:var-radius;margin-bottom:1rem;">🔧 Maintenance Mode Active — 503 for all non-allowed routes</div>`
    : ''

  return `<div class="page-enter">${maintenanceBanner}${children}</div>`
}
