export default function profilePage({ params, router }) {
  const id = params.id || 'unknown'

  return `
    <div class="page-enter">
      <h1>User Profile</h1>
      <p style="color: var(--color-text-muted);">Dynamic route demo — segment: <code>${id}</code></p>

      <div class="card" style="margin-top: 1rem;">
        <h2>User: ${id}</h2>
        <p>This page uses a dynamic segment <code>[id]</code> under a route group <code>(main)</code>.</p>
        <p>Route groups let you organise routes without affecting the URL path.</p>
        <p style="margin-top: 0.75rem;">
          <a href="/profile/foo" data-safa-link>/profile/foo</a> &middot;
          <a href="/profile/bar" data-safa-link>/profile/bar</a> &middot;
          <a href="/profile/baz" data-safa-link>/profile/baz</a>
        </p>
      </div>
    </div>
  `
}
