export default function homePage() {
  return `
    <section class="hero">
      <h1>SafaRouter</h1>
      <p>
        A professional standalone frontend router inspired by
        <strong>Next.js App Router</strong>.
        Works with any framework — or no framework at all.
      </p>
      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <a href="/about" class="cta-link" data-safa-link style="padding:0.5rem 1.5rem;background:var(--color-accent);color:var(--color-bg);border-radius:6px;font-weight:600;">Learn more &rarr;</a>
        <a href="/docs" class="cta-link" data-safa-link style="padding:0.5rem 1.5rem;border:1px solid var(--color-border);border-radius:6px;">Documentation</a>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="icon">🗂️</div>
        <h3>File‑system routing</h3>
        <p>Organise your routes like Next.js App Router with nested layouts and dynamic segments.</p>
      </div>
      <div class="feature-card">
        <div class="icon">⚡</div>
        <h3>Client‑side navigation</h3>
        <p>Instant page transitions via History API &mdash; no full reloads.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔌</div>
        <h3>Framework agnostic</h3>
        <p>Use it with React, Vue, Svelte, or vanilla JS. Just return HTML from your components.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛡️</div>
        <h3>Middleware</h3>
        <p>Protect routes, redirect, or augment context before every navigation.</p>
      </div>
      <div class="feature-card">
        <div class="icon">📦</div>
        <h3>Tiny &amp; zero deps</h3>
        <p>Pure JavaScript, no dependencies. Under 5 KB gzipped.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🌐</div>
        <h3>Dynamic routes</h3>
        <p>Support for <code>[slug]</code>, <code>[...catchAll]</code>, and route groups.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛑</div>
        <h3>ErrorManager</h3>
        <p>All HTTP status codes (400–511), custom error pages, error logging, and redirect rules.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔐</div>
        <h3>AccessController</h3>
        <p>Blocked (403) and ignored (404) routes with glob-style pattern matching.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔧</div>
        <h3>Maintenance Mode</h3>
        <p>Toggleable 503 maintenance with allowed path bypasses.</p>
      </div>
      <div class="feature-card">
        <div class="icon">📊</div>
        <h3>Route Data Loaders</h3>
        <p>Async functions that provide data to pages before render.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛡️</div>
        <h3>Route Guards</h3>
        <p>Declarative per-route auth guards with redirect support.</p>
      </div>
    </section>
  `
}
