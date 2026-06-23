<div align="center">
  <h1>SafaRouter</h1>
  <p>
    <strong>A standalone frontend router inspired by Next.js App Router</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
    <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero Dependencies">
    <img src="https://img.shields.io/badge/size-%3C5%20KB-gold" alt="Size">
  </p>
  <p>
    <a href="#english">English</a> &middot;
    <a href="#persian">فارسی</a>
  </p>
  <p>
    <a href="#installation">Installation</a> &middot;
    <a href="#quick-start">Quick Start</a> &middot;
    <a href="#api-reference">API</a> &middot;
    <a href="#advanced-usage">Advanced</a> &middot;
    <a href="test-app/index.html">Demo</a>
  </p>
  <br>
</div>

---

<a id="english"></a>

## English

**SafaRouter** brings the App Router development pattern — nested layouts, dynamic routes, middleware — to any frontend project without requiring Next.js or a specific framework.

Use it with React, Vue, Svelte, Astro, or vanilla JavaScript. It's pure JS, zero dependencies, and under 5 KB gzipped.

### Features

- **File‑system style routing** — Organise routes as a tree with nested layouts, just like `page.js` and `layout.js` in Next.js
- **Dynamic segments** — `[slug]`, `[...catchAll]`, and `[[...optionalCatchAll]]`
- **Route groups** — `(groupName)` for logical organisation without affecting the URL
- **Nested layouts** — Layouts wrap pages and compose from parent to child
- **Client‑side navigation** — History API with `push`, `replace`, `back`, `forward`
- **Middleware** — Intercept every navigation for auth, redirects, logging, etc.
- **404 & error pages** — Built‑in fallbacks with custom overrides
- **Event system** — Subscribe to navigation lifecycle events
- **Tiny & fast** — Pure JavaScript, no dependencies

### Installation

```bash
npm install safa-router
```

Or copy the `src/` folder directly into your project.

### Quick Start

```javascript
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({
  target: '#app',

  routes: {
    '/': {
      layout: () => `<nav>...</nav><main>${children}</main>`,
      page: () => `<h1>Home</h1>`,
    },
    '/about': {
      page: () => `<h1>About</h1>`,
    },
    '/blog': {
      page: () => `<h1>Blog</h1>`,
      children: {
        '[slug]': {
          page: ({ params }) => `<h1>Post: ${params.slug}</h1>`,
        },
      },
    },
  },

  notFound: () => `<h1>404</h1>`,
  error: ({ error }) => `<h1>Error</h1><pre>${error.message}</pre>`,
})

router.start()
```

### Usage with React

```javascript
import { useEffect, useState } from 'react'
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({ /* routes */ })

function useRouter() {
  const [state, setState] = useState({
    pathname: router.pathname,
    params: router.params,
    query: router.query,
  })

  useEffect(() => {
    const unsub = router.on('routechange', () => {
      setState({
        pathname: router.pathname,
        params: router.params,
        query: router.query,
      })
    })
    return unsub
  }, [])

  return { ...state, push: router.push.bind(router) }
}
```

---

<a id="persian"></a>

## فارسی

**صفا روتر** الگوی مسیریابی اپ روتِر نکست‌جی‌اس — لایه‌بندی‌های تو در تو، مسیرهای پویا، میان‌افزار — را به هر پروژه فرانت‌اندی می‌آورد بدون اینکه نیاز به نکست‌جی‌اس یا فریم‌ورک خاصی داشته باشید.

می‌توانید از آن با ری‌اکت، ویو، سوئلت، استرو یا جاواسکریپت خالص استفاده کنید. این کتابخانه جاواسکریپت خالص، بدون وابستگی و کمتر از ۵ کیلوبایت فشرده‌شده است.

### ویژگی‌ها

- **مسیریابی به سبک فایل‌سیستم** — مسیرها را به صورت درختی با لایه‌بندی‌های تو در تو سازماندهی کنید
- **بخش‌های پویا** — `[slug]`، `[...catchAll]` و `[[...optionalCatchAll]]`
- **گروه‌های مسیر** — `(groupName)` برای سازماندهی منطقی بدون تأثیر بر URL
- **لایه‌بندی تو در تو** — لایه‌بندی‌ها صفحات را محصور کرده و از والد به فرزند ترکیب می‌شوند
- **ناوبری سمت کلاینت** — API تاریخچه با پشتیبانی از `push`، `replace`، `back`، `forward`
- **میان‌افزار** — در هر ناوبری برای احراز هویت، تغییر مسیر، لاگ‌گیری و غیره مداخله کنید
- **صفحات ۴۰۴ و خطا** — پیش‌فرض‌های داخلی با امکان سفارشی‌سازی
- **سیستم رویداد** — به رویدادهای چرخه حیات ناوبری مشترک شوید
- **کوچک و سریع** — جاواسکریپت خالص، بدون وابستگی

