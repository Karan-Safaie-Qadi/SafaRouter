import { SafaRouter } from '../src/SafaRouter.js'
import { EVENTS } from '../src/constants.js'
import dashboardLayout from './layouts/dashboard.js'
import headerComponent from './components/Header.js'
import footerComponent from './components/Footer.js'

const router = new SafaRouter({
  target: '#app',
  basePath: '/test-app',
  pageDir: 'html-pages',
  layout: 'html-pages/_layout.html',
  components: {
    header: headerComponent,
    footer: footerComponent,
  },

  // ── v1.3.0: ErrorManager ──
  errors: {
    pageDir: 'html-pages/errors',
    stackTraces: true,
  },

  // ── v1.3.0: AccessController + Allowlist ──
  access: {
    blocked: ['/admin', '/private/**'],
    ignored: ['/hidden', '/deprecated/*'],
    allowed: ['/allowlist-demo'],
    mode: 'blocklist',
  },

  // ── v1.3.0: Maintenance Mode (disabled by default) ──
  maintenanceMode: {
    enabled: false,
    allowedPaths: ['/login', '/assets/**', '/sandbox'],
  },

  // ── v1.4.3: Real-time updates ──
  realtime: {
    enabled: true,
    mode: 'sse',
  },

  // ── v1.3.0: Error Logging ──
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

    '/slow': {
      loading: () => '<div style="display:flex;align-items:center;justify-content:center;padding:3rem;gap:0.75rem;"><div class="spinner"></div><p>Loading slow page…</p></div>',
      loader: async () => { await new Promise(r => setTimeout(r, 1500)) },
    },

    '(main)': {
      children: {
        'profile': {
          children: {
            '[id]': {},
          },
        },
      },
    },

    '/dashboard': {
      layout: dashboardLayout,
      children: {
        settings: {},
      },
    },

    '/errors': {},
    '/about': {},
    '/docs': {},
    '/contact': {},
    '/sandbox': {
      meta: { hideComponents: ['footer'] },
    },
    '/no-header': {
      meta: { hideComponents: ['header'] },
    },
    '/plain': {
      meta: { hideComponents: true },
    },
    '/allowlist-demo': {},
    '/react-demo': {},
    '/vue-demo': {},
    '/svelte-demo': {},
    '/vanilla-demo': {},
    '/faq': {},
    '/benchmarks': {},
    '/features': {},
    '/sitemap': {},

    // Dynamic error routes (e.g. /errors/404, /errors/500)
    '/errors/[code]': {},

    '/access': {},

    '/loader': {
      loader: async ({ params, query, router }) => {
        await new Promise(r => setTimeout(r, 500))
        return {
          items: [
            { id: 1, name: 'Router Config' },
            { id: 2, name: 'Route Tree' },
            { id: 3, name: 'Middleware Chain' },
            { id: 4, name: 'Error Manager' },
            { id: 5, name: 'Access Controller' },
          ],
          timestamp: Date.now(),
          server: 'safa-router-demo',
        }
      },
    },

    '/guard': {
      guard: ({ params, query, router }) => {
        const authed = localStorage.getItem('safa_demo_auth') === 'true'
        return authed || '/login'
      },
    },

    '/login': {},
    '/not-found': {},

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
  console.log(`[Demo] Navigated to: ${pathname}`)
})

router.onError(({ path, error, statusCode }) => {
  console.warn(`[Demo] Error at ${path}:`, error.message, `(status: ${statusCode})`)
})

router.onMaintenance(({ path }) => {
  console.info(`[Demo] Maintenance mode blocked: ${path}`)
})

router.onAccessDenied(({ path, reason }) => {
  console.warn(`[Demo] Access denied: ${path} — ${reason}`)
})

