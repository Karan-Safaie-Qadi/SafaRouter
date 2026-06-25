# Changelog

All notable changes to SafaRouter will be documented in this file.

## [1.5.0] - 2026-06-25

### Added
- **TypeScript definitions**: `RealtimeManager`, `SafaDevServer`, `DevServerConfig`, `hideComponents` in `RouteEntry.meta`, allowlist mode (`AccessConfig.allowed`, `AccessConfig.mode`), `EVENTS.REALTIME_CHANGE`, `AccessController.setMode`, `getMode`, `allow`, `unallow`
- **Test suites**: allowlist mode (6 tests), hideComponents (3 tests), RealtimeManager (9 tests), SafaDevServer (5 tests) — 204 total, all passing
- **Demo pages**: React integration (`react-demo.html`), Vue integration (`vue-demo.html`), Svelte integration (`svelte-demo.html`), Vanilla JS integration (`vanilla-demo.html`), FAQ (`faq.html`), Benchmarks & comparison (`benchmarks.html`), Features showcase (`features.html`)
- `docs/MIGRATION_GUIDE.md` — upgrade paths from v1.3.x and v1.4.x
- `docs/README.md` — documentation index
- `.github/ISSUE_TEMPLATE/bug_report.md` + `feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md` + `.github/workflows/ci.yml` (Node 18/20/22)
- `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.editorconfig`, `.npmignore`

### Changed
- `package.json`: docx moved to devDependencies (zero runtime dependencies preserved), keywords expanded, author set, `dev` script alias added
- `safa-router.d.ts`: full type coverage for v1.4.3–v1.4.4 features
- `README.md`: TOC, badges (CI, npm, license), integration examples (React/Vue/Svelte/Vanilla), FAQ, comparison table, troubleshooting, architecture overview, performance section — English + Persian
- Refactored `SafaRouter._renderWithLayouts()` — centralized rendering logic, removed ~100 lines of duplication
- Improved error messages (redirect loops include path, URL parse warnings)

### Removed
- Dead code: unused `_retry` method, unused imports (`ERROR_GROUPS`, `AccessDeniedError`), legacy `test-app/html-pages/vanilla-js-demo.html` (duplicate)

## [1.4.4] - 2026-06-25

### Fixed
- `_bindLinks()` now called on 404 and error pages (`_handleNotFound`, `_handleError`) so `data-safa-link` works everywhere
- Safe guard on `_bindLinks` / `_observeLinks` for non-DOM environments

### Added
- `SafaDevServer` class — importable dev server with SPA fallback, file watching, SSE realtime
- `src/DevServer.js` — clean class-based dev server

### Changed
- `dev-server.js` simplified to 6 lines using `SafaDevServer`
- Full README update: hideComponents, allowlist, realtime, DevServer (EN + FA)

## [1.4.3] - 2026-06-25

### Added
- Per-route `meta.hideComponents` — hide specific smart components per route
- Access allowlist mode (`access.mode: 'allowlist'` + `access.allowed`)
- `RealtimeManager` — SSE/polling/WebSocket hot reload
- `EVENTS.REALTIME_CHANGE` event
- Demo pages: `no-header`, `plain`, `allowlist-demo`
- Real-time file watching in dev-server with SSE endpoint

## [1.4.2] - 2026-06-25

### Fixed
- SPA fallback on page refresh (dev-server.js)
- Bare module specifier via importmap in index.html

### Changed
- `"start"` script now uses `node dev-server.js` (was `npx serve`)

## [1.4.1] - 2026-06-24

### Added
- Comprehensive bilingual README (EN + FA)
- `document.txt` with full plain-text docs
- `SafaRouter-Guide.docx` — Persian RTL Word document

## [1.4.0] - 2026-06-24

### Added
- Smart Components system (`_components`, `_renderComponents`)
- Component template resolution (`{{ params }}`, `{{ query }}`, `{{ data }}`)
- Routes auto-resolve `page` from `pageDir` when omitted
- 18 HTML pages in `html-pages/` covering all demo routes
- Component link binding (`data-safa-link` in components)
- Header/Footer components with active link highlighting

### Removed
- All JS page exports from `test-app/pages/` (21 files deleted)
- `test-app/layouts/root.js` (unused)

## [1.3.0] - 2026-06-20

### Added
- ErrorManager: HTTP status 400-511, custom error pages, grouping, logging
- AccessController: blocked (403) / ignored (404) with glob patterns
- Maintenance Mode: 503 toggle with allowed path bypasses
- Route Data Loaders: async data fetching before page render
- Route Guards: per-route guard functions with redirect
- Per-route Transitions: custom CSS transition effects
- Runtime API: `blockRoute`, `unblockRoute`, `ignoreRoute`, `unignoreRoute`
- Events: `onError`, `onMaintenance`, `onAccessDenied`
- `retry()` method for failed navigation retries
- Error pages for 403, 404, 500, 503 (HTML and CSS)
- `api.html` — programmatic API demo page

## [1.2.0] - 2026-06-15

### Added
- Route caching with configurable `maxCacheSize`
- Route prefetching with IntersectionObserver
- `afterEach` navigation hook
- `Link` helper class
- Plugin system
- Scroll position restore
- Focus management on route change
- `navigate()` deprecation warning

## [1.1.0] - 2026-06-10

### Added
- Nested layouts with parent→child composition
- Dynamic route segments: `[slug]`, `[...catchAll]`, `[[...optional]]`
- Route groups `(groupName)`
- Middleware chain with priority and named middleware
- Title template support
- HTML file based layouts with `{children}` placeholder
- `_fetchSpecial` for loading/non-found/error HTML files

## [1.0.0] - 2026-06-05

### Added
- Core routing engine with History API
- HTML-first routing: `.html` files as routes
- Route configuration object
- Client-side navigation: push, replace, back, forward
- Event system: beforenavigate, routechange, beforerender, afterrender, error, notfound, loading, ready, destroy
- Base path support
- Hash routing support
- Error boundaries and loading states
- Global notFound and error components
- Route matching and resolution
