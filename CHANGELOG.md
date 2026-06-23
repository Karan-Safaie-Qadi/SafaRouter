# Changelog

## v1.3.0 (2026-06-23)
- Major: Professional error system — ErrorManager supports ALL HTTP error status codes (400–511)
- Feat: Configurable error display — enable/disable per status code or per group (4xx/5xx)
- Feat: Custom error pages — upload arbitrary error HTML files, router auto-detects and renders them
- Feat: Error grouping — client-error (4xx) and server-error (5xx) groups with fallback pages
- Feat: Default error pages for every HTTP status code (inline HTML)
- Feat: Error logging — built-in logger with pluggable custom handlers
- Feat: Stack trace control — show/hide error stack traces based on `errors.stackTraces` config
- Feat: Error redirect rules — map one status code to another (e.g., 410 → 404)
- Feat: AccessController — block routes (403) and ignore routes (404 silently)
- Feat: Glob-style pattern matching for access rules (exact, `*` single-level, `**` recursive, trailing slash)
- Feat: Maintenance mode — toggleable 503 with allowed path bypasses
- Feat: `isMaintenance()`, `setMaintenance()`, `blockRoute()`, `unblockRoute()`, `ignoreRoute()`, `unignoreRoute()` APIs
- Feat: `retry()` public API with configurable retries
- Feat: `onAccessDenied()` / `onMaintenance()` convenience event listeners
- Feat: `EVENTS.ACCESS_DENIED` and `EVENTS.MAINTENANCE` events
- Feat: `deepMerge()` utility for deep config merging
- Feat: `HttpError`, `AccessDeniedError`, `MaintenanceModeError` error classes
- Feat: `HTTP_STATUS`, `HTTP_STATUS_TEXT`, `ERROR_GROUPS`, `ERROR_GROUP_MAP` constants
- Fix: `_handleNotFound` and `_handleError` now pass `statusCode` to context and ErrorManager
- Fix: `EVENTS.ERROR` now includes `statusCode` field
- Types: `ErrorManager` class, `AccessController` class, `ErrorConfig`, `AccessConfig`, `MaintenanceModeConfig`, `ErrorLoggingConfig`
- Types: `HttpError`, `AccessDeniedError`, `MaintenanceModeError`
- Types: `HTTP_STATUS`, `HTTP_STATUS_TEXT`, `ERROR_GROUPS`, `ERROR_GROUP_MAP`
- Types: `statusCode` on error events and page context
- Tests: 181 tests across 13 files (54 new tests for v1.3.0)
- Feat: route data loader (`loader` in route definition)
- Feat: declarative route guards (`guard` in route definition)
- Feat: per-route transition API (`meta.transition`)
- Feat: IntersectionObserver prefetch strategy (`prefetchStrategy: 'visible'`)
- Feat: `_updateTitle()` now called in 404/Error handlers
- Fix: `NavigationAbortError` thrown on cancelled navigation
- Fix: guard `pushRoute`/`getRoute` before `start()`
- Fix: `navigate()` deprecated with console.warn
- Fix: ScrollManager `window` guard for Node.js
- Fix: `_updateTitle()` guarded against missing `document`
- Fix: `IntersectionObserver` cleaned up in `destroy()`
- Types: `RouteLoader`, `RouteGuard`, `RouteTransitionConfig`, `RouteMatch.data`
- Types: `prefetchStrategy`, `perRouteTransitions` config options
- Types: `navigate()` marked `@deprecated`
- Docs: CHANGELOG.md covering v1.0.1 through v1.2.9
- Tests: 127 tests across 10 files (12 new tests for new features)

## v1.2.7 (2026-06-23)
- Fix: redirect loop now resets `_isLoading = false` and calls `_abortFetch()`
- Fix: `prefetch()` no longer adds `<link rel="prefetch">` for non-existent pages
- Fix: `_prefetched.clear()` added to `destroy()` cleanup
- Fix: `_addPrefetchLink()` only prefetches the URL that actually succeeded
- Fix: `useRouter` dead `disposed` variable replaced with `active` guard

## v1.2.6 (2026-06-23)
- Fix: ScrollManager unique element IDs (`_elId`) preventing key collisions
- Feat: AbortController to cancel in-flight HTTP requests on new navigation
- Feat: `navigationTimeout: 15000` config option to prevent stuck loading
- Feat: `<link rel="prefetch">` added to `<head>` in `prefetch()`
- Fix: static version string updated to 1.2.6

