export default function loadingDemoPage() {
  return `
    <div class="page-enter">
      <h1>Slow Page Demo</h1>
      <p style="color: var(--color-text-muted);">
        This page simulates a slow load to demonstrate the loading state.
      </p>
      <div class="card" style="margin-top: 1rem;">
        <p>Content loaded after simulated delay.</p>
      </div>
    </div>
  `
}

export async function loader() {
  await new Promise(r => setTimeout(r, 1500))
}
