export default function guardDemoPage({ router }) {
  const authed = localStorage.getItem('safa_demo_auth') === 'true'
  return `
    <div class="page-enter">
      <h1>Route Guard Demo</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        This page is protected by a <strong>route guard</strong>. Unauthenticated users are
        redirected to <code>/login</code>.
      </p>

      <div class="card">
        <h2>Authentication Status</h2>
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <span style="font-size: 2rem;">${authed ? '✅' : '🔒'}</span>
          <div>
            <p><strong>${authed ? 'Authenticated' : 'Not Authenticated'}</strong></p>
            <p style="font-size: 0.875rem; color: var(--color-text-muted);">
              ${authed ? 'You have access to this protected route.' : 'You will be redirected if you try to access a guarded route.'}
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          ${authed
            ? `<button class="sandbox-btn" id="guard-logout">Logout</button>`
            : `<a href="/login" class="sandbox-btn" data-safa-link>Go to Login &rarr;</a>`
          }
        </div>
      </div>

      <div class="card">
        <h2>Guard Configuration</h2>
        <pre>guard: ({ params, query, router }) => {
  const authed = localStorage.getItem('safa_demo_auth') === 'true'
  return authed || '/login'
}</pre>
        <p style="margin-top: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Return <code>true</code> to allow access, a string to redirect, or <code>false</code>
          to redirect to <code>/</code>.
        </p>
      </div>
    </div>
  `
}
