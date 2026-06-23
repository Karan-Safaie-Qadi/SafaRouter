export default function transitionDemoPage({ router }) {
  return `
    <div class="page-enter">
      <h1>Per‑Route Transitions Demo</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Each route can define custom <strong>transition effects</strong> via <code>meta.transition</code>.
        Navigate away and back to see the slide-up animation.
      </p>

      <div class="card">
        <h2>Current Transition</h2>
        <p style="margin-bottom: 0.75rem;">
          This route uses a <strong>slide-up</strong> animation with 500ms duration.
        </p>
        <div style="background: var(--color-bg); padding: 0.75rem; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">
          <div>duration: <span style="color: var(--color-accent);">500</span></div>
          <div>enterClass: <span style="color: var(--color-success);">"slide-up"</span></div>
        </div>
      </div>

      <div class="card">
        <h2>Test Navigation</h2>
        <p style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Navigate away and come back to see the transition effect:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <a href="/about" class="sandbox-btn" data-safa-link>Go to About</a>
          <a href="/docs" class="sandbox-btn" data-safa-link>Go to Docs</a>
          <a href="/" class="sandbox-btn" data-safa-link>Go Home</a>
        </div>
      </div>

      <div class="card">
        <h2>Configuration</h2>
        <pre>'/transition': {
  page: transitionDemoPage,
  meta: {
    transition: {
      duration: 500,
      enterClass: 'slide-up',
    },
  },
}</pre>
        <p style="margin-top: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          Supported options: <code>duration</code>, <code>enterClass</code>, <code>exitClass</code>,
          <code>enterActiveClass</code>, <code>exitActiveClass</code>.
        </p>
      </div>
    </div>
  `
}
