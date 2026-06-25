<div align="center">
  <h1>SafaRouter</h1>
  <p><strong>A standalone frontend router inspired by Next.js App Router</strong></p>
  <p>
    <img src="https://img.shields.io/badge/version-1.4.4-blue" alt="Version">
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

**SafaRouter** brings the App Router development pattern — nested layouts, dynamic routes, middleware, error management, access control, and smart components — to any frontend project without requiring Next.js or a specific framework.

Use it with React, Vue, Svelte, or vanilla JavaScript. Pure JS, zero dependencies, under 5 KB gzipped.

---

### Features

| Feature | Description | Version |
|---------|-------------|---------|
| **HTML-first routing** | Write plain `.html` files — each file is a route automatically | v1.0.0 |
| **Route config** | Explicit JS route definitions with full control | v1.0.0 |
| **Dynamic segments** | `[slug]`, `[...catchAll]`, `[[...optional]]` | v1.0.0 |
| **Route groups** | `(groupName)` for logical organisation without URL changes | v1.0.0 |
| **Nested layouts** | Layouts wrap pages and compose parent → child | v1.0.0 |
| **Client-side navigation** | History API with push, replace, back, forward | v1.0.0 |
| **Middleware** | Intercept every navigation for auth, redirects, logging | v1.0.0 |
| **Event system** | Subscribe to navigation lifecycle events | v1.0.0 |
| **ErrorManager** | Handle all HTTP status codes (400–511) with custom error pages, grouping, and logging | v1.3.0 |
| **AccessController** | Blocked routes (403) and ignored routes (silent 404) with glob patterns | v1.3.0 |
| **Maintenance Mode** | Toggleable 503 maintenance mode with allowed path bypasses | v1.3.0 |
| **Route Data Loaders** | Async functions that provide data to pages before render | v1.3.0 |
| **Route Guards** | Per-route guard functions with redirect support | v1.3.0 |
| **Per-route Transitions** | Custom CSS transition effects per route | v1.3.0 |
| **Smart Components** | Header/Footer components that render on every page with auto-link binding | v1.4.0 |
| **Per-route hideComponents** | Hide specific components (header/footer) per route via `meta.hideComponents` | v1.4.3 |
| **Template Resolution** | `{{ params.x }}`, `{{ query.x }}`, `{{ data.x }}` in HTML files | v1.4.0 |
| **auto-resolve pages** | Routes without `page` auto-resolve from `pageDir` HTML files | v1.4.0 |
| **Access allowlist mode** | Block everything except explicitly allowed paths (`access.mode: 'allowlist'`) | v1.4.3 |
| **Real-time hot reload** | SSE-based live reload — edit HTML files, page updates without browser refresh | v1.4.3 |
| **DevServer class** | Import `SafaDevServer` — zero-config dev server with SPA fallback + file watching | v1.4.4 |
| **Links on error pages** | `_bindLinks()` now runs on 404/error pages so `data-safa-link` works everywhere | v1.4.4 |
| **Zero dependencies** | Pure JavaScript, ESM, ~5 KB gzipped | — |
| **Framework agnostic** | Works with React, Vue, Svelte, or vanilla JS | — |

---

### Table of Contents

