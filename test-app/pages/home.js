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
    </section>
  `
}
