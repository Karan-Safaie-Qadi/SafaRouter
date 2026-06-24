export default function headerComponent({ path }) {
  const links = [
    { href: '/test-app/', label: 'Home' },
    { href: '/test-app/about', label: 'About' },
    { href: '/test-app/docs', label: 'Docs' },
    { href: '/test-app/blog', label: 'Blog' },
    { href: '/test-app/sandbox', label: 'Sandbox' },
    { href: '/test-app/sitemap', label: 'Sitemap' },
  ]
  return `<header style="border-bottom:1px solid var(--color-border);padding:0.75rem 1.5rem;margin-bottom:1.5rem;">
  <nav style="display:flex;gap:1rem;max-width:900px;margin:0 auto;align-items:center;">
    <a href="/test-app/" data-safa-link style="font-weight:700;margin-right:auto;">SafaRouter</a>
    ${links.map(l => `<a href="${l.href}" data-safa-link style="${path === l.href ? 'color:var(--color-accent);font-weight:600;' : ''}">${l.label}</a>`).join('')}
    <span id="maintenance-status" style="font-size:0.75rem;padding:0.25rem 0.5rem;border-radius:4px;background:var(--color-bg);border:1px solid var(--color-border);"></span>
  </nav>
</header>`
}
