import { SafaRouter } from '../src/SafaRouter.js'
import { EVENTS } from '../src/constants.js'
import dashboardLayout from './layouts/dashboard.js'
import homePage from './pages/home.js'
import blogPage from './pages/blog.js'
import blogPostPage from './pages/blog-post.js'
import dashboardPage from './pages/dashboard.js'
import dashboardSettingsPage from './pages/dashboard-settings.js'
import profilePage from './pages/profile.js'
import loadingDemoPage from './pages/loading-demo.js'
import loadingState from './pages/loading-state.js'
import errorsDemoPage from './pages/errors-demo.js'
import accessControlPage from './pages/access-control.js'
import loaderDemoPage from './pages/loader-demo.js'
import guardDemoPage from './pages/guard-demo.js'
import loginPage from './pages/login.js'
import transitionDemoPage from './pages/transition-demo.js'

const router = new SafaRouter({
  target: '#app',
  basePath: '/test-app',
  pageDir: 'html-pages',
  layout: 'html-pages/_layout.html',

  // ── v1.3.0: ErrorManager ──
  errors: {
    pageDir: 'html-pages/errors',
    stackTraces: true,
  },

  // ── v1.3.0: AccessController ──
  access: {
    blocked: ['/admin', '/private/**'],
    ignored: ['/hidden', '/deprecated/*'],
  },

  // ── v1.3.0: Maintenance Mode (disabled by default) ──
  maintenanceMode: {
    enabled: false,
    allowedPaths: ['/login', '/assets/**', '/sandbox'],
  },

  // ── v1.3.0: Error Logging ──
  errorLogging: {
    enabled: true,
  },

  routes: {
    '/': { page: homePage },

    '/blog': {
      page: blogPage,
      children: {
        '[slug]': { page: blogPostPage },
      },
    },

    '/slow': {
      loading: loadingState,
      page: loadingDemoPage,
    },

    '(main)': {
      children: {
        'profile': {
          children: {
            '[id]': { page: profilePage },
          },
        },
      },
    },

    '/dashboard': {
      layout: dashboardLayout,
      page: dashboardPage,
      children: {
        settings: { page: dashboardSettingsPage },
      },
    },

    // ── v1.3.0 Demo Routes ──

    '/errors': { page: errorsDemoPage },

    // Dynamic error routes (e.g. /errors/404, /errors/500)
    '/errors/[code]': {
      page({ params }) {
        const code = params.code
        const messages = {
          400: 'Bad Request — the server could not understand the request.',
          403: 'Forbidden — access denied by AccessController.',
          404: 'Not Found — this simulated route does not exist.',
          418: "I'm a Teapot — an RFC 2324 compliant HTTP status.",
          500: 'Internal Server Error — something went wrong on the server.',
          503: 'Service Unavailable — site is under maintenance.',
        }
        const emojis = {
          400: '⚠️', 403: '🔒', 404: '🔍', 418: '🫖', 500: '💥', 503: '🔧',
        }
        const msg = messages[code] || 'An error occurred.'
        const emoji = emojis[code] || '❌'
        return `
          <div class="safa-error page-enter">
            <div style="font-size:3rem;margin-bottom:0.5rem;">${emoji}</div>
            <h1 style="font-size:4rem;font-weight:800;margin-bottom:0.5rem;">${code}</h1>
            <p style="color:var(--color-text-muted);margin-bottom:1.5rem;">${msg}</p>
            <a href="/errors" class="sandbox-btn" data-safa-link>&larr; Error Demo</a>
          </div>
        `
      },
    },

    '/access': { page: accessControlPage },

    '/loader': {
      page: loaderDemoPage,
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
      page: guardDemoPage,
      guard: ({ params, query, router }) => {
        const authed = localStorage.getItem('safa_demo_auth') === 'true'
        return authed || '/login'
      },
    },

    '/login': { page: loginPage },

    '/transition': {
      page: transitionDemoPage,
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

router.use(async (ctx, next) => {
  const protectedPaths = ['/dashboard', '/dashboard/settings']
  if (protectedPaths.some(p => ctx.path.startsWith(p))) {
    localStorage.getItem('safa_demo_auth')
  }
  return next()
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
  })
  document.querySelector('.api-maintenance-off')?.addEventListener('click', () => {
    router.setMaintenance(false)
    const status = document.getElementById('maintenance-status')
    if (status) {
      status.textContent = '🟢 Normal'
      status.style.color = 'var(--color-success)'
    }
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

  if (router.errorManager) {
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

  const statusEl = document.getElementById('maintenance-status')
  if (statusEl) {
    statusEl.textContent = router.isMaintenance() ? '🟡 MAINTENANCE MODE' : '🟢 Normal'
  }
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

router.start().catch(err => {
  console.error('Failed to start SafaRouter:', err)
  document.getElementById('app').innerHTML = `
    <div class="safa-error">
      <h1>Startup Error</h1>
      <pre>${err.message}</pre>
    </div>
  `
})
