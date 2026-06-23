export default function rootLayout({ children, router }) {
  const current = router.pathname
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/sandbox', label: 'Sandbox' },
    { href: '/sitemap', label: 'Sitemap' },
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
    navEl.innerHTML = `<span class="brand">SafaRouter</span><div class="nav-loader"></div>${navItems}`
    navEl.querySelectorAll('[data-safa-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        router.push(el.getAttribute('href'))
      })
    })
    router.on('loading', ({ loading }) => {
      navEl.classList.toggle('is-loading', loading)
    })
  }

  return `<div class="page-enter">${children}</div>`
}
