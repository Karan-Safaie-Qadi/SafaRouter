<div align="center">
  <h1>SafaRouter</h1>
  <p><strong>A standalone frontend router inspired by Next.js App Router</strong></p>
  <p>
    <img src="https://img.shields.io/badge/version-1.0.1-blue" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
    <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero Dependencies">
    <img src="https://img.shields.io/badge/size-%3C5%20KB-gold" alt="Size">
  </p>
  <p>
    <a href="#english">English</a> &middot;
    <a href="#persian">فارسی</a>
  </p>
  <br>
</div>

---

<a id="english"></a>

## English

**SafaRouter** brings the App Router development pattern — nested layouts, dynamic routes, middleware — to any frontend project without requiring Next.js or a specific framework.

Use it with React, Vue, Svelte, or vanilla JavaScript. Pure JS, zero dependencies, under 5 KB gzipped.

### Quick Start (1 minute)

**1. Install**
```bash
npm install safa-router
```

**2. Create HTML pages**
```
my-project/
├── pages/
│   ├── index.html        ← /
│   └── about.html        ← /about
├── index.html
└── main.js
```

**3. Initialize router**
```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'pages',      // auto-resolve .html files
}).start()
```

That's it. Each `.html` file in `pages/` becomes a route automatically.

---

### Features

- **HTML-first** — Write plain `.html` files, no JS components needed
- **Auto routing** — Files in `pageDir` become routes automatically
- **Dynamic segments** — `[slug]`, `[...catchAll]`, `[[...optionalCatchAll]]`
- **Route groups** — `(groupName)` for logical organisation
- **Nested layouts** — Layouts wrap pages and compose parent → child
- **Client-side navigation** — History API with push, replace, back, forward
- **Middleware** — Auth, redirects, logging on every navigation
- **404 & error pages** — Built-in fallbacks with custom overrides
- **Event system** — Subscribe to navigation lifecycle events
- **Zero dependencies** — Pure JavaScript, ESM, ~5 KB gzipped
- **Framework agnostic** — Works with React, Vue, Svelte, or vanilla JS

---

### Table of Contents