### نصب

```bash
npm install safa-router
```

یا پوشه `src/` را مستقیماً به پروژه خود کپی کنید.

### شروع سریع

```javascript
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({
  target: '#app',

  routes: {
    '/': {
      layout: () => `<nav>...</nav><main>${children}</main>`,
      page: () => `<h1>خانه</h1>`,
    },
    '/about': {
      page: () => `<h1>درباره</h1>`,
    },
    '/blog': {
      page: () => `<h1>وبلاگ</h1>`,
      children: {
        '[slug]': {
          page: ({ params }) => `<h1>مطلب: ${params.slug}</h1>`,
        },
      },
    },
  },

  notFound: () => `<h1>۴۰۴</h1>`,
  error: ({ error }) => `<h1>خطا</h1><pre>${error.message}</pre>`,
})

router.start()
```

### استفاده با ری‌اکت

```javascript
import { useEffect, useState } from 'react'
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({ /* routes */ })

function useRouter() {
  const [state, setState] = useState({
    pathname: router.pathname,
    params: router.params,
    query: router.query,
  })

  useEffect(() => {
    const unsub = router.on('routechange', () => {
      setState({
        pathname: router.pathname,
        params: router.params,
        query: router.query,
      })
    })
    return unsub
  }, [])

  return { ...state, push: router.push.bind(router) }
}
```

---

## API Reference

### `new SafaRouter(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `string\|Element` | `'#app'` | CSS selector or element to render into |
| `routes` | `object` | `{}` | Route tree definition |
| `notFound` | `Function` | `null` | Custom 404 component |
| `error` | `Function` | `null` | Custom error component |
| `basePath` | `string` | `''` | Base path for all routes |
| `useHash` | `boolean` | `false` | Use hash-based routing |
| `scrollToTop` | `boolean` | `true` | Scroll to top on navigation |
| `cacheRoutes` | `boolean` | `true` | Cache loaded route components |

### Route tree structure

Each key in the `routes` object represents a URL segment. Values can be:

- A **function** — the page component
- An **object** with any of:
  - `page` — page component
  - `layout` — layout component wrapping children
  - `children` — nested route definitions

**Special segments:**

| Pattern | Example | Matches |
|---------|---------|---------|
| `[param]` | `[slug]` | Single path segment |
| `[...param]` | `[...path]` | One or more segments |
| `[[...param]]` | `[[...path]]` | Zero or more segments |
| `(group)` | `(auth)` | Transparent grouping |

### Router methods

| Method | Description |
|--------|-------------|
| `router.start(target?)` | Initialise and render |
| `router.push(url)` | Navigate to a URL (adds history entry) |
| `router.replace(url)` | Navigate (replaces current history entry) |
| `router.back()` | Go back in history |
| `router.forward()` | Go forward in history |
| `router.reload()` | Re-render current route |
| `router.use(middleware)` | Add a middleware function |
| `router.on(event, fn)` | Subscribe to an event |
| `router.off(event, fn)` | Unsubscribe from an event |
| `router.createLink(config)` | Create a Link instance |

### Router properties

| Property | Type | Description |
|----------|------|-------------|
| `router.pathname` | `string` | Current URL path |
| `router.params` | `object` | Dynamic route parameters |
| `router.query` | `object` | URL query parameters |
| `router.loading` | `boolean` | Whether a navigation is in progress |

### Events

| Event | Payload |
|-------|---------|
| `beforenavigate` | `{ path, method }` |
| `routechange` | `{ pathname, params, query }` |
| `afternavigate` | `{ pathname }` |
| `loading` | `{ path, loading }` |
| `notfound` | `{ path }` |
| `error` | `{ path, error }` |
| `ready` | `{ pathname }` |
| `destroy` | `{}` |

### Middleware

Middleware functions receive `(ctx, next)`. Call `next()` to continue or set `ctx.redirect` / `ctx.cancelled`.

```javascript
router.use(async (ctx, next) => {
  if (ctx.path.startsWith('/admin') && !isAdmin()) {
    ctx.redirect = '/login'
    return
  }
  return next()
})
```

### Component signature

Every component (page, layout, notFound, error) receives an object:

```javascript
{
  params,   // dynamic route params
  query,    // URL query params
  router,   // the SafaRouter instance
  children, // (layout only) content to wrap
  path,     // (notFound/error only) the attempted path
  error,    // (error only) the caught error
}
```

Components must return an HTML string.

---

## Running the Demo

```bash
cd safa-router
npx serve test-app -l 3000
# or
npm start
```

Then open `http://localhost:3000`.

---

## Contributing

Contributions are welcome! Please open an issue or submit a PR on [GitHub](https://github.com/pishro-dev/safa-router).

---

## License

[MIT](LICENSE) &copy; 2026 SafaRouter
