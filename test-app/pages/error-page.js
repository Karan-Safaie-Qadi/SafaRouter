export default function errorPage({ error, path }) {
  return `
    <div class="safa-error page-enter">
      <h1>Oops!</h1>
      <h2 style="margin-bottom: 1rem;">Something went wrong</h2>
      <div class="card">
        <p><strong>Path:</strong> <code>${path}</code></p>
        <pre>${error.message}</pre>
      </div>
      <a href="/" data-safa-link>&larr; Back to home</a>
    </div>
  `
}
