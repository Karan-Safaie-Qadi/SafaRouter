export default function errorsDemoPage({ router }) {
  return `
    <div class="page-enter">
      <h1>Error Manager Demo</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Test the <strong>ErrorManager</strong> — handles all HTTP status codes (400–511)
        with custom error pages, per-status control, and error logging.
      </p>

      <div class="card">
        <h2>Trigger HTTP Errors</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          These buttons navigate to simulated error routes.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" data-error="400">400 Bad Request</button>
          <button class="sandbox-btn" data-error="403">403 Forbidden</button>
          <button class="sandbox-btn" data-error="404">404 Not Found</button>
          <button class="sandbox-btn" data-error="418">418 I'm a Teapot</button>
          <button class="sandbox-btn" data-error="500">500 Server Error</button>
          <button class="sandbox-btn" data-error="503">503 Maintenance</button>
        </div>
      </div>

      <div class="card">
        <h2>Custom Error Pages</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Custom HTML error pages are loaded from <code>html-pages/errors/{code}.html</code>.
          The ErrorManager also supports group-level fallbacks (<code>4xx.html</code>, <code>5xx.html</code>).
        </p>
        <pre>errors/
  403.html   ← custom Forbidden page
  404.html   ← custom Not Found page
  418.html   ← custom Teapot page
  500.html   ← custom Server Error page
  503.html   ← custom Maintenance page</pre>
      </div>

      <div class="card">
        <h2>Error Log</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          All errors are logged via the ErrorManager. Check the browser console or the log below.
        </p>
        <div id="error-log" style="background: var(--color-bg); border-radius: 4px; padding: 0.75rem; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.8rem;">
          <em style="color: var(--color-text-muted);">No errors logged yet. Trigger one above.</em>
        </div>
      </div>
    </div>
  `
}
