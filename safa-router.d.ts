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
    onBeforeRender?(fn: (data: { pathname: string }) => void): () => void
    onAfterRender?(fn: (data: { pathname: string }) => void): () => void
    reload(): void
    navigate(url: string): Promise<void>

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

    onError(fn: (data: { path: string; error: Error }) => void): () => void
    onNotFound(fn: (data: { path: string }) => void): () => void
    onRouteChange(fn: (data: { pathname: string; params: any; query: any }) => void): () => void
    onBeforeNavigate(fn: (data: { path: string; method: string }) => void): () => void

    createLink(config: LinkConfig): Link
    prefetch(path: string): Promise<void>
    clearCache(): void
    getRoute(path: string): RouteMatch | null

    plugin(plugin: SafaPlugin): this
    ejectPlugin(name: string): boolean
    getPlugin(name: string): any
    readonly plugins: string[]
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
    cacheRoutes?: boolean
    titleTemplate?: string
    transitionDuration?: number
    transitionEnterClass?: string
    transitionExitClass?: string
    transitionEnterActiveClass?: string
    transitionExitActiveClass?: string
    plugins?: SafaPlugin[]
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
    meta?: { title?: string; name?: string; [key: string]: any }
  }

  export interface RouteMatch {
    node: RouteNodeData
    params: Record<string, any>
    layouts: LayoutComponent[]
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
    onError?: (data: { path: string; error: Error }) => void
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
  export function parseQuery(search: string): Record<string, string>
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
  }

  export const DEFAULT_CONFIG: SafaRouterOptions

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
}
