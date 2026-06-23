export default function notFoundPage({ path, router }) {
  return `
    <div class="safa-error safa-404 page-enter">
      <h1>404</h1>
      <h2 style="margin-bottom: 0.5rem;">Page Not Found</h2>
      <p style="margin-bottom: 1.5rem; color: var(--color-text-muted);">
        We couldn't find a page at <strong><code>${path}</code></strong>.
      </p>
      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <a href="/" data-safa-link class="sandbox-btn">&larr; Home</a>
        <a href="/sitemap" data-safa-link class="sandbox-btn">Sitemap</a>
      </div>
    </div>
  `
}
