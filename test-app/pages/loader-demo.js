export default function loaderDemoPage({ params, query, router, data }) {
  return `
    <div class="page-enter">
      <h1>Route Data Loader Demo</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        This route uses a <strong>data loader function</strong> that runs before the page renders.
        The loaded data is passed to the page component as <code>data</code>.
      </p>

      <div class="card">
        <h2>Loaded Data</h2>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
          The loader below simulates a 500ms async fetch and returns mock data.
        </p>
        ${data ? `
          <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 0.875rem;">
            <tr>
              <td style="padding: 0.25rem 0; font-weight: 600; color: var(--color-accent);">Server</td>
              <td><code>${data.server}</code></td>
            </tr>
            <tr>
              <td style="padding: 0.25rem 0; font-weight: 600; color: var(--color-accent);">Timestamp</td>
              <td><code>${new Date(data.timestamp).toLocaleTimeString()}</code></td>
            </tr>
          </table>
          <h3 style="margin: 1rem 0 0.5rem; font-size: 1rem;">Items</h3>
          <ul style="padding-left: 1.25rem;">
            ${data.items.map(item => `<li>Item #${item.id}: <strong>${item.name}</strong></li>`).join('')}
          </ul>
        ` : `
          <p style="color: var(--color-warning);">No data loaded.</p>
        `}
      </div>

      <div class="card">
        <h2>Loader Configuration</h2>
        <pre>loader: async ({ params, query, router }) => {
  await new Promise(r => setTimeout(r, 500))
  return {
    items: [
      { id: 1, name: 'Router Config' },
      { id: 2, name: 'Route Tree' },
      { id: 3, name: 'Middleware Chain' },
      { id: 4, name: 'Error Manager' },
      { id: 5, name: 'Access Controller' },
    ],
    timestamp: Date.now(),
    server: 'safa-router-demo',
  }
}</pre>
        <p style="margin-top: 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
          The loader receives <code>{ params, query, router }</code> and the return value
          is available as <code>data</code> in the page component.
        </p>
      </div>
    </div>
  `
}
