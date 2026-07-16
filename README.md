<div align="center">
  <img src="docs-site/assets/logo.svg" alt="SafaRouter" width="120" height="120">
  <h1>SafaRouter</h1>
  <p><strong>A standalone frontend router inspired by Next.js App Router</strong></p>
  <p>
    Framework-agnostic &bull; Zero dependencies &bull; ~5 KB gzipped &bull; 267+ tests
  </p>
  <p>
    <a href="https://www.npmjs.com/package/safa-router"><img src="https://img.shields.io/npm/v/safa-router?color=6366f1&label=npm" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/safa-router"><img src="https://img.shields.io/npm/dt/safa-router?color=6366f1" alt="npm downloads"></a>
    <a href="LICENSE"><img src="https://img.shields.io/npm/l/safa-router?color=6366f1" alt="license"></a>
    <a href="https://github.com/Karan-Safaie-Qadi/SafaRouter/actions"><img src="https://img.shields.io/github/actions/workflow/status/Karan-Safaie-Qadi/SafaRouter/.github/workflows/ci.yml?branch=master&color=6366f1" alt="CI"></a>
    <img src="https://img.shields.io/badge/dependencies-0-brightgreen?color=22c55e" alt="Zero Dependencies">
    <img src="https://img.shields.io/badge/size-%3E5%20KB-gold?color=f59e0b" alt="Size">
  </p>
  <p>
    <a href="#english">English</a> &middot;
    <a href="#persian">فارسی</a> &middot;
    <a href="#migration">Migration</a> &middot;
    <a href="https://karan-safaie-qadi.github.io/SafaRouter/">Documentation</a> &middot;
    <a href="CHANGELOG.md">Changelog</a>
  </p>
  <br>
</div>

---

<a id="english"></a>

## Why SafaRouter?

SafaRouter brings **Next.js App Router patterns** to any frontend project — no React, no Next.js, no bundler required.

| Problem | SafaRouter Solution |
|---------|-------------------|
| Tied to a framework | Works with **React, Vue, Svelte, or vanilla JS** |
| Heavy dependencies | **Zero dependencies**, ~5 KB gzipped |
| Complex setup | **1 minute** to first route |
| No middleware | Built-in **middleware chain** |
| No access control | **Route blocking**, **allowlist/blocklist** |
| No error management | **ErrorManager** with custom error pages |
| No SSR support | **SSR-compatible** — runs in Node.js |
| No TypeScript types | **Full TypeScript** definitions included |
| No build step needed | Runs directly in browser via **ESM imports** |
| No real-time updates | Built-in **SSE/polling/WebSocket** hot reload |

```bash
npm install safa-router
# That's it. No framework, no bundler, no config.
```

---

## Quick Start (30 seconds)

**1. Create project**
```
my-app/
├── index.html
├── main.js
└── html-pages/
    ├── index.html
    └── about.html
```

**2. Write `main.js`**
```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'html-pages',
  routes: { '/': {}, '/about': {} },
}).start()
```

**3. Write `html-pages/index.html`**
```html
<h1>Home</h1>
<a href="/about" data-safa-link>About</a>
```

**4. Open in browser** (or `npx serve .`)

That's it. No build step, no bundler, no framework.

---

## Features

