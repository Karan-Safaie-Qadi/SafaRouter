export default function sitemapPage({ router }) {
  const allRoutes = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About SafaRouter' },
    { path: '/docs', name: 'Documentation' },
    { path: '/blog', name: 'Blog Index' },
    { path: '/blog/hello-world', name: 'Blog: Hello World' },
    { path: '/blog/routing-deep-dive', name: 'Blog: Routing Deep Dive' },
    { path: '/blog/middleware-guide', name: 'Blog: Middleware Guide' },
    { path: '/blog/app-router-patterns', name: 'Blog: App Router Patterns' },
    { path: '/contact', name: 'Contact' },
    { path: '/profile/me', name: 'Profile' },
    { path: '/sandbox', name: 'Sandbox' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/dashboard/settings', name: 'Settings' },
    { path: '/nonexistent', name: '404 Test' },
    { path: '/slow', name: 'Slow Page (Loading Demo)' },
    { path: '/errors', name: 'Error Demo (v1.3.0)' },
    { path: '/access', name: 'Access Control (v1.3.0)' },
    { path: '/loader', name: 'Data Loader (v1.3.0)' },
    { path: '/guard', name: 'Route Guard (v1.3.0)' },
    { path: '/login', name: 'Login (v1.3.0)' },
    { path: '/transition', name: 'Transitions (v1.3.0)' },
  ]

  const list = allRoutes
    .map(
      r => `<li><a href="${r.path}" data-safa-link>${r.name}</a> <code style="font-size:0.8rem">${r.path}</code></li>`
    )
    .join('')

  return `
    <div class="page-enter">
      <h1>Sitemap</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1rem;">
        All available routes in this demo.
      </p>
      <ul style="columns: 2 240px; column-gap: 2rem; padding-left: 1.25rem; line-height: 2;">
        ${list}
      </ul>
    </div>
  `
}
