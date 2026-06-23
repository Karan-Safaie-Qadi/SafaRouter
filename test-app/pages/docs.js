export default function docsPage() {
  return `
    <div class="page-enter">
      <h1>Documentation</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Learn how SafaRouter works.
      </p>

      <div class="card">
        <h2>Route Tree Structure</h2>
        <p>Routes are defined as a nested object. Each key is a URL segment. The tree mirrors the Next.js App Router mental model.</p>
        <pre>{
  '/': { page, layout },
  '/blog': {
    page,
    children: {
      '[slug]': { page }
    }
  }
}</pre>
      </div>

      <div class="card">
        <h2>Dynamic Segments</h2>
        <p><code>[param]</code> matches a single path segment and exposes it via <code>params.param</code>.</p>
        <p><code>[...param]</code> matches one or more segments as an array.</p>
        <p><code>[[...param]]</code> matches zero or more segments.</p>
      </div>

      <div class="card">
        <h2>Route Groups</h2>
        <p><code>(groupName)</code> organises routes without affecting the URL.</p>
        <pre>'(main)': {
  children: {
    'profile': {
      children: {
        '[id]': { page }
      }
    }
  }
}</pre>
        <p>This makes <code>/profile/me</code> available without <code>/main/profile/me</code>.</p>
      </div>

      <div class="card">
        <h2>Middleware</h2>
        <p>Middleware intercepts every navigation. Use it for auth, redirects, logging, or analytics.</p>
        <pre>router.use(async (ctx, next) => {
  console.log('Navigating to', ctx.path)
  return next()
})</pre>
      </div>
    </div>
  `
}