| Feature | Description | Since |
|---------|-------------|-------|
| **HTML-first routing** | Plain `.html` files = routes automatically | v1.0 |
| **Nested layouts** | Layouts wrap pages, compose parent → child | v1.0 |
| **Dynamic routes** | `[slug]`, `[...catchAll]`, `[[...optional]]` | v1.0 |
| **Route groups** | `(group)` for organization without URL changes | v1.0 |
| **Middleware** | Intercept every navigation (auth, redirects, logging) | v1.0 |
| **Event system** | Subscribe to lifecycle events | v1.0 |
| **Route guards** | Per-route guard functions with redirect support | v1.3 |
| **Data loaders** | Async data fetching before render | v1.3 |
| **SWR cache** | Stale-while-revalidate caching for loaders | v2.0 |
| **Error manager** | 400–511 HTTP error handling with custom pages | v1.3 |
| **Access control** | Blocklist/allowlist with glob patterns | v1.3 |
| **Maintenance mode** | 503 mode with bypass paths | v1.3 |
| **Per-route transitions** | CSS transition effects per route | v1.3 |
| **Smart components** | Persistent header/footer on every page | v1.4 |
| **Template resolution** | `{{ params.x }}`, `{{ data.x }}` in HTML | v1.4 |
| **Real-time hot reload** | SSE/polling/WebSocket live updates | v1.4 |
| **DevServer** | Zero-config dev server with SPA fallback | v1.4 |
| **Parallel routes (slots)** | Multiple independent sections per page | v2.0 |
| **Intercepting routes** | Routes as overlays on current page | v2.0 |
| **Vite plugin** | Auto-inject only needed feature imports | v2.0 |
| **Type-safe routes** | Full TypeScript inference | v2.0 |
| **Core router** | Minimal bundle without optional features | v2.0 |

---

## Comparison

| Feature | SafaRouter | React Router | Vue Router | TanStack Router | page.js |
|---------|-----------|-------------|-----------|----------------|---------|
| Framework | Any | React only | Vue only | Any (React-first) | Any |
| Zero dependencies | ✅ | ❌ | ❌ | ❌ | ✅ |
| TypeScript | ✅ Full | ✅ | ✅ | ✅ Full | ❌ |
| Nested layouts | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dynamic routes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Middleware | ✅ | ❌ | ❌ | ✅ | ❌ |
| Route guards | ✅ | ✅ | ✅ | ✅ | ❌ |
| Access control | ✅ | ❌ | ❌ | ❌ | ❌ |
| Maintenance mode | ✅ | ❌ | ❌ | ❌ | ❌ |
| Error manager | ✅ | ❌ | ❌ | ❌ | ❌ |
| Data loaders | ✅ | ✅ | ✅ | ✅ | ❌ |
| SWR caching | ✅ | ❌ | ❌ | ✅ | ❌ |
| SSR support | ✅ | ✅ | ✅ | ✅ | ❌ |
| Real-time hot reload | ✅ | ❌ | ❌ | ❌ | ❌ |
| Smart components | ✅ | ❌ | ❌ | ❌ | ❌ |
| Parallel routes | ✅ | ❌ | ❌ | ✅ | ❌ |
| Intercepting routes | ✅ | ❌ | ❌ | ❌ | ❌ |
| Size (approx) | ~5 KB | ~14 KB | ~8 KB | ~15 KB | ~2 KB |

---

## Examples

Ready-to-run examples for every setup:

| Example | Stack | Try it |
|---------|-------|--------|
| **Vanilla** | Plain HTML + JS | `cd examples/vanilla && npx serve .` |
| **Vite** | Vite + safa-router plugin | `cd examples/vite && npm install && npm run dev` |
| **React** | React 19 + Vite | `cd examples/react && npm install && npm run dev` |
| **Vue** | Vue 3 + Vite | `cd examples/vue && npm install && npm run dev` |
| **Svelte** | Svelte 5 + Vite | `cd examples/svelte && npm install && npm run dev` |
| **Webpack** | Webpack 5 | `cd examples/webpack && npm install && npm run dev` |

---

## Documentation

