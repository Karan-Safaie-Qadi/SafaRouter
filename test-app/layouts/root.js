export default function rootLayout({ children, router }) {
  const current = router.pathname
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
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
    navEl.innerHTML = `<span class="brand">SafaRouter</span>${navItems}`
    navEl.querySelectorAll('[data-safa-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        router.push(el.getAttribute('href'))
      })
    })
  }

  return `<div class="page-enter">${children}</div>`
}
