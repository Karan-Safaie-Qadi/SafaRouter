export default function aboutPage() {
  return `
    <div class="page-enter">
      <h1>About SafaRouter</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Version <strong>1.3.0</strong> &mdash; A routing library that brings the App Router developer experience
        to every frontend project.
      </p>

      <div class="card">
        <h2>Why another router?</h2>
        <p>
          Next.js App Router popularised a clean, file‑system based mental model
          for routing. If you love that pattern but can&rsquo;t use Next.js &mdash;
          because you&rsquo;re on Create React App, Vite, or a plain HTML project &mdash;
          SafaRouter gives you the same conventions without the framework lock‑in.
        </p>
      </div>

      <div class="card">
        <h2>Key concepts</h2>
        <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <li><strong>Layouts</strong> &mdash; wrap pages and persist across navigations</li>
          <li><strong>Dynamic segments</strong> &mdash; <code>[slug]</code> for parameterised URLs</li>
          <li><strong>Catch‑all routes</strong> &mdash; <code>[...path]</code> for flexible matching</li>
          <li><strong>Middleware</strong> &mdash; intercept every navigation</li>
          <li><strong>404 / Error pages</strong> &mdash; built‑in fallbacks with custom overrides</li>
          <li><strong>ErrorManager</strong> &mdash; all HTTP status codes (400–511), custom pages, logging</li>
          <li><strong>AccessController</strong> &mdash; blocked (403) / ignored (404) routes</li>
          <li><strong>Route Guards</strong> &mdash; per-route auth with redirect</li>
          <li><strong>Route Loaders</strong> &mdash; async data loading before render</li>
          <li><strong>Per-route Transitions</strong> &mdash; custom animation per route</li>
          <li><strong>Maintenance Mode</strong> &mdash; toggleable 503 with bypass</li>
        </ul>
      </div>

      <div class="card">
        <h2>Try it</h2>
        <p>Visit the <a href="/errors" data-safa-link>Error Demo</a>, <a href="/access" data-safa-link>Access Control</a>, <a href="/loader" data-safa-link>Data Loader</a>, <a href="/guard" data-safa-link>Route Guard</a>, or <a href="/transition" data-safa-link>Transitions</a> demos.</p>
      </div>
    </div>
  `
}