function initPageBindings(router) {
  document.querySelectorAll('[data-sandbox]').forEach(el => {
    el.addEventListener('click', () => router.push(el.dataset.sandbox))
  })
  document.querySelectorAll('[data-error]').forEach(el => {
    el.addEventListener('click', () => router.push(`/errors/${el.dataset.error}`))
  })
  document.querySelectorAll('[data-blocked]').forEach(el => {
    el.addEventListener('click', () => router.push(el.dataset.blocked))
  })
  document.querySelectorAll('[data-ignored]').forEach(el => {
    el.addEventListener('click', () => router.push(el.dataset.ignored))
  })

  document.querySelector('.api-back')?.addEventListener('click', () => router.back())
  document.querySelector('.api-forward')?.addEventListener('click', () => router.forward())
  document.querySelector('.api-reload')?.addEventListener('click', () => router.reload())
  document.querySelector('.api-error')?.addEventListener('click', () => {
    throw new Error('Test error from sandbox')
  })
  document.querySelector('.api-maintenance-on')?.addEventListener('click', () => {
    router.setMaintenance(true)
    const status = document.getElementById('maintenance-status')
    if (status) {
      status.textContent = '🟡 MAINTENANCE MODE'
      status.style.color = 'var(--color-warning)'
    }
    router.reload()
  })
  document.querySelector('.api-maintenance-off')?.addEventListener('click', () => {
    router.setMaintenance(false)
    const status = document.getElementById('maintenance-status')
    if (status) {
      status.textContent = '🟢 Normal'
      status.style.color = 'var(--color-success)'
    }
    router.reload()
  })
  document.querySelector('.api-block-temp')?.addEventListener('click', () => {
    router.blockRoute('/blocked/temp')
    router.push('/blocked/temp')
  })
  document.querySelector('.api-unblock-temp')?.addEventListener('click', () => {
    router.unblockRoute('/blocked/temp')
    router.push('/sandbox')
  })
  document.querySelector('.api-retry')?.addEventListener('click', () => {
    router.retry('/nonexistent', { retries: 2 }).catch(() => {
      router.push('/sandbox')
    })
  })
  document.getElementById('dynamic-block')?.addEventListener('click', () => {
    router.blockRoute('/api/temp')
    router.push('/api/temp')
  })
  document.getElementById('dynamic-unblock')?.addEventListener('click', () => {
    router.unblockRoute('/api/temp')
    router.push('/access')
  })
  document.getElementById('guard-logout')?.addEventListener('click', () => {
    localStorage.removeItem('safa_demo_auth')
    router.push('/guard')
  })
  document.getElementById('login-btn')?.addEventListener('click', () => {
    localStorage.setItem('safa_demo_auth', 'true')
    router.push('/guard')
  })

  // ── v1.4.3: Allowlist toggle ──
  document.querySelector('.api-allowlist-on')?.addEventListener('click', () => {
    router.accessController.setMode('allowlist')
    const modeEl = document.getElementById('access-mode-status')
    if (modeEl) modeEl.textContent = '🟢 Allowlist (only allowed pages)'
    router.reload()
  })
  document.querySelector('.api-allowlist-off')?.addEventListener('click', () => {
    router.accessController.setMode('blocklist')
    const modeEl = document.getElementById('access-mode-status')
    if (modeEl) modeEl.textContent = '🔵 Blocklist (default)'
    router.reload()
  })

  const statusEl = document.getElementById('maintenance-status')
  if (statusEl) {
    statusEl.textContent = router.isMaintenance() ? '🟡 MAINTENANCE MODE' : '🟢 Normal'
  }
  const modeEl = document.getElementById('access-mode-status')
  if (modeEl) {
    modeEl.textContent = router.accessController.getMode() === 'allowlist' ? '🟢 Allowlist' : '🔵 Blocklist'
  }
  const realtimeEl = document.getElementById('realtime-indicator')
  if (realtimeEl) {
    realtimeEl.textContent = '🟢 Real-time connected'
    realtimeEl.style.color = 'var(--color-success)'
  }
}

function setupLogHandler(router) {
  if (!router.errorManager) return
  router.errorManager.setLogHandler((entry) => {
    const log = document.getElementById('error-log')
    if (!log) return
    const firstChild = log.firstChild
    if (firstChild && firstChild.nodeName === 'EM') {
      log.innerHTML = ''
    }
    const line = document.createElement('div')
    line.style.cssText = 'padding: 2px 0; border-bottom: 1px solid var(--color-border);'
    line.textContent = `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.statusCode} ${entry.path} — ${entry.error?.message || entry.error}`
    log.insertBefore(line, log.firstChild)
  })
}

router.on(EVENTS.AFTER_RENDER, () => {
  initPageBindings(router)
})

router.on('routechange', () => {
  const statusEl = document.getElementById('maintenance-status')
  if (statusEl) {
    statusEl.textContent = router.isMaintenance() ? '🟡 MAINTENANCE MODE' : '🟢 Normal'
  }
})

setupLogHandler(router)

router.start().catch(err => {
  console.error('Failed to start SafaRouter:', err)
  document.getElementById('app').innerHTML = `
    <div class="safa-error">
      <h1>Startup Error</h1>
      <pre>${err.message}</pre>
    </div>
  `
})
