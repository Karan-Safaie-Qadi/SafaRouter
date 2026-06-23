export default function contactPage({ query }) {
  return `
    <div class="page-enter">
      <h1>Contact</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        This page demonstrates query parameter handling.
      </p>

      <div class="card">
        <h2>Query Params</h2>
        <p>Current query: <code>${JSON.stringify(query)}</code></p>
        <p style="margin-top: 0.75rem; font-size: 0.875rem;">
          Try navigating to
          <a href="/contact?subject=hello&lang=en" data-safa-link>/contact?subject=hello&lang=en</a>
        </p>
      </div>

      <div class="card">
        <h2>Get in touch</h2>
        <p><em>This is a demo — no form functionality.</em></p>
      </div>
    </div>
  `
}
