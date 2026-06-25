declare module 'safa-router' {
  // ─── Core ─────────────────────────────────────────
  export class SafaRouter {
    static version: string
    static VERSION: string

    constructor(options?: SafaRouterOptions)
    start(target?: string | Element): Promise<this>
    isStarted(): boolean
    destroy(): void

    push(url: string, state?: Record<string, any>): Promise<void>
    replace(url: string, state?: Record<string, any>): Promise<void>
    pushRoute(routeName: string, params?: Record<string, any>, query?: Record<string, any>): Promise<void>
    back(): void
    forward(): void
    reload(): void
    /** @deprecated Use push() instead */
    navigate(url: string): Promise<void>
    retry(path: string, options?: { method?: string; query?: Record<string, any>; state?: Record<string, any>; depth?: number; retries?: number }): Promise<void>

    getConfig(): SafaRouterOptions
    readonly pathname: string
    readonly params: Record<string, any>
    readonly query: Record<string, any>
    readonly loading: boolean
    readonly currentRoute: RouteMatch | null
    readonly matchedRoute: RouteMatch | null

    on(event: string, fn: (data: any) => void): () => void
    off(event: string, fn: (data: any) => void): void
    use(fn: MiddlewareFn): this
    useNamed(name: string, fn: MiddlewareFn, priority?: number): this
    beforeEach(fn: MiddlewareFn): this
    afterEach(fn: (data: { pathname: string }) => void): () => void
    middleware(name: string): this
    insertMiddlewareBefore(refName: string, fn: MiddlewareFn, priority?: number): this
    insertMiddlewareAfter(refName: string, fn: MiddlewareFn, priority?: number): this

    onError(fn: (data: { path: string; error: Error; statusCode?: number }) => void): () => void
    onNotFound(fn: (data: { path: string; statusCode?: number }) => void): () => void
    onRouteChange(fn: (data: { pathname: string; params: any; query: any }) => void): () => void
    onBeforeNavigate(fn: (data: { path: string; method: string }) => void): () => void
    onAccessDenied(fn: (data: { path: string; reason?: string }) => void): () => void
    onMaintenance(fn: (data: { path: string }) => void): () => void

    createLink(config: LinkConfig): Link
    prefetch(path: string): Promise<void>
    clearCache(): void
    getRoute(path: string): RouteMatch | null

    plugin(plugin: SafaPlugin): this
    ejectPlugin(name: string): boolean
    getPlugin(name: string): any
    readonly plugins: string[]

    readonly errorManager: ErrorManager
    readonly accessController: AccessController
    isMaintenance(): boolean
    setMaintenance(enabled: boolean, opts?: { page?: string; component?: any; allowedPaths?: string[] }): void
    blockRoute(pattern: string): this
    unblockRoute(pattern: string): this
    ignoreRoute(pattern: string): this
    unignoreRoute(pattern: string): this
  }

  export interface ErrorConfig {
    enabled?: boolean
    stackTraces?: boolean
    pageDir?: string | null
    status?: {
      [statusCode: number]: {
        enabled?: boolean
        page?: string | null
        component?: any | null
        redirect?: number | null
      }
    }
    groups?: {
      'client-error'?: { enabled?: boolean; page?: string | null; component?: any | null }
      'server-error'?: { enabled?: boolean; page?: string | null; component?: any | null }
    }
    redirect?: { [statusCode: number]: number }
  }

  export interface AccessConfig {
    blocked?: string[]
    ignored?: string[]
    allowed?: string[]
    mode?: 'blocklist' | 'allowlist'
  }

  export interface RealtimeConfig {
    enabled?: boolean
    mode?: 'sse' | 'polling' | 'websocket'
    url?: string
    interval?: number
    onChange?: ((data: { changed: boolean; path: string | null; time: number }, router: SafaRouter) => void) | null
  }

  export interface MaintenanceModeConfig {
    enabled?: boolean
    page?: string | null
    component?: any | null
    allowedPaths?: string[]
  }

  export interface ErrorLoggingConfig {
    enabled?: boolean
    handler?: ((entry: { statusCode: number; path: string; error: Error; timestamp: number }) => void) | null
  }

  export interface SafaRouterOptions {
    target?: string | Element
    pageDir?: string
    pagesDir?: string
    layout?: LayoutComponent | string
    routes?: RouteDefinition
    notFound?: PageComponent | string
    error?: PageComponent | string
    basePath?: string
    useHash?: boolean
    scrollToTop?: boolean
    prefetch?: boolean
    prefetchStrategy?: 'hover' | 'visible' | 'all'
    cacheRoutes?: boolean
    maxCacheSize?: number
    navigationTimeout?: number
    titleTemplate?: string
    transitionDuration?: number
    transitionEnterClass?: string
    transitionExitClass?: string
    transitionEnterActiveClass?: string
    transitionExitActiveClass?: string
    perRouteTransitions?: boolean
    plugins?: SafaPlugin[]
    errors?: ErrorConfig
    access?: AccessConfig
    maintenanceMode?: MaintenanceModeConfig
    errorLogging?: ErrorLoggingConfig
    realtime?: RealtimeConfig
    components?: Record<string, (ctx: PageContext) => string>
  }

  // ─── ErrorManager ────────────────────────────────
  export class ErrorManager {
    constructor(config?: Record<string, any>)
    getStatusConfig(statusCode: number): { enabled: boolean; page: string | null; component: any | null; redirect: number | null; group: string }
    isEnabled(statusCode: number): boolean
    getRedirect(statusCode: number): number | null
    getDefaultPage(statusCode: number): string
    loadCustomPage(statusCode: number, pageDir: string | null, signal?: AbortSignal): Promise<string | null>
    resolvePage(statusCode: number, pageDir: string | null, signal?: AbortSignal): Promise<string>
    formatError(error: Error | null, showStack?: boolean): string
    clearCache(): void
    setStatusEnabled(statusCode: number, enabled: boolean): void
    setGroupEnabled(group: string, enabled: boolean): void
    setLogHandler(handler: ((entry: { statusCode: number; path: string; error: Error; timestamp: number }) => void) | null): void
    getLogHandler(): ((entry: { statusCode: number; path: string; error: Error; timestamp: number }) => void) | null
    log(statusCode: number, path: string, error: Error): void
  }

  // ─── AccessController ────────────────────────────
  export class AccessController {
    constructor(config?: Record<string, any>)
    setMode(mode: 'blocklist' | 'allowlist'): void
    getMode(): 'blocklist' | 'allowlist'
    block(pattern: string): void
    unblock(pattern: string): void
    ignore(pattern: string): void
    unignore(pattern: string): void
    allow(pattern: string): void
    unallow(pattern: string): void
    isBlocked(path: string): AccessDeniedError | null
    isIgnored(path: string): boolean
    isAccessible(path: string): boolean
  }

  // ─── RealtimeManager ──────────────────────────────
  export class RealtimeManager {
    constructor(router: SafaRouter, config?: RealtimeConfig)
    start(): void
    destroy(): void
  }

  // ─── DevServer ──────────────────────────────────────
  export interface DevServerConfig {
    port?: number
    root?: string
    basePath?: string
    watch?: boolean
    watchDirs?: string[]
    srcDirs?: string[]
  }

  export class SafaDevServer {
    constructor(config?: DevServerConfig)
    start(): this
    stop(): this
  }

  // ─── Route Tree ───────────────────────────────────
  export interface RouteDefinition {
    [key: string]: RouteEntry
  }

  export interface RouteEntry {
    page?: PageComponent | string
    layout?: LayoutComponent | string
    loading?: PageComponent | string
    error?: PageComponent | string
    notFound?: PageComponent | string
    children?: RouteDefinition
    meta?: { title?: string; name?: string; requiresAuth?: boolean; roles?: string[]; hideComponents?: string[] | boolean; [key: string]: any }
    loader?: RouteLoader
    guard?: RouteGuard
    transition?: RouteTransitionConfig
  }

  export type RouteLoader = (ctx: PageContext) => Record<string, any> | Promise<Record<string, any>>

  export type RouteGuard = (ctx: PageContext) => boolean | string | Promise<boolean | string>

  export interface RouteTransitionConfig {
    duration?: number
    enterClass?: string
    exitClass?: string
    enterActiveClass?: string
    exitActiveClass?: string
  }

  export interface RouteMatch {
    node: RouteNodeData
    params: Record<string, any>
    layouts: LayoutComponent[]
    data?: Record<string, any>
  }

  export interface RouteNodeData {
    page?: PageComponent | string
    layout?: LayoutComponent | string
    loading?: PageComponent | string
    error?: PageComponent | string
    notFound?: PageComponent | string
    meta?: Record<string, any>
    segment?: string
    fullPath?: string
  }

  // ─── Components ───────────────────────────────────
  export interface PageContext {
    params: Record<string, any>
    query: Record<string, any>
    router: SafaRouter
    data?: Record<string, any>
    statusCode?: number
  }

  export interface LayoutContext extends PageContext {
    children: string
  }

  export type PageComponent = (ctx: PageContext) => string | Promise<string>
  export type LayoutComponent = (ctx: LayoutContext) => string | Promise<string>

  // ─── Middleware ────────────────────────────────────
  export interface MiddlewareContext {
    path: string
    method: string
    query: Record<string, any>
    cancelled: boolean
    redirect: string | null
    [key: string]: any
  }

  export type MiddlewareFn = (ctx: MiddlewareContext, next: () => Promise<any>) => any

  export class MiddlewareChain {
    constructor()
    use(fn: MiddlewareFn, priority?: number): this
    useNamed(name: string, fn: MiddlewareFn, priority?: number): this
    run(ctx: MiddlewareContext): Promise<any>
    clear(): this
    remove(fn: MiddlewareFn | string): this
    insertBefore(refName: string, fn: MiddlewareFn, priority?: number): this
    insertAfter(refName: string, fn: MiddlewareFn, priority?: number): this
    clone(): MiddlewareChain
    readonly length: number
    readonly stack: { name: string; priority: number }[]
  }

  // ─── History ───────────────────────────────────────
  export class HistoryManager {
    constructor(opts?: { useHash?: boolean; basePath?: string })
    init(): void
    destroy(): void
    isSupported(): boolean
    readonly path: string
    push(url: string, state?: Record<string, any>): void
    replace(url: string, state?: Record<string, any>): void
    back(): void
    forward(): void
    go(delta: number): void
    readonly length: number
    readonly state: any
    clearState(): void
    onChange(fn: (data: { path: string; action: string; state: any }) => void): () => void
  }

  // ─── Link ──────────────────────────────────────────
  export interface LinkConfig {
    href?: string
    children?: string | Node | Node[]
    className?: string
    activeClass?: string
    router?: SafaRouter
    attrs?: Record<string, string>
  }

  export class Link {
    constructor(config?: LinkConfig)
    readonly href: string
    readonly element: HTMLAnchorElement | null
    render(container?: string | Node): HTMLAnchorElement
    setHref(href: string): void
    destroy(): void
  }

  // ─── Route Tree Core ───────────────────────────────
  export class RouteTree {
    constructor(routes: RouteDefinition)
    static create(routes: RouteDefinition): RouteTree
    resolve(pathname: string): RouteMatch | null
    flatten(): { path: string; page: any; meta: any }[]
    find(pathname: string): RouteMatch | null
    getRoute(pathname: string): RouteMatch | null
  }

  // ─── Route Matcher ─────────────────────────────────
  export class RouteMatcher {
    constructor()
    static create(patterns: string[]): RouteMatcher
    add(pattern: string): this
    addMultiple(patterns: string[]): this
    match(url: string): { pattern: string; path: string; params: Record<string, any> } | null
    build(pattern: string, params: Record<string, any>): string
    clear(): this
    readonly patterns: string[]
  }

  // ─── Plugin System ────────────────────────────────
  export interface SafaPlugin {
    name: string
    version?: string
    install?: (router: SafaRouter) => void | (() => void) | Promise<void | (() => void)>
    middleware?: MiddlewareFn
    onBeforeNavigate?: (data: { path: string; method: string }) => void
    onAfterNavigate?: (data: { pathname: string }) => void
    onBeforeRender?: (data: { pathname: string }) => void
    onAfterRender?: (data: { pathname: string }) => void
    onRouteChange?: (data: { pathname: string; params: any; query: any }) => void
    onError?: (data: { path: string; error: Error; statusCode?: number }) => void
  }

  export class PluginManager {
    constructor(router: SafaRouter)
    use(plugin: SafaPlugin): this
    eject(name: string): boolean
    get(name: string): SafaPlugin | null
    list(): string[]
    has(name: string): boolean
    ejectAll(): void
    readonly count: number
  }

  // ─── Transitions ──────────────────────────────────
  export interface TransitionsConfig {
    transitionDuration?: number
    transitionEnterClass?: string
    transitionExitClass?: string
    transitionEnterActiveClass?: string
    transitionExitActiveClass?: string
  }

  export class TransitionsManager {
    constructor(config?: TransitionsConfig)
    run(el: Element, renderFn: () => Promise<void> | void): Promise<void>
    cancelExit(el: Element): void
    cancelEnter(el: Element): void
    setDuration(ms: number): void
    readonly config: TransitionsConfig
  }

  // ─── Scroll ────────────────────────────────────────
  export class ScrollManager {
    constructor()
    save(pathname: string): void
    restore(pathname: string, scrollToTop?: boolean): void
    trackScrollElement(el: HTMLElement): void
    untrackScrollElement(el: HTMLElement): void
    restoreElementScroll(pathname: string, container: HTMLElement): void
    clear(): void
    has(pathname: string): boolean
    readonly size: number
  }

  // ─── SSR ───────────────────────────────────────────
  export function matchRoute(path: string, routes?: RouteDefinition): {
    path: string
    params: Record<string, any>
    query: Record<string, any>
    node: RouteNodeData
    layouts: LayoutComponent[]
  } | null

  export function matchPattern(path: string, patterns?: string[]): {
    pattern: string
    path: string
    params: Record<string, any>
  } | null

  export function renderRoute(path: string, routes?: RouteDefinition, context?: { router?: SafaRouter }): Promise<string | null>

  export function routeExists(path: string, routes?: RouteDefinition): boolean

  export function listRoutes(routes?: RouteDefinition): { path: string; page: any; meta: any }[]

  // ─── Utils ─────────────────────────────────────────
  export function normalizePath(path: string): string
  export function parseQuery(search: string): Record<string, string | string[]>
  export function buildQuery(params: Record<string, string | string[] | undefined | null>): string
  export function joinPaths(...parts: string[]): string
  export function createURL(path: string, base?: string): URL | null
  export function isExternalURL(url: string): boolean
  export function isSamePath(a: string, b: string): boolean
  export function isDynamicSegment(segment: string): boolean
  export function isCatchAllSegment(segment: string): boolean
  export function isOptionalCatchAll(segment: string): boolean
  export function isRouteGroupSegment(segment: string): boolean
  export function extractParamName(segment: string): string | null
  export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T
  export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T
  export function useRouter(router: SafaRouter): {
    readonly state: { pathname: string; params: any; query: any; loading: boolean }
    subscribe(fn: (state: any) => void): () => void
    push: SafaRouter['push']
    replace: SafaRouter['replace']
    back: SafaRouter['back']
    forward: SafaRouter['forward']
    navigate: SafaRouter['navigate']
    unsubscribe: () => void
  }

  // ─── Constants ──────────────────────────────────────
  export const EVENTS: {
    BEFORE_NAVIGATE: 'beforenavigate'
    NAVIGATE: 'navigate'
    ROUTE_CHANGE: 'routechange'
    AFTER_NAVIGATE: 'afternavigate'
    BEFORE_RENDER: 'beforerender'
    AFTER_RENDER: 'afterrender'
    ERROR: 'error'
    NOT_FOUND: 'notfound'
    LOADING: 'loading'
    READY: 'ready'
    DESTROY: 'destroy'
    LINK_CLICK: 'linkclick'
    PLUGIN_INSTALL: 'plugininstall'
    PLUGIN_EJECT: 'plugineject'
    ACCESS_DENIED: 'accessdenied'
    MAINTENANCE: 'maintenance'
    REALTIME_CHANGE: 'realtimechange'
  }

  export const DEFAULT_CONFIG: SafaRouterOptions

  export const HTTP_STATUS: {
    BAD_REQUEST: 400
    UNAUTHORIZED: 401
    FORBIDDEN: 403
    NOT_FOUND: 404
    METHOD_NOT_ALLOWED: 405
    NOT_ACCEPTABLE: 406
    REQUEST_TIMEOUT: 408
    CONFLICT: 409
    GONE: 410
    LENGTH_REQUIRED: 411
    PRECONDITION_FAILED: 412
    PAYLOAD_TOO_LARGE: 413
    URI_TOO_LONG: 414
    UNSUPPORTED_MEDIA_TYPE: 415
    RANGE_NOT_SATISFIABLE: 416
    EXPECTATION_FAILED: 417
    IM_A_TEAPOT: 418
    MISDIRECTED_REQUEST: 421
    UNPROCESSABLE_ENTITY: 422
    LOCKED: 423
    FAILED_DEPENDENCY: 424
    TOO_EARLY: 425
    UPGRADE_REQUIRED: 426
    PRECONDITION_REQUIRED: 428
    TOO_MANY_REQUESTS: 429
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431
    UNAVAILABLE_FOR_LEGAL_REASONS: 451
    INTERNAL_SERVER_ERROR: 500
    NOT_IMPLEMENTED: 501
    BAD_GATEWAY: 502
    SERVICE_UNAVAILABLE: 503
    GATEWAY_TIMEOUT: 504
    HTTP_VERSION_NOT_SUPPORTED: 505
    VARIANT_ALSO_NEGOTIATES: 506
    INSUFFICIENT_STORAGE: 507
    LOOP_DETECTED: 508
    NOT_EXTENDED: 510
    NETWORK_AUTHENTICATION_REQUIRED: 511
  }

  export const HTTP_STATUS_TEXT: { [statusCode: number]: string }

  export const ERROR_GROUPS: {
    CLIENT_ERROR: 'client-error'
    SERVER_ERROR: 'server-error'
  }

  export const ERROR_GROUP_MAP: { [statusCode: number]: string }

  // ─── Errors ─────────────────────────────────────────
  export class SafaError extends Error {
    code: string
    toJSON(): { name: string; message: string; code: string }
  }

  export class RouteNotFoundError extends SafaError {
    pathname: string
  }

  export class NavigationError extends SafaError {
    pathname: string
  }

  export class RouteLoadError extends SafaError {
    pathname: string
    original: Error
  }

  export class NavigationAbortError extends SafaError {}

  export class HttpError extends SafaError {
    statusCode: number
    pathname: string
    original: Error | null
    group: string
    toJSON(): { name: string; message: string; code: string; statusCode: number; pathname: string; group: string }
  }

  export class AccessDeniedError extends SafaError {
    pathname: string
    statusCode: 403
    toJSON(): { name: string; message: string; code: string; statusCode: number; pathname: string }
  }

  export class MaintenanceModeError extends SafaError {
    pathname: string
    statusCode: 503
    toJSON(): { name: string; message: string; code: string; statusCode: number; pathname: string }
  }
}
