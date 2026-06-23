export default function accessControlPage({ router }) {
  const ac = router.accessController
  return `
    <div class="page-enter">
      <h1>Access Control Demo</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        The <strong>AccessController</strong> manages blocked (403) and ignored (silent 404) routes.
        Patterns support <code>*</code> (single level) and <code>**</code> (recursive) wildcards.
      </p>

      <div class="card">
        <h2>Blocked Routes (403 Forbidden)</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          These routes return a 403 Forbidden error with a custom error page.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" data-blocked="/admin">Blocked: /admin</button>
          <button class="sandbox-btn" data-blocked="/admin/users">Blocked: /admin/users</button>
          <button class="sandbox-btn" data-blocked="/private/keys">Blocked: /private/keys</button>
          <button class="sandbox-btn" data-blocked="/private/deep/nested">Blocked: /private/deep/nested</button>
        </div>
        <pre style="margin-top: 0.75rem;">blocked: ['/admin', '/private/**']</pre>
      </div>

      <div class="card">
        <h2>Ignored Routes (Silent 404)</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          These routes return a 404 as if they never existed — ideal for hiding deprecated endpoints.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" data-ignored="/hidden">Ignored: /hidden</button>
          <button class="sandbox-btn" data-ignored="/deprecated/v1">Ignored: /deprecated/v1</button>
          <button class="sandbox-btn" data-ignored="/deprecated/api">Ignored: /deprecated/api</button>
        </div>
        <pre style="margin-top: 0.75rem;">ignored: ['/hidden', '/deprecated/*']</pre>
      </div>

      <div class="card">
        <h2>Programmatic Control</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          You can dynamically block/unblock and ignore/unignore routes at runtime.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="sandbox-btn" id="dynamic-block">Block /api/temp</button>
          <button class="sandbox-btn" id="dynamic-unblock">Unblock /api/temp</button>
          <button class="sandbox-btn" data-blocked="/api/temp">Test /api/temp</button>
        </div>
        <pre style="margin-top: 0.75rem;">router.blockRoute('/api/temp')
router.unblockRoute('/api/temp')</pre>
      </div>

      <div class="card">
        <h2>Accessibility Check</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Use <code>isAccessible()</code> to check if a route can be navigated to:
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.25rem; font-family: monospace; font-size: 0.875rem;">
          <div><span style="display:inline-block;width:80px;">/admin</span> <span style="color:${ac && !ac.isAccessible('/admin') ? 'var(--color-error)' : 'var(--color-success)'}">${ac ? (!ac.isAccessible('/admin') ? '✗ Blocked' : '✓ Accessible') : 'N/A'}</span></div>
          <div><span style="display:inline-block;width:80px;">/hidden</span> <span style="color:${ac && !ac.isAccessible('/hidden') ? 'var(--color-error)' : 'var(--color-success)'}">${ac ? (!ac.isAccessible('/hidden') ? '✗ Blocked' : '✓ Accessible') : 'N/A'}</span></div>
          <div><span style="display:inline-block;width:80px;">/about</span> <span style="color:${ac && ac.isAccessible('/about') ? 'var(--color-success)' : 'var(--color-error)'}">${ac ? (ac.isAccessible('/about') ? '✓ Accessible' : '✗ Blocked') : 'N/A'}</span></div>
          <div><span style="display:inline-block;width:80px;">/blog</span> <span style="color:${ac && ac.isAccessible('/blog') ? 'var(--color-success)' : 'var(--color-error)'}">${ac ? (ac.isAccessible('/blog') ? '✓ Accessible' : '✗ Blocked') : 'N/A'}</span></div>
        </div>
      </div>
    </div>
  `
}
