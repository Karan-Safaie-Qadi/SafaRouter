export default function sandboxPage({ router }) {
  return `
    <div class="page-enter">
      <h1>Router Sandbox</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Test SafaRouter features interactively.
      </p>

      <div class="card">
        <h2>Current State</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 0.25rem 0; font-weight: 600;">Pathname</td><td><code>${router.pathname}</code></td></tr>
          <tr><td style="padding: 0.25rem 0; font-weight: 600;">Params</td><td><code>${JSON.stringify(router.params)}</code></td></tr>
          <tr><td style="padding: 0.25rem 0; font-weight: 600;">Query</td><td><code>${JSON.stringify(router.query)}</code></td></tr>
          <tr><td style="padding: 0.25rem 0; font-weight: 600;">Loading</td><td><code>${router.loading}</code></td></tr>
        </table>
      </div>

      <div class="card">
        <h2>Navigation Tests</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" data-sandbox="/sandbox?test=1">/sandbox?test=1</button>
          <button class="sandbox-btn" data-sandbox="/sandbox?test=2&lang=en">/sandbox?test=2&lang=en</button>
          <button class="sandbox-btn" data-sandbox="/sandbox/deep">/sandbox/deep (404)</button>
          <button class="sandbox-btn" data-sandbox="/">/ (Home)</button>
        </div>
      </div>

      <div class="card">
        <h2>Programmatic API</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn api-back">&larr; back()</button>
          <button class="sandbox-btn api-forward">forward() &rarr;</button>
          <button class="sandbox-btn api-reload">reload()</button>
        </div>
      </div>
    </div>
  `
}

export function afterRender(router) {
  document.querySelectorAll('.sandbox-btn[data-sandbox]').forEach(el => {
    el.addEventListener('click', () => router.push(el.dataset.sandbox))
  })
  document.querySelector('.api-back')?.addEventListener('click', () => router.back())
  document.querySelector('.api-forward')?.addEventListener('click', () => router.forward())
  document.querySelector('.api-reload')?.addEventListener('click', () => router.reload())
}