- [Installation](#installation)
- [Simple Usage (HTML only)](#simple-usage-html-only)
- [Route Config Usage (JS components)](#route-config-usage-js-components)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Running the Demo](#running-the-demo)

---

### Installation

```bash
npm install safa-router
```

Or copy the `src/` folder directly into your project.

---

### Simple Usage (HTML only)

Create a folder with `.html` files. Each file becomes a route:

```
pages/
  index.html    → /
  about.html    → /about
  contact.html  → /contact
  blog/
    index.html  → /blog
    post.html   → /blog/post
```

```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'pages',
  layout: ({ children }) => `
    <header><nav>...</nav></header>
    <main>${children}</main>
  `,
}).start()
```

The `layout` option wraps all pages with a global template.

#### Links in HTML pages

Use `data-safa-link` attribute for client-side navigation:

```html
<a href="/about" data-safa-link>About</a>
<a href="/contact" data-safa-link>Contact</a>
```

---

### Route Config Usage (JS components)

For advanced features (dynamic routes, middleware, per-route layouts), define routes explicitly:

```js
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({
  target: '#app',
  pageDir: 'pages',          // fallback for simple pages

  layout: ({ children }) => `
    <nav>
      <a href="/" data-safa-link>Home</a>
      <a href="/blog" data-safa-link>Blog</a>
    </nav>
    <main>${children}</main>
  `,

  routes: {
    '/': { page: () => `<h1>Home</h1>` },

    '/blog': {
      page: () => `<h1>Blog</h1>`,
      children: {
        '[slug]': {
          page: ({ params }) => `<h1>Post: ${params.slug}</h1>`,
        },
      },
    },

    '/dashboard': {
      layout: ({ children }) => `<aside>Sidebar</aside><div>${children}</div>`,
      page: () => `<h1>Dashboard</h1>`,
    },
  },

  notFound: ({ path }) => `<h1>404 — ${path} not found</h1>`,
  error: ({ error }) => `<h1>Error</h1><pre>${error.message}</pre>`,
})

router.use(async (ctx, next) => {
  if (ctx.path.startsWith('/dashboard') && !isLoggedIn()) {
    ctx.redirect = '/login'
    return
  }
  return next()
})

router.start()
```

---

### API Reference

#### `new SafaRouter(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `string\|Element` | `'#app'` | CSS selector or element to render into |
| `pageDir` | `string` | `undefined` | Folder with `.html` files for auto-routing |
| `layout` | `Function\|string` | `null` | Global layout wrapping all pages |
| `routes` | `object` | `{}` | Explicit route definitions (overrides `pageDir`) |
| `notFound` | `Function\|string` | `null` | Custom 404 page |
| `error` | `Function\|string` | `null` | Custom error page |
| `basePath` | `string` | `''` | Base path when app is served from subdirectory |
| `useHash` | `boolean` | `false` | Use `#hash` routing instead of History API |
| `scrollToTop` | `boolean` | `true` | Scroll to top on navigation |
| `cacheRoutes` | `boolean` | `true` | Cache loaded components |
| `titleTemplate` | `string` | `null` | Document title template (e.g. `'%s — My App'`) |
| `transitionDuration` | `number` | `0` | Fade transition duration in ms |

#### Router methods

| Method | Description |
|--------|-------------|
| `router.start(target?)` | Initialize and start the router |
| `router.push(url, state?)` | Navigate to URL (new history entry) |
| `router.replace(url, state?)` | Navigate (replace current history entry) |
| `router.back()` | Go back |
| `router.forward()` | Go forward |
| `router.reload()` | Re-render current route |
| `router.use(fn)` | Add middleware |
| `router.on(event, fn)` | Subscribe to event |
| `router.off(event, fn)` | Unsubscribe |
| `router.createLink(config)` | Create a Link instance |
| `router.prefetch(path)` | Preload a page |
| `router.clearCache()` | Clear component cache |
| `router.getRoute(path)` | Inspect a route definition |
| `router.destroy()` | Clean up and stop |

#### Router properties

| Property | Type | Description |
|----------|------|-------------|
| `router.pathname` | `string` | Current URL path |
| `router.params` | `object` | Dynamic route parameters |
| `router.query` | `object` | URL query parameters |
| `router.loading` | `boolean` | Navigation in progress |
| `router.matchedRoute` | `object\|null` | Current matched route info |
| `router.currentRoute` | `object\|null` | Current route data |

#### Route tree structure

Each key in `routes` represents a URL segment. Values can be:

```js
{
  page: Function|string,     // Component: function returning HTML, or path to HTML/JS file
  layout: Function|string,   // Layout wrapping children: ({ children, params, router }) => HTML
  children: { ... },         // Nested route definitions
  loading: Function|string,  // Loading component shown during page load
  error: Function|string,    // Per-route error component
  notFound: Function|string, // Per-route 404 component
  meta: { title: string },   // Route metadata (used for document title)
}
```

**Special segments:**

| Pattern | Example | Description |
|---------|---------|-------------|
| `[param]` | `[slug]` | Matches one path segment |
| `[...param]` | `[...path]` | Matches one or more segments |
| `[[...param]]` | `[[...tags]]` | Matches zero or more segments |
| `(group)` | `(auth)` | Route group — doesn't affect URL |

#### Component signature

Every component receives an object:

```js
{
  params,   // {} — dynamic route parameters
  query,    // {} — URL query parameters
  router,   // SafaRouter instance
  children, // string — (layout only) content to wrap
  path,     // string — (notFound/error only) attempted path
  error,    // Error — (error only) the caught error
}
```

Components must return an **HTML string**.

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `beforenavigate` | `{ path, method }` | Before navigation starts |
| `routechange` | `{ pathname, params, query }` | Route changed |
| `afternavigate` | `{ pathname }` | After render completes |
| `loading` | `{ path, loading }` | Loading state changed |
| `notfound` | `{ path }` | Route not found |
| `error` | `{ path, error }` | Navigation error |
| `ready` | `{ pathname }` | Router initialized |
| `destroy` | `{}` | Router destroyed |

#### Middleware

```js
router.use(async (ctx, next) => {
  // ctx = { path, method, query, cancelled, redirect }

  if (ctx.path.startsWith('/admin') && !isAdmin()) {
    ctx.redirect = '/login'  // redirect somewhere else
    return
  }

  if (!featureEnabled) {
    ctx.cancelled = true     // cancel navigation
    return
  }

  return next()              // continue
})
```

---

### Examples

#### With global layout and HTML pages

```
pages/
  index.html
  about.html
  contact.html
```

```js
new SafaRouter({
  target: '#app',
  pageDir: 'pages',
  layout: ({ children, router }) => `
    <header>
      <nav>
        <a href="/" data-safa-link>Home</a>
        <a href="/about" data-safa-link>About</a>
        <a href="/contact" data-safa-link>Contact</a>
      </nav>
    </header>
    <main>${children}</main>
  `,
}).start()
```

#### With React

```jsx
import { useEffect, useState } from 'react'
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({ pageDir: 'pages' })

function App() {
  const [path, setPath] = useState(router.pathname)
  useEffect(() => router.on('routechange', () => setPath(router.pathname)), [])

  return (
    <div>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
      <div id="app" />
    </div>
  )
}

function Link({ href, children }) {
  return <a href={href} onClick={e => { e.preventDefault(); router.push(href) }}>{children}</a>
}
```

#### Dynamic route: blog with [slug]

```js
const router = new SafaRouter({
  target: '#app',
  routes: {
    '/': { page: () => `<h1>Home</h1>` },
    '/blog': {
      page: () => `<h1>Blog</h1>`,
      children: {
        '[slug]': {
          page: ({ params }) => `<h1>Post: ${params.slug}</h1>`,
        },
      },
    },
  },
})
```

#### Nested layouts

```js
const router = new SafaRouter({
  target: '#app',
  routes: {
    '/': {
      layout: ({ children }) => `<div id="root">${children}</div>`,
      page: () => `<h1>Home</h1>`,
    },
    '/dashboard': {
      layout: ({ children }) => `<aside>Sidebar</aside><main>${children}</main>`,
      page: () => `<h1>Dashboard</h1>`,
      children: {
        settings: {
          page: () => `<h1>Settings</h1>`,
        },
      },
    },
  },
})
```

Render order: `rootLayout > dashboardLayout > page`

#### Middleware (auth guard)

```js
router.use(async (ctx, next) => {
  const protectedPaths = ['/dashboard', '/profile']
  if (protectedPaths.some(p => ctx.path.startsWith(p)) && !isAuthenticated()) {
    ctx.redirect = '/login'
    return
  }
  return next()
})
```

---

### Running the Demo

```bash
cd safa-router
node dev-server.js
```

Then open `http://localhost:3000/test-app/`

The demo shows the full feature set: HTML pages (`pageDir`), JS components, nested layouts, dynamic routes, middleware, loading state, and 404/error handling.

---

### Contributing

Contributions are welcome! Please open an issue or submit a PR on [GitHub](https://github.com/Karan-Safaie-Qadi/SafaRouter).

---

### License

[MIT](LICENSE) &copy; 2026 SafaRouter

---

<a id="persian"></a>

## فارسی

**صفا روتر** الگوی مسیریابی اپ روتِر نکست‌جی‌اس — لایه‌بندی‌های تو در تو، مسیرهای پویا، میان‌افزار — را به هر پروژه فرانت‌اندی می‌آورد.

### شروع سریع (۱ دقیقه‌ای)

```bash
npm install safa-router
```

فایل‌های HTML بسازید:
```
my-project/
├── pages/
│   ├── index.html    ← /
│   └── about.html    ← /about
├── index.html
└── main.js
```

روتر را مقداردهی کنید:
```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'pages',
}).start()
```

### ویژگی‌ها

- **HTML-first** — فایل `.html` خالص بنویسید، نیازی به کامپوننت JS نیست
- **مسیریابی خودکار** — فایل‌های داخل `pageDir` خودکار تبدیل به مسیر می‌شوند
- **بخش‌های پویا** — `[slug]` و `[...catchAll]`
- **لایه‌بندی تو در تو** — صفحات را با لِی‌اوت محصور کنید
- **میان‌افزار** — احراز هویت، تغییر مسیر، لاگ‌گیری
- **صفحات ۴۰۴ و خطا** — پیش‌فرض داخلی با امکان سفارشی‌سازی
- **بدون وابستگی** — جاواسکریپت خالص، کمتر از ۵ کیلوبایت

### آموزش کامل

#### استفاده ساده (فقط HTML)

فایل‌های HTML داخل یک پوشه. هر فایل یک مسیر می‌شود:

```
pages/
  index.html    → /
  about.html    → /about
  contact.html  → /contact
```

```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'pages',
  layout: ({ children }) => `
    <header>
      <nav>
        <a href="/" data-safa-link>خانه</a>
        <a href="/about" data-safa-link>درباره</a>
      </nav>
    </header>
    <main>${children}</main>
  `,
}).start()
```

برای لینک‌ها از `data-safa-link` استفاده کنید:
```html
<a href="/about" data-safa-link>درباره ما</a>
```

#### استفاده پیشرفته (با کامپوننت JS)

```js
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({
  target: '#app',
  layout: ({ children }) => `<nav>...</nav><main>${children}</main>`,

  routes: {
    '/': { page: () => `<h1>خانه</h1>` },
    '/blog': {
      page: () => `<h1>وبلاگ</h1>`,
      children: {
        '[slug]': {
          page: ({ params }) => `<h1>مطلب: ${params.slug}</h1>`,
        },
      },
    },
  },
})

router.start()
```

### راهنمای کامل API

| گزینه | نوع | پیش‌فرض | توضیح |
|-------|-----|---------|-------|
| `target` | `string\|Element` | `'#app'` | محل رندر |
| `pageDir` | `string` | `undefined` | پوشه فایل‌های HTML |
| `layout` | `Function\|string` | `null` | لِی‌اوت سراسری |
| `routes` | `object` | `{}` | تعریف مسیرها (دستی) |
| `notFound` | `Function\|string` | `null` | صفحه ۴۰۴ |
| `error` | `Function\|string` | `null` | صفحه خطا |
| `basePath` | `string` | `''` | مسیر پایه |
| `scrollToTop` | `boolean` | `true` | اسکرول به بالا |
| `titleTemplate` | `string` | `null` | قالب عنوان صفحه |

### اجرای دمو

```bash
cd safa-router
node dev-server.js
```

باز کنید: `http://localhost:3000/test-app/`

### مشارکت

مشارکت شما خوش‌آمد است. لطفاً issue یا PR در [GitHub](https://github.com/Karan-Safaie-Qadi/SafaRouter) ثبت کنید.

### مجوز

[MIT](LICENSE) &copy; 2026 SafaRouter
