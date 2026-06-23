export default function blogPostPage({ params }) {
  const slug = params.slug

  const posts = {
    'hello-world': {
      title: 'Hello World',
      date: '2026-01-15',
      body: 'Welcome to the first post on this demo blog. SafaRouter makes it easy to handle dynamic routes like this one. The `[slug]` pattern matches any value and makes it available via `params.slug`.',
    },
    'routing-deep-dive': {
      title: 'Routing Deep Dive',
      date: '2026-02-20',
      body: 'Under the hood SafaRouter uses a tree structure to resolve routes. Static segments are prioritised over dynamic ones, so `/blog/hello-world` matches before `/blog/[slug]` if both exist. The matcher also supports optional catch‑all segments (`[[...path]]`).',
    },
    'middleware-guide': {
      title: 'Middleware Guide',
      date: '2026-03-10',
      body: 'Middleware functions run before each navigation. You can use them to redirect unauthenticated users, log page views, or fetch data in advance. Just call `router.use(fn)` where `fn` receives a context object and a `next` function.',
    },
    'app-router-patterns': {
      title: 'App Router Patterns',
      date: '2026-04-05',
      body: 'Borrowed from Next.js App Router, the patterns include nested layouts, loading states, error boundaries, and not‑found pages. Each route segment can optionally define its own `layout`, `loading`, `error`, or `notFound`.',
    },
    'safa-router-v1': {
      title: 'SafaRouter v1.0.0 Released',
      date: '2026-06-23',
      body: 'SafaRouter brings the App Router developer experience to any frontend project. With nested layouts, dynamic segments, middleware, and zero dependencies — you can now use Next.js-style routing without Next.js.',
    },
  }

  const post = posts[slug]

  if (!post) {
    return `
      <div class="page-enter">
        <h1>Post not found</h1>
        <p>The blog post "<strong>${slug}</strong>" does not exist.</p>
        <a href="/blog" data-safa-link>&larr; Back to blog</a>
      </div>
    `
  }

  return `
    <div class="page-enter">
      <p><a href="/blog" data-safa-link>&larr; Back to blog</a></p>
      <h1>${post.title}</h1>
      <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">
        ${post.date} &middot; slug: <code>${slug}</code>
      </p>
      <div class="card">
        <p>${post.body}</p>
      </div>
    </div>
  `
}
