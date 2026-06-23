export default function errorPage({ error, path, router }) {
  return `
    <div class="safa-error page-enter">
      <h1>Oops!</h1>
      <h2 style="margin-bottom: 1rem;">Something went wrong</h2>
      <div class="card">
        <p><strong>Path:</strong> <code>${path}</code></p>
        <p><strong>Code:</strong> <code>${error.code || 'UNKNOWN'}</code></p>
        <pre>${error.message}</pre>
        ${error.original ? `<pre style="margin-top:0.5rem;font-size:0.8rem;">${error.original.message}</pre>` : ''}
      </div>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
        <a href="/" data-safa-link class="sandbox-btn">&larr; Home</a>
        <button class="sandbox-btn" onclick="location.reload()">Retry</button>
      </div>
    </div>
  `
}