Full documentation site: [**SafaRouter Docs**](https://karan-safaie-qadi.github.io/SafaRouter/)

- [Getting Started](https://karan-safaie-qadi.github.io/SafaRouter/getting-started.html)
- [Routing](https://karan-safaie-qadi.github.io/SafaRouter/routing.html)
- [Dynamic Routes](https://karan-safaie-qadi.github.io/SafaRouter/dynamic-routes.html)
- [Nested Routes](https://karan-safaie-qadi.github.io/SafaRouter/nested-routes.html)
- [Middleware](https://karan-safaie-qadi.github.io/SafaRouter/middleware.html)
- [Route Guards](https://karan-safaie-qadi.github.io/SafaRouter/route-guards.html)
- [Lazy Loading](https://karan-safaie-qadi.github.io/SafaRouter/lazy-loading.html)
- [API Reference](https://karan-safaie-qadi.github.io/SafaRouter/api-reference.html)
- [Migration Guide](https://karan-safaie-qadi.github.io/SafaRouter/migration-guide.html)

Or serve locally:

```bash
npx serve docs-site
```

---

## Benchmark

| Metric | Value |
|--------|-------|
| Bundle size (full router) | ~5 KB gzipped |
| Bundle size (core router) | ~3 KB gzipped |
| Route resolution | O(n) — n = path segment count |
| Route matching | < 0.01 ms per route |
| Initial render | < 1 ms (DOM ready) |
| Page transition | Configurable (default 0 ms) |
| SWR cache | Concurrent dedup, max 100 entries |
| LRU page cache | Up to 50 cached pages |
| Startup (with routes) | < 10 ms |
| Dependencies | 0 |
| Test coverage | 267 tests across 22 files |

---

## Roadmap

| Version | Focus | Status |
|---------|-------|--------|
| **v2.0** | SWR caching, parallel routes, intercepting routes, Vite plugin, TypeScript types | ✅ Released |
| **v2.1** | DevTools browser extension, docs-site polish, improved TypeScript inference | 🔜 Planned |
| **v2.2** | Link prefetching, route animations API, code-splitting helpers | 📋 Planned |
| **v3.0** | Plugin ecosystem, CLI scaffolding, full TanStack Router parity | 🎯 Future |

---

## Migration

Upgrade guides:

- [v1.5 → v2.0](https://karan-safaie-qadi.github.io/SafaRouter/migration-guide.html#from-v15x-to-v200)
- [v1.4 → v1.5](https://karan-safaie-qadi.github.io/SafaRouter/migration-guide.html#from-v14x-to-v150)
- [v1.3 → v1.4](https://karan-safaie-qadi.github.io/SafaRouter/migration-guide.html#from-v13x-to-v140)

---

## License

[MIT](LICENSE) &copy; 2026 Karan Safaie Qadi

---

<a id="persian"></a>

## فارسی

**صفا روتر** الگوی مسیریابی App Router نکست‌جی‌اس را به هر پروژه فرانت‌اندی می‌آورد — بدون نیاز به React، Next.js یا باندلر.

```bash
npm install safa-router
```

### شروع سریع (۳۰ ثانیه)

```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'html-pages',
  routes: { '/': {}, '/about': {} },
}).start()
```

```html
<!-- html-pages/index.html -->
<h1>خانه</h1>
<a href="/about" data-safa-link>درباره</a>
```

### قابلیت‌ها

- ✅ مستقل از فریم‌ورک (React, Vue, Svelte, یا vanilla JS)
- ✅ وابستگی صفر — زیر ۵ کیلوبایت
- ✅ مسیرهای پویا، لایه‌بندی تو در تو، میان‌افزار
- ✅ مدیریت خطا و کنترل دسترسی
- ✅ کش SWR، مسیرهای موازی، مسیرهای میان‌گیر
- ✅ پلاگین Vite، تایپ‌اسکریپت کامل
- ✅ ۲۶۷ تست، پشتیبانی SSR

### مستندات

[مستندات کامل صفا روتر](https://karan-safaie-qadi.github.io/SafaRouter/)

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Report bugs via [GitHub Issues](https://github.com/Karan-Safaie-Qadi/SafaRouter/issues)
- Submit fixes and features via [Pull Requests](https://github.com/Karan-Safaie-Qadi/SafaRouter/pulls)
- Read our [Code of Conduct](CODE_OF_CONDUCT.md)