- [Installation](#installation)
- [Quick Start (HTML only)](#quick-start-html-only)
- [Route Configuration](#route-configuration)
- [Smart Components (v1.4.0)](#smart-components-v140)
- [Route Data Loaders (v1.3.0)](#route-data-loaders-v130)
- [Route Guards (v1.3.0)](#route-guards-v130)
- [Middleware](#middleware)
- [Layouts](#layouts)
- [Dynamic Routes & Route Groups](#dynamic-routes--route-groups)
- [Error Handling](#error-handling)
  - [ErrorManager (v1.3.0)](#errormanager-v130)
  - [Custom Error Pages](#custom-error-pages)
  - [AccessController (v1.3.0)](#accesscontroller-v130)
  - [Maintenance Mode (v1.3.0)](#maintenance-mode-v130)
- [Events](#events)
- [Template Resolution (v1.4.0)](#template-resolution-v140)
- [Per-route Transitions (v1.3.0)](#per-route-transitions-v130)
- [API Reference](#api-reference)
- [Complete Demo Configuration](#complete-demo-configuration)
- [Running the Demo](#running-the-demo)
- [Migration Guide](#migration-guide)

---

### Installation

```bash
npm install safa-router
```

Or copy the `src/` folder directly into your project.

---

### Quick Start (HTML only)

Create a folder with `.html` files. Each file becomes a route automatically:

```
my-project/
├── html-pages/
│   ├── index.html          ← /
│   ├── about.html          ← /about
│   ├── contact.html        ← /contact
│   └── blog/
│       ├── index.html      ← /blog
│       └── [slug].html     ← /blog/:slug (dynamic)
├── index.html
└── main.js
```

```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'html-pages',
}).start()
```

#### Links in HTML pages

Use `data-safa-link` attribute for client-side navigation:

```html
<a href="/about" data-safa-link>About</a>
<a href="/contact" data-safa-link>Contact</a>
```

#### Template Variables in HTML

HTML files support template placeholders that are resolved automatically:

```html
<!-- html-pages/profile/[id].html -->
<h1>User: {{ params.id }}</h1>
<p>Path: {{ path }}</p>
```

```html
<!-- html-pages/contact.html -->
<p>Subject: {{ query.subject }}</p>
```

```html
<!-- html-pages/loader.html (with route data loader) -->
<p>Server: {{ data.server }}</p>
<p>Timestamp: {{ data.timestamp }}</p>
```

---

### Route Configuration

For advanced control, define routes explicitly:

```js
import { SafaRouter } from 'safa-router'

const router = new SafaRouter({
  target: '#app',
  basePath: '/my-app',
  pageDir: 'html-pages',             // auto-resolve pages from here

  layout: 'html-pages/_layout.html', // global layout (HTML file)

  routes: {
    '/': {},                         // auto-resolves to html-pages/index.html

    '/blog': {
      children: {
        '[slug]': {},               // auto-resolves to html-pages/blog/[slug].html
      },
    },

    '/about': {},                    // auto-resolves to html-pages/about.html
    '/contact': {},                  // auto-resolves to html-pages/contact.html
  },
})

router.start()
```

When `page` is not specified for a route, the router automatically looks for an HTML file in `pageDir` that matches the route path. This means you can keep **all your content in HTML files** and use the route config only for structure, guards, loaders, and layouts.

You can also reference specific HTML files:

```js
routes: {
  '/': { page: 'index.html' },
  '/custom': { page: 'my-custom-page.html' },
}
```

---

### Smart Components (v1.4.0)

Components are named UI elements that render automatically on every page. They are ideal for headers, footers, navigation bars, and other persistent UI.

#### Defining Components

Components are functions that return an HTML string. They receive `{ path, router, params, query }`.

```js
// components/Header.js
export default function headerComponent({ path }) {
  return `
    <header>
      <nav>
        <a href="/" data-safa-link>Home</a>
        <a href="/about" data-safa-link>About</a>
        <a href="/blog" data-safa-link>Blog</a>
      </nav>
    </header>
  `
}
```

```js
// components/Footer.js
export default function footerComponent() {
  return `
    <footer>
      <p>Powered by SafaRouter</p>
    </footer>
  `
}
```

#### Registering Components

Pass `components` in the config:

```js
import headerComponent from './components/Header.js'
import footerComponent from './components/Footer.js'

const router = new SafaRouter({
  target: '#app',
  components: {
    header: headerComponent,
    footer: footerComponent,
  },
  // ... other config
})
```

#### Target Elements

Add `data-safa-component` attributes in your HTML where you want each component to render:

```html
<!-- index.html -->
<div data-safa-component="header"></div>

<main id="app">
  <!-- page content renders here -->
</main>

<div data-safa-component="footer"></div>
```

#### Active Link Highlighting

Components re-render on every navigation, so you can highlight the current page:

```js
export default function headerComponent({ path }) {
  return `
    <nav>
      <a href="/" data-safa-link class="${path === '/' ? 'active' : ''}">Home</a>
      <a href="/about" data-safa-link class="${path === '/about' ? 'active' : ''}">About</a>
    </nav>
  `
}
```

#### Template Resolution in Components

Components also support `{{ params }}`, `{{ query }}`, and `{{ data }}` template placeholders:

```js
export default function headerComponent({ path, params }) {
  return `
    <header>
      <span>Current user: {{ params.id }}</span>
    </header>
  `
}
```

#### How Components Work

1. Components are rendered after every page render (normal navigation, 404, errors)
2. Links inside components (`data-safa-link`) are automatically bound for client-side navigation
3. Components receive fresh context on every navigation
4. Multiple components are supported — just add more entries to `components`

### Per-route hideComponents (v1.4.3)

Hide specific smart components on individual routes using `meta.hideComponents`:

```js
routes: {
  '/sandbox': {
    meta: { hideComponents: ['footer'] },   // footer hidden, header visible
  },
  '/no-header': {
    meta: { hideComponents: ['header'] },   // header hidden, footer visible
  },
  '/plain': {
    meta: { hideComponents: true },          // both header and footer hidden
  },
}
```

- Accepts an array of component names to hide, or `true` to hide all components
- Works with any component registered in the `components` config

---

### Route Data Loaders (v1.3.0)

Loaders are async functions that fetch data before the page renders. The data is passed to the page component and is also available as `{{ data.x }}` in HTML templates.

```js
routes: {
  '/dashboard': {
    loader: async ({ params, query, router }) => {
      const response = await fetch('/api/dashboard')
      return await response.json()
    },
    // page receives data via {{ data.visitors }}, {{ data.revenue }}, etc.
  },
}
```

With HTML pages, the loaded data is available through template resolution:

```html
<!-- html-pages/dashboard.html -->
<div class="card">
  <h3>Visitors: {{ data.visitors }}</h3>
  <p>Revenue: {{ data.revenue }}</p>
</div>
```

The loader receives `{ params, query, router }` and must return an object or a promise that resolves to an object.

#### Loading State

You can show a loading indicator while the loader is running:

```js
routes: {
  '/slow': {
    loading: () => '<div class="spinner"><p>Loading…</p></div>',
    loader: async () => {
      await new Promise(r => setTimeout(r, 2000))
      return { data: 'loaded' }
    },
  },
}
```

---

### Route Guards (v1.3.0)

Guards protect routes from unauthorized access. They run before the page loads and can redirect to another route.

```js
routes: {
  '/dashboard': {
    guard: ({ params, query, router }) => {
      const token = localStorage.getItem('auth_token')
      if (!token) return '/login'  // redirect to login
      return true                  // allow access
    },
  },

  '/login': {},
}
```

- Return `true` to allow navigation
- Return a string (URL path) to redirect
- Return `false` to redirect to `/`

---

### Middleware

Middleware intercepts every navigation before it happens. Use it for global auth checks, analytics, logging, or redirects.

```js
router.use(async (ctx, next) => {
  console.log(`Navigating to: ${ctx.path}`)

  // Redirect if not authenticated
  if (ctx.path.startsWith('/admin') && !isAdmin()) {
    ctx.redirect = '/login'
    return
  }

  // Cancel navigation
  if (!featureEnabled) {
    ctx.cancelled = true
    return
  }

  return next()  // continue
})
```

**Context object:**

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | Target URL path |
| `method` | `string` | `'push'` or `'replace'` |
| `query` | `object` | URL query parameters |
| `redirect` | `string\|null` | Set to redirect |
| `cancelled` | `boolean` | Set to `true` to cancel |

---

### Layouts

Layouts wrap page content. They compose parent → child, allowing deeply nested layouts.

#### Global Layout

```js
const router = new SafaRouter({
  layout: ({ children, params, router }) => `
    <header>
      <nav>
        <a href="/" data-safa-link>Home</a>
        <a href="/blog" data-safa-link>Blog</a>
      </nav>
    </header>
    <main>${children}</main>
  `,
})
```

You can also use an HTML file as layout:

```js
const router = new SafaRouter({
  layout: 'html-pages/_layout.html',
})
```

Where `_layout.html` contains `{children}` as a placeholder:

```html
<!-- html-pages/_layout.html -->
<header>
  <nav>
    <a href="/" data-safa-link>Home</a>
    <a href="/blog" data-safa-link>Blog</a>
  </nav>
</header>
<main>{children}</main>
```

#### Per-route Layouts

```js
routes: {
  '/dashboard': {
    layout: ({ children }) => `
      <aside>Sidebar</aside>
      <div class="content">${children}</div>
    `,
    children: {
      settings: {},
    },
  },
}
```

Layouts compose: `globalLayout > dashboardLayout > page`.

---

### Dynamic Routes & Route Groups

#### Dynamic Segments

| Pattern | Example URL | params |
|---------|-------------|--------|
| `[slug]` | `/blog/my-post` | `{ slug: 'my-post' }` |
| `[...path]` | `/docs/guide/intro` | `{ path: ['guide', 'intro'] }` |
| `[[...path]]` | `/docs` | `{ path: [] }` |

```js
routes: {
  '/blog': {
    children: {
      '[slug]': {
        // page: auto-resolved from html-pages/blog/[slug].html
      },
    },
  },
}
```

#### Route Groups

Use `(groupName)` to organise routes without affecting the URL:

```js
routes: {
  '(main)': {
    children: {
      'profile': {
        children: {
          '[id]': {},
        },
      },
    },
  },
}
```

This makes `/profile/123` available without `/main/profile/123`.

---

### Error Handling

#### ErrorManager (v1.3.0)

The ErrorManager handles all HTTP status codes from 400 to 511. It provides per-status control, custom error pages, error grouping, and logging.

```js
const router = new SafaRouter({
  errors: {
    pageDir: 'html-pages/errors',   // custom error page directory
    stackTraces: true,               // show stack traces (dev mode)
  },
})
```

**Error page resolution order:**

1. `html-pages/errors/{statusCode}.html` (e.g. `403.html`, `404.html`)
2. `html-pages/errors/{group}.html` (e.g. `4xx.html` for all 4xx codes)
3. Built-in fallback

**Per-status control:**

```js
// Disable 404 handling
router.errorManager.setStatusEnabled(404, false)

// Disable all 5xx errors
router.errorManager.setGroupEnabled('server-error', false)

// Enable/disable statuses by group
router.errorManager.setGroupEnabled('client-error', true)
```

**Error groups:**

| Group | Status Codes |
|-------|-------------|
| `client-error` | 400–499 |
| `server-error` | 500–511 |
| `redirect` | 300–399 |
| `success` | 200–299 |
| `informational` | 100–199 |

**Custom error pages:**

Create HTML files in your error page directory:

```
html-pages/errors/
├── 403.html      ← shown for 403 Forbidden
├── 404.html      ← shown for 404 Not Found
├── 418.html      ← shown for 418 I'm a Teapot
├── 500.html      ← shown for 500 Server Error
├── 503.html      ← shown for 503 Service Unavailable
└── [code].html   ← dynamic error page with {{ params.code }}
```

#### Custom 404 and Error Components

```js
const router = new SafaRouter({
  notFound: ({ path, router, statusCode }) => `
    <h1>${statusCode} — ${path} not found</h1>
    <a href="/" data-safa-link>Back to home</a>
  `,

  error: ({ error, path, router, statusCode }) => `
    <h1>${statusCode} — Error</h1>
    <pre>${error.message}</pre>
  `,
})
```

#### AccessController (v1.3.0)

Control access to routes with blocked (403) and ignored (silent 404) patterns. Supports `*` (single level) and `**` (recursive) wildcards.

```js
const router = new SafaRouter({
  access: {
    blocked: ['/admin', '/private/**'],
    ignored: ['/hidden', '/deprecated/*'],
  },
})
```

##### Allowlist mode (v1.4.3)

By default the controller runs in **blocklist** mode — everything is allowed except `blocked` paths. Switch to **allowlist** mode to block everything **except** the paths in `allowed`:

```js
const router = new SafaRouter({
  access: {
    mode: 'allowlist',                  // block everything by default
    allowed: ['/login', '/public/**'],  // only these are accessible
  },
})
```

Runtime control:

```js
router.accessController.setMode('allowlist')       // switch to allowlist
router.accessController.setMode('blocklist')        // switch back to blocklist
router.accessController.allow('/sandbox')           // add to allowed
router.accessController.unallow('/sandbox')         // remove from allowed
router.accessController.getMode()                   // 'allowlist' | 'blocklist'
```

**Runtime control:**

```js
router.blockRoute('/api/temp')      // dynamically block a route
router.unblockRoute('/api/temp')    // unblock it
router.ignoreRoute('/old-page')     // dynamically ignore a route
router.unignoreRoute('/old-page')   // unignore it

// Check access
router.accessController.isAccessible('/admin')   // false
router.accessController.isAccessible('/about')    // true
```

**Events:**

```js
router.onAccessDenied(({ path, reason }) => {
  console.warn(`Access denied: ${path} — ${reason}`)
})
```

#### Maintenance Mode (v1.3.0)

Toggle a 503 maintenance mode with allowed path bypasses.

```js
const router = new SafaRouter({
  maintenanceMode: {
    enabled: false,
    allowedPaths: ['/login', '/assets/**'],
  },
})
```

**Runtime control:**

```js
router.setMaintenance(true)   // enable maintenance mode
router.setMaintenance(false)  // disable
router.isMaintenance()        // check status
router.reload()               // re-render current page
```

**Event:**

```js
router.onMaintenance(({ path }) => {
  console.info(`Maintenance blocked: ${path}`)
})
```

---

### Events

Subscribe to navigation lifecycle events:

| Event | Payload | Description |
|-------|---------|-------------|
| `beforenavigate` | `{ path, method }` | Before navigation starts |
| `beforerender` | `{ pathname }` | Before page render |
| `afterrender` | `{ pathname }` | After render completes |
| `routechange` | `{ pathname, params, query }` | Route changed |
| `loading` | `{ path, loading }` | Loading state changed |
| `notfound` | `{ path, statusCode }` | Route not found |
| `error` | `{ path, error, statusCode }` | Navigation error |
| `accessdenied` | `{ path, reason }` | AccessController blocked |
| `maintenance` | `{ path }` | Maintenance mode blocked |
| `ready` | `{ pathname }` | Router initialized |
| `destroy` | `{}` | Router destroyed |

```js
router.on('routechange', ({ pathname, params, query }) => {
  console.log('Navigated to', pathname)
})

router.on('error', ({ path, error, statusCode }) => {
  console.error(`Error ${statusCode} at ${path}:`, error.message)
})

router.afterEach(({ pathname }) => {
  // Fires after every successful navigation
})

router.onError(({ path, error, statusCode }) => {
  // Fires on navigation error
})

router.onMaintenance(({ path }) => {
  // Fires when maintenance mode blocks a route
})

router.onAccessDenied(({ path, reason }) => {
  // Fires when AccessController blocks a route
})
```

---

### Template Resolution (v1.4.0)

HTML files and components support template placeholders that are automatically resolved:

| Placeholder | Source | Example |
|-------------|--------|---------|
| `{{ path }}` | Current URL path | `/blog/my-post` |
| `{{ params.x }}` | Route parameters | `{{ params.slug }}` → `my-post` |
| `{{ query.x }}` | URL query parameters | `{{ query.page }}` → `2` |
| `{{ data.x }}` | Route data loader result | `{{ data.server }}` → `safa-router` |

```html
<!-- html-pages/blog/[slug].html -->
<h1>Post: {{ params.slug }}</h1>
<p>Path: {{ path }}</p>
```

```html
<!-- html-pages/contact.html -->
<h2>Query Params</h2>
<p>Subject: {{ query.subject }}</p>
<p>Language: {{ query.lang }}</p>
```

```html
<!-- html-pages/profile/[id].html -->
<h1>User Profile</h1>
<p>ID: {{ params.id }}</p>
```

Template resolution works in:
- HTML files loaded from `pageDir`
- Smart Component output
- Layout HTML files

---

### Per-route Transitions (v1.3.0)

Each route can define custom CSS transition effects:

```js
routes: {
  '/transition': {
    meta: {
      transition: {
        duration: 500,
        enterClass: 'fade-in',
        enterActiveClass: 'fade-in-active',
        exitClass: 'fade-out',
        exitActiveClass: 'fade-out-active',
      },
    },
  },
}
```

Transitions are applied when navigating to and from the route.

### Real-time Hot Reload (v1.4.3)

SafaRouter supports live updates — edit your HTML files and the page updates without a browser refresh.

**Client-side config:**

```js
const router = new SafaRouter({
  realtime: {
    enabled: true,          // enable real-time updates
    mode: 'sse',            // 'sse' (default), 'polling', or 'websocket'
    url: '/__realtime',     // SSE/WebSocket endpoint
    interval: 2000,         // polling interval (ms) — only used when mode='polling'
    onChange: null,         // optional custom handler(data, router)
  },
})
```

**How it works:**
1. The client connects to the realtime endpoint via `EventSource` (SSE), polling, or WebSocket
2. The dev server watches your HTML/component files for changes
3. When a file changes, the server sends an event to the client
4. The client clears its route cache and re-fetches the current page content (no full browser refresh)

**Custom handler example:**

```js
realtime: {
  enabled: true,
  onChange: (data, router) => {
    console.log(`File changed: ${data.path}`)
    if (data.path.endsWith('.css')) {
      // reload CSS without re-rendering
      document.querySelectorAll('link[rel=stylesheet]').forEach(el => {
        el.href = el.href.replace(/\?.*/, '') + '?' + Date.now()
      })
    }
  },
}
```

The built-in dev server (`SafaDevServer`) enables this automatically — see [DevServer](#safadevserver-v144) below.

---

### SafaDevServer (v1.4.4)

The `SafaDevServer` class provides a production-grade development server with SPA fallback, file watching, and SSE real-time updates — all in one import.

```js
import { SafaDevServer } from 'safa-router'

const server = new SafaDevServer({
  port: 3000,
  root: './test-app',          // directory to serve
  basePath: '/test-app',        // app base path (matches router.basePath)
  watch: true,                  // enable file watching + SSE
  srcDirs: ['./src'],           // serve source JS files (for bare import mapping)
  watchDirs: ['./test-app/html-pages', './test-app/components'],
})

server.start()
// Server: http://localhost:3000/test-app/
```

**Why SafaDevServer?**
- **SPA fallback** — refreshing on any route (e.g. `/about`) correctly serves `index.html`
- **File watching** — HTML/component changes trigger SSE events for real-time page updates
- **No bundler needed** — import your source files directly; the server serves them with correct MIME types
- **Zero-config routing** — all paths under `basePath` fall back to `index.html` for the SPA

**Minimal example:**

```js
import { SafaDevServer } from 'safa-router'

new SafaDevServer({ root: './dist' }).start()
```

Stop the server:
```js
server.stop()
```

---

### API Reference

#### `new SafaRouter(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `string\|Element` | `'#app'` | CSS selector or element to render into |
| `pageDir` | `string` | `undefined` | Folder with `.html` files for auto-routing |
| `layout` | `Function\|string` | `null` | Global layout (function or HTML file path) |
| `routes` | `object` | `{}` | Explicit route definitions |
| `components` | `object` | `{}` | Named components rendered on every page (v1.4.0) |
| `notFound` | `Function\|string` | `null` | Custom 404 page component |
| `error` | `Function\|string` | `null` | Custom error page component |
| `basePath` | `string` | `''` | Base path when app is served from subdirectory |
| `useHash` | `boolean` | `false` | Use `#hash` routing instead of History API |
| `realtime` | `object` | `{ enabled: false }` | Real-time update config (SSE/polling/WebSocket) — v1.4.3 |
| `scrollToTop` | `boolean` | `true` | Scroll to top on navigation |
| `cacheRoutes` | `boolean` | `true` | Cache loaded components |
| `maxCacheSize` | `number` | `50` | Maximum cached pages |
| `navigationTimeout` | `number` | `0` | Navigation timeout in ms (0 = no timeout) |
| `titleTemplate` | `string` | `null` | Document title template (e.g. `'%s — My App'`) |
| `transitionDuration` | `number` | `0` | Default transition duration in ms |
| `prefetchStrategy` | `string` | `'none'` | Prefetch strategy: `'none'`, `'visible'`, `'all'` |
| `errors.pageDir` | `string` | `undefined` | Custom error page directory (v1.3.0) |
| `errors.stackTraces` | `boolean` | `true` | Show stack traces in error pages (v1.3.0) |
| `access.blocked` | `string[]` | `[]` | Blocked route patterns (403) (v1.3.0) |
| `access.ignored` | `string[]` | `[]` | Ignored route patterns (silent 404) (v1.3.0) |
| `access.allowed` | `string[]` | `[]` | Allowed patterns in allowlist mode (v1.4.3) |
| `access.mode` | `string` | `'blocklist'` | `'blocklist'` or `'allowlist'` (v1.4.3) |
| `maintenanceMode.enabled` | `boolean` | `false` | Enable maintenance mode (v1.3.0) |
| `maintenanceMode.allowedPaths` | `string[]` | `[]` | Paths that bypass maintenance (v1.3.0) |
| `errorLogging.enabled` | `boolean` | `false` | Enable error logging (v1.3.0) |

#### Router Methods

| Method | Description |
|--------|-------------|
| `router.start(target?)` | Initialize and start the router |
| `router.push(url, state?)` | Navigate to URL (new history entry) |
| `router.replace(url, state?)` | Navigate (replace current history entry) |
| `router.back()` | Go back |
| `router.forward()` | Go forward |
| `router.reload()` | Re-render current route |
| `router.use(fn)` | Add middleware function |
| `router.on(event, fn)` | Subscribe to event |
| `router.off(event, fn)` | Unsubscribe from event |
| `router.afterEach(fn)` | Subscribe to successful navigation |
| `router.onError(fn)` | Subscribe to error events |
| `router.onMaintenance(fn)` | Subscribe to maintenance events (v1.3.0) |
| `router.onAccessDenied(fn)` | Subscribe to access denied events (v1.3.0) |
| `router.createLink(config)` | Create a Link instance |
| `router.prefetch(path)` | Preload a page |
| `router.clearCache()` | Clear component cache |
| `router.getRoute(path)` | Inspect a route definition |
| `router.destroy()` | Clean up and stop |

**v1.3.0 methods:**

| Method | Description |
|--------|-------------|
| `router.blockRoute(path)` | Dynamically block a route (403) |
| `router.unblockRoute(path)` | Remove a dynamic block |
| `router.ignoreRoute(path)` | Dynamically ignore a route (silent 404) |
| `router.unignoreRoute(path)` | Remove a dynamic ignore |
| `router.setMaintenance(bool)` | Toggle maintenance mode |
| `router.isMaintenance()` | Check maintenance mode status |
| `router.retry(path, options?)` | Retry navigation with retry count |

#### Router Properties

| Property | Type | Description |
|----------|------|-------------|
| `router.pathname` | `string` | Current URL path |
| `router.params` | `object` | Dynamic route parameters |
| `router.query` | `object` | URL query parameters |
| `router.loading` | `boolean` | Navigation in progress |
| `router.matchedRoute` | `object\|null` | Current matched route info |
| `router.currentRoute` | `object\|null` | Current route data |
| `router.errorManager` | `ErrorManager` | ErrorManager instance (v1.3.0) |
| `router.accessController` | `AccessController` | AccessController instance (v1.3.0) |

#### Route Definition

```js
{
  page: Function|string,       // Component or HTML file path
  layout: Function|string,     // Layout wrapping children
  children: { ... },           // Nested route definitions
  loading: Function|string,    // Loading component
  loader: Function,            // Async data loader (v1.3.0)
  guard: Function,             // Access guard (v1.3.0)
  error: Function|string,      // Per-route error component
  notFound: Function|string,   // Per-route 404 component
  meta: { title, transition }, // Route metadata
}
```

**Special segments:**

| Pattern | Example | Description |
|---------|---------|-------------|
| `[param]` | `[slug]` | Matches one path segment |
| `[...param]` | `[...path]` | Matches one or more segments |
| `[[...param]]` | `[[...tags]]` | Matches zero or more segments |
| `(group)` | `(auth)` | Route group — doesn't affect URL |

#### Component Signatures

Each component receives a context object:

```js
// Page component
({ params, query, router, data }) => HTML string

// Layout component
({ children, params, query, router, data }) => HTML string

// Loading component
({ path, router }) => HTML string

// Error component
({ error, path, router, statusCode }) => HTML string

// Not-found component
({ path, router, statusCode }) => HTML string

// Smart component (v1.4.0)
({ path, router, params, query }) => HTML string

// Route guard (v1.3.0)
({ params, query, router }) => true | false | redirectPath

// Route loader (v1.3.0)
({ params, query, router }) => Promise<data>
```

All renderable components must return an **HTML string**.

---

### Complete Demo Configuration

Here is a complete example showing all features together:

```js
import { SafaRouter } from 'safa-router'
import headerComponent from './components/Header.js'
import footerComponent from './components/Footer.js'

const router = new SafaRouter({
  target: '#app',
  basePath: '/my-app',
  pageDir: 'html-pages',
  layout: 'html-pages/_layout.html',

  components: {
    header: headerComponent,
    footer: footerComponent,
  },

  errors: {
    pageDir: 'html-pages/errors',
    stackTraces: true,
  },

  access: {
    blocked: ['/admin', '/private/**'],
    ignored: ['/hidden', '/deprecated/*'],
  },

  maintenanceMode: {
    enabled: false,
    allowedPaths: ['/login', '/assets/**'],
  },

  errorLogging: {
    enabled: true,
  },

  routes: {
    '/': {},

    '/blog': {
      children: {
        '[slug]': {},
      },
    },

    '/dashboard': {
      layout: dashboardLayout,
      children: {
        settings: {},
      },
    },

    '/slow': {
      loading: () => '<div class="spinner">Loading…</div>',
      loader: async () => {
        await new Promise(r => setTimeout(r, 1500))
      },
    },

    '/loader': {
      loader: async () => {
        const data = await fetch('/api/data')
        return data.json()
      },
    },

    '/guard': {
      guard: ({ router }) => {
        const authed = localStorage.getItem('auth') === 'true'
        return authed || '/login'
      },
    },

    '/transition': {
      meta: {
        transition: {
          duration: 500,
          enterClass: 'fade-in',
          enterActiveClass: 'fade-in-active',
          exitClass: 'fade-out',
          exitActiveClass: 'fade-out-active',
        },
      },
    },
  },
})

router.afterEach(({ pathname }) => {
  console.log(`Navigated to: ${pathname}`)
})

router.onError(({ path, error, statusCode }) => {
  console.warn(`Error at ${path}:`, error.message)
})

router.start()
```

---

### Running the Demo

```bash
cd safa-router
node dev-server.js
```

Then open `http://localhost:3000/test-app/`

The demo showcases:
- HTML pages with template resolution
- Nested layouts
- Dynamic routes (`[slug]`)
- Route groups
- Route data loaders
- Route guards
- AccessController (blocked/ignored routes)
- ErrorManager with custom error pages
- Maintenance mode
- Per-route transitions
- Smart Header/Footer components (v1.4.0)
- Sandbox for interactive testing
- Sitemap

---

### Migration Guide

#### From v1.3.x to v1.4.0

**What changed:**
- Routes without `page` auto-resolve from `pageDir`
- New `components` config option for persistent UI
- New `_resolveTemplate()` method for `{{ params }}` / `{{ query }}` / `{{ data }}` in HTML files
- All page content should be in HTML files (JS page files are deprecated)

**Migration steps:**

1. Move static page content from JS files to HTML files in `pageDir`
2. Remove `page` from routes that use auto-resolved HTML files
3. Optionally extract persistent UI (header, footer) into `components`
4. Add `data-safa-component` target elements to `index.html`

**Before (v1.3.x):**
```js
import homePage from './pages/home.js'
import aboutPage from './pages/about.js'

const router = new SafaRouter({
  pageDir: 'html-pages',
  routes: {
    '/': { page: homePage },
    '/about': { page: aboutPage },
  },
})
```

**After (v1.4.0):**
```js
const router = new SafaRouter({
  pageDir: 'html-pages',
  routes: {
    '/': {},
    '/about': {},
  },
})
```

#### From v1.2.x to v1.3.0

See the v1.3.0 CHANGELOG for migration details.

---

### License

[MIT](LICENSE) &copy; 2026 SafaRouter

---

<a id="persian"></a>

## فارسی

**صفا روتر** الگوی مسیریابی اپ روتِر نکست‌جی‌اس — لایه‌بندی‌های تو در تو، مسیرهای پویا، میان‌افزار، مدیریت خطا، کنترل دسترسی و کامپوننت‌های هوشمند — را به هر پروژه فرانت‌اندی می‌آورد.

با React، Vue، Svelte یا جاواسکریپت خالص کار می‌کند. وابستگی صفر، زیر ۵ کیلوبایت.

---

### نصب

```bash
npm install safa-router
```

---

### شروع سریع (فقط HTML)

```
my-project/
├── html-pages/
│   ├── index.html          ← /
│   ├── about.html          ← /about
│   └── blog/
│       └── [slug].html     ← /blog/:slug
├── index.html
└── main.js
```

```js
import { SafaRouter } from 'safa-router'

new SafaRouter({
  target: '#app',
  pageDir: 'html-pages',
}).start()
```

#### لینک‌ها

از `data-safa-link` استفاده کنید:

```html
<a href="/about" data-safa-link>درباره</a>
```

#### متغیرهای قالب

فایل‌های HTML از متغیرهای قالب پشتیبانی می‌کنند:

```html
<!-- html-pages/blog/[slug].html -->
<h1>مطلب: {{ params.slug }}</h1>
```

---

### کامپوننت‌های هوشمند (v1.4.0)

کامپوننت‌ها المان‌هایی هستند که در هر صفحه به صورت خودکار رندر می‌شوند:

```js
// components/Header.js
export default function headerComponent({ path }) {
  return `
    <header>
      <nav>
        <a href="/" data-safa-link>خانه</a>
        <a href="/about" data-safa-link>درباره</a>
      </nav>
    </header>
  `
}
```

ثبت در کانفیگ:

```js
import headerComponent from './components/Header.js'

const router = new SafaRouter({
  components: {
    header: headerComponent,
  },
})
```

محل رندر در HTML:

```html
<div data-safa-component="header"></div>
<main id="app"></main>
```

---

### مدیریت خطا (v1.3.0)

مدیریت تمام کدهای وضعیت HTTP از ۴۰۰ تا ۵۱۱ با صفحات خطای سفارشی:

```js
const router = new SafaRouter({
  errors: {
    pageDir: 'html-pages/errors',
  },
})
```

ساختار پوشه صفحات خطا:

```
html-pages/errors/
├── 403.html
├── 404.html
├── 500.html
└── 503.html
```

#### کنترل دسترسی (v1.3.0)

مسیرهای مسدود شده (۴۰۳) و نادیده گرفته شده (۴۰۴):

```js
const router = new SafaRouter({
  access: {
    blocked: ['/admin', '/private/**'],
    ignored: ['/hidden', '/deprecated/*'],
  },
})
```

#### حالت تعمیرات (v1.3.0)

```js
router.setMaintenance(true)   // فعال کردن حالت تعمیرات
router.setMaintenance(false)  // غیرفعال کردن
```

### مخفی‌سازی کامپوننت در مسیر خاص (v1.4.3)

کامپوننت‌ها را در مسیرهای خاص مخفی کنید:

```js
routes: {
  '/sandbox': {
    meta: { hideComponents: ['footer'] },
  },
  '/plain': {
    meta: { hideComponents: true },
  },
}
```

### به‌روزرسانی لحظه‌ای Real-time (v1.4.3)

فایل‌های HTML را ویرایش کنید — صفحه بدون رفرش مرورگر به‌روز می‌شود:

```js
const router = new SafaRouter({
  realtime: {
    enabled: true,
    mode: 'sse',
  },
})
```

### سرور توسعه SafaDevServer (v1.4.4)

```js
import { SafaDevServer } from 'safa-router'

new SafaDevServer({
  root: './test-app',
  basePath: '/test-app',
  watch: true,
}).start()
```

رفرش صفحه در هر مسیری درست کار می‌کند.

---

### راهنمای کامل API

| گزینه | نوع | پیش‌فرض | توضیح |
|-------|-----|---------|-------|
| `target` | `string\|Element` | `'#app'` | محل رندر |
| `pageDir` | `string` | `undefined` | پوشه فایل‌های HTML |
| `layout` | `Function\|string` | `null` | لِی‌اوت سراسری |
| `routes` | `object` | `{}` | تعریف مسیرها |
| `components` | `object` | `{}` | کامپوننت‌های هوشمند (v1.4.0) |
| `basePath` | `string` | `''` | مسیر پایه |
| `useHash` | `boolean` | `false` | مسیریابی هش |
| `realtime` | `object` | `{ enabled: false }` | تنظیمات به‌روزرسانی لحظه‌ای (v1.4.3) |
| `errors.pageDir` | `string` | `undefined` | پوشه صفحات خطا (v1.3.0) |
| `access.blocked` | `string[]` | `[]` | مسیرهای مسدود شده (v1.3.0) |
| `access.ignored` | `string[]` | `[]` | مسیرهای نادیده (v1.3.0) |
| `access.allowed` | `string[]` | `[]` | مسیرهای مجاز در حالت allowlist (v1.4.3) |
| `access.mode` | `string` | `'blocklist'` | `'blocklist'` یا `'allowlist'` (v1.4.3) |

#### رویدادها

| رویداد | توضیح |
|--------|-------|
| `routechange` | مسیر تغییر کرد |
| `error` | خطا رخ داد |
| `accessdenied` | دسترسی مسدود شد (v1.3.0) |
| `maintenance` | حالت تعمیرات فعال شد (v1.3.0) |
| `notfound` | صفحه پیدا نشد |

---

### اجرای دمو

```bash
cd safa-router
node dev-server.js
```

باز کنید: `http://localhost:3000/test-app/`

### مجوز

[MIT](LICENSE) &copy; 2026 SafaRouter