## v1.2.5 (2026-06-23)
- Feat: LRU cache with `maxCacheSize: 50` config option
- Feat: `buildQuery()` helper function and public `parseQuery` export
- Fix: Link active state uses `isSamePath()` to avoid false positives
- Fix: `useRouter` auto-cleanup on `destroy` event
- Fix: `_handleNotFound` passes `state` to `history.push`/`replace`
- Feat: Redirect loop emits `EVENTS.ERROR` event

## v1.2.4 (2026-06-23)
- Fix: catch-all optional params now set to `[]` when empty
- Fix: duplicate `path + query` in URL parsing
- Fix: `_findDynamic` excludes `[[...` optional catch-all patterns
- Fix: `pagesDir` cache disabled (no file system cache)
- Fix: `notFound` in `pagesDir` mode provides `navId`
- Fix: `extractParamName` handles `[[...slug]]` syntax
- Fix: remove duplicate `isRouteGroup`/`isRouteGroupSegment` exports
- Fix: `_handleNotFound` clears stale `_routeData`

## v1.2.3 (2026-06-23)
- Fix: `loading` component provides correct `navId`
- Fix: `notFound`/`error` components get correct `navId`
- Feat: per-route error handler support
- Fix: layout components receive `query` in context
- Fix: plugin middleware cleanup on eject
- Fix: Link component re-renders on `render()` re-call
- Feat: forward navigation events support
- Fix: `back()` passes correct path
- Fix: popstate navigation respects `scrollToTop`
- Fix: dynamic `import()` replaced with `fetch()` for HTML pages
- Fix: `parseQuery` returns arrays for duplicate keys
- Fix: `isExternalURL` handles `mailto:`, `tel:`, `fax:`
- Fix: `stringify()` safe with `$` in values
- Fix: hashchange listener in hash mode
- Fix: `renderRoute` is `async` in SSR
- Fix: `prefetchOnHover` returns cleanup function
- Fix: `link-helper` deprecated exports removed

## v1.2.2 (2026-06-23)
- Fix: `target=_blank` links ignored
- Fix: invalid URL no longer crashes
- Fix: redirect preserves query parameters
- Fix: `notFound`/`error` components rendered with proper layout
- Fix: history update after render
- Fix: `link-helper` deprecation warning
- Fix: `_isLoading` reset on all early-return paths
- Feat: `beforeRender`/`afterRender` hooks
- Fix: Link no-router fallback
- Fix: popstate conflict resolution
- Fix: SSR query parameter support
- Fix: `scrollRestoration` removed from DEFAULT_CONFIG
- Fix: `scrollToTop` defaults to `true`
- Fix: DOMParser-based title extraction (with regex fallback)
- Fix: duplicate `back` event suppression

## v1.2.1 (2026-06-23)
- Fix: PluginManager async install support
- Fix: Transitions race condition — `_cancel()` clears timer
- Fix: `router.back()` uses sync event emission
- Fix: `joinPaths()` reverted to v1.1.0 behavior (no forced leading `/`)
- Fix: `scrollTo` compat — replaced `behavior: instant` with direct call
- Fix: `matchedRoute` deprecation warning
- Fix: `_findDynamic` skips catch-all segments

## v1.2.0 (2026-06-23)
- Feat: SSR support (`matchRoute`, `renderRoute`, `routeExists`, `listRoutes`)
- Feat: Plugin System (`PluginManager`)
- Feat: Middleware Priority system
- Feat: Transitions API (`TransitionsManager`)
- Feat: ScrollManager for scroll position memory
- Feat: Code Splitting (`import()` for route components)
- Feat: TypeScript type definitions
- Feat: Vitest test suite (97 tests, 9 test files)
- Feat: `exports` map with `types` field

## v1.1.2 (2026-06-23)
- Fix: `OPTIONAL_CATCH_ALL` regex improved
- Fix: page function arguments
- Fix: Link.active false positive
- Fix: middleware redirect loop (depth 10 limit)
- Fix: race condition (navId + stale check pattern)
- Fix: scroll conflict resolution
- Fix: `stringify()` `replaceAll` compat
- Chore: removed dead `_seedMatcher`/`_matcher`

## v1.1.1 (2026-06-23)
- Fix: repository URLs migrated (`pishro-dev` → `Karan-Safaie-Qadi`)

## v1.1.0 (2026-06-23)
- Feat: nested `pageDir` support
- Feat: dynamic HTML `[param]` placeholders
- Feat: HTML layout with `{children}` placeholder
- Feat: auto `<title>` extraction from HTML
- Feat: scroll memory per pathname
- Feat: special HTML pages (`loading.html`, `error.html`, `not-found.html`)
- Feat: `beforeEach`/`afterEach` middleware
- Feat: `_globalLayout` wrapping

## v1.0.1 (2026-06-23)
- Initial npm release
