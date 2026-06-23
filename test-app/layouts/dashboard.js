export default function dashboardLayout({ children, router }) {
  const current = router.pathname
  const sidebarLinks = [
    { href: '/dashboard', label: 'Overview', exact: true },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  const sidebarItems = sidebarLinks
    .map((link) => {
      const active = link.exact
        ? current === link.href
        : current.startsWith(link.href)
      return `<a href="${link.href}" class="${active ? 'active' : ''}" data-safa-sidebar>${link.label}</a>`
    })
    .join('')

  return `
    <div class="page-enter dashboard-layout">
      <aside class="dashboard-sidebar">
        <h3>Dashboard</h3>
        ${sidebarItems}
      </aside>
      <div class="dashboard-content">${children}</div>
    </div>
  `
}
