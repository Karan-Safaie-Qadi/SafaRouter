export default function blogPage({ router }) {
  const posts = [
    { slug: 'hello-world', title: 'Hello World', date: '2026-01-15' },
    { slug: 'routing-deep-dive', title: 'Routing Deep Dive', date: '2026-02-20' },
    { slug: 'middleware-guide', title: 'Middleware Guide', date: '2026-03-10' },
    { slug: 'app-router-patterns', title: 'App Router Patterns', date: '2026-04-05' },
    { slug: 'safa-router-v1', title: 'SafaRouter v1.0.0 Released', date: '2026-06-23' },
  ]

  const articles = posts
    .map(
      (post) => `
        <article>
          <h3><a href="/blog/${post.slug}" data-safa-link>${post.title}</a></h3>
          <div class="meta">${post.date}</div>
        </article>
      `
    )
    .join('')

  return `
    <div class="page-enter">
      <h1>Blog</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        Click a post to see dynamic route matching in action.
      </p>
      <section class="blog-list">${articles}</section>
    </div>
  `
}
