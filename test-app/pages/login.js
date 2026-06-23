export default function loginPage({ router }) {
  return `
    <div class="page-enter" style="max-width: 400px; margin: 0 auto;">
      <h1 style="text-align: center;">Login</h1>
      <p style="color: var(--color-text-muted); text-align: center; margin-bottom: 1.5rem;">
        Demo authentication page. Click the button to "log in" and access the guarded route.
      </p>

      <div class="card">
        <h2>Demo Login</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          This simulates setting an auth token in localStorage and redirecting back
          to the guarded route.
        </p>
        <button class="sandbox-btn" id="login-btn" style="width: 100%; padding: 0.75rem; font-size: 1rem;">
          Sign In (Demo)
        </button>
      </div>

      <div class="card">
        <h2>How it works</h2>
        <p style="font-size: 0.875rem;">
          The route guard checks <code>localStorage.getItem('safa_demo_auth')</code>.
          After clicking Sign In, this value is set to <code>'true'</code> and you
          are redirected to <code>/guard</code> — the protected route.
        </p>
      </div>
    </div>
  `
}
