export default function sandboxPage({ router, params, query }) {
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
          <tr><td style="padding: 0.25rem 0; font-weight: 600;">Params</td><td><code>${JSON.stringify(params)}</code></td></tr>
          <tr><td style="padding: 0.25rem 0; font-weight: 600;">Query</td><td><code>${JSON.stringify(query)}</code></td></tr>
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

      <div class="card">
        <h2>Edge Cases</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" data-sandbox="/nonexistent/deep/route">Deep 404</button>
          <button class="sandbox-btn" data-sandbox="//double-slash">Double slash</button>
          <button class="sandbox-btn api-error">Trigger error</button>
        </div>
      </div>

      <div class="card">
        <h2>v1.3.0 — Maintenance Mode</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Toggle maintenance mode on/off. When active, all routes return 503 Service Unavailable
          (except allowed paths like <code>/login</code> and <code>/assets/**</code>).
        </p>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="sandbox-btn api-maintenance-on" style="background: var(--color-warning); color: #000;">
            🔧 Enable Maintenance
          </button>
          <button class="sandbox-btn api-maintenance-off">
            ✅ Disable Maintenance
          </button>
          <span id="maintenance-status" style="font-size: 0.875rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 4px;">
            ${router.isMaintenance() ? '🟡 MAINTENANCE MODE' : '🟢 Normal'}
          </span>
        </div>
      </div>

      <div class="card">
        <h2>v1.3.0 — Access Control</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Test blocked and ignored routes:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" data-sandbox="/admin">Blocked: /admin</button>
          <button class="sandbox-btn" data-sandbox="/hidden">Ignored: /hidden</button>
          <button class="sandbox-btn" data-sandbox="/blocked/temp">Dynamic: /blocked/temp</button>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <button class="sandbox-btn api-block-temp">🔒 Block /blocked/temp</button>
          <button class="sandbox-btn api-unblock-temp">🔓 Unblock /blocked/temp</button>
        </div>
      </div>

      <div class="card">
        <h2>v1.3.0 — retry()</h2>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted);">
          The <code>retry()</code> method retries a navigation with exponential backoff.
        </p>
        <button class="sandbox-btn api-retry">🔄 retry('/nonexistent')</button>
      </div>
    </div>
  `
}


