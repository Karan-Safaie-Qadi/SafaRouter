# Migration Guide

## v1.3.x → v1.4.x

### What Changed
- **Smart Components system** (`components`) — define reusable header/footer/etc. components rendered via `_renderComponents`
- **Component templates** — `{{ params }}`, `{{ query }}`, `{{ data }}` placeholders resolved inside component HTML
- **Auto-resolved `page`** — if a route omits `page`, it resolves from `pageDir` + route path automatically
- **Component link binding** — `data-safa-link` now works inside component output
- All **JS page exports** removed from `test-app/pages/` (21 files) — HTML-first routing is now the only pattern
- `test-app/layouts/root.js` removed — layouts use HTML files with `{children}` placeholders

### How to Update
1. **Replace JS page exports** with HTML files in your `pageDir`. Each route expects an `.html` file matching its path.
2. **Migrate layouts** from JS to HTML using the `{children}` placeholder syntax.
3. **If you used custom rendered layouts**, move that logic into the `components` config as smart components.
4. **No other breaking API changes** — all core router APIs remain the same.

---

## v1.4.x → v1.5.0

### What Changed

#### Per-Route `meta.hideComponents`
Hide specific smart components per route via `meta.hideComponents`.
```js
routes: {
  '/login': {
    meta: { hideComponents: ['header', 'footer'] }
  }
}
```
- Pass `true` to hide all components
- Pass an array of component names to hide selectively

#### Access Allowlist Mode
New `access.mode: 'allowlist'` inverts the default blocklist logic:
```js
{
  access: {
    mode: 'allowlist',
    allowed: ['/public/**']
  }
}
```
- `access.allowed` defines which paths are permitted
- Everything else is blocked by default
- `blocked` and `ignored` patterns still apply on top of the allowlist

#### RealtimeManager
New `RealtimeManager` class for hot-reload during development:
```js
const router = new SafaRouter({
  realtime: {
    enabled: true,
    mode: 'sse',      // 'sse' | 'polling' | 'websocket'
    interval: 2000,   // polling interval in ms
    endpoint: '/api/realtime',
  }
})
```
- Supports SSE (default), polling, and WebSocket modes
- Auto-reloads the page when file changes are detected

#### `EVENTS.REALTIME_CHANGE` Event
New event constant emitted when a realtime update is received:
```js
router.on(EVENTS.REALTIME_CHANGE, (data) => {
  console.log('Files changed:', data.changed)
})
```

#### SafaDevServer
New standalone dev server class, importable directly:
```js
import { SafaDevServer } from 'safa-router/dev-server'

const server = new SafaDevServer({
  root: '.',
  port: 3000,
  watch: true,
  spa: true,
})
server.start()
```
- Built-in SPA fallback (404 → index.html)
- File watching with SSE realtime endpoint
- Replaces the previous `dev-server.js` script (now 6 lines thin)

#### Demo Pages Added
- `no-header.html`, `plain.html` — showcase `hideComponents`
- `allowlist-demo.html` — demonstrate allowlist access mode

### What's Deprecated
- **Direct `dev-server.js` script usage** in production — use `SafaDevServer` class instead
- The old `dev-server.js` still works (it's just a thin wrapper now)

### How to Update
1. **No breaking changes** — v1.5.0 is fully backward-compatible with v1.4.x
2. **To use `hideComponents`**, add `meta.hideComponents` to your route configs
3. **To use allowlist mode**, set `access.mode: 'allowlist'` and define `access.allowed`
4. **To enable realtime**, add the `realtime` config to your router
5. **For dev server**, replace `node dev-server.js` with your own script using `SafaDevServer` for full control
6. **Listen to `EVENTS.REALTIME_CHANGE`** if you need custom realtime update handling

---

> See the full [CHANGELOG.md](../CHANGELOG.md) for a detailed list of all changes.
