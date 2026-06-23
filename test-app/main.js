import { SafaRouter } from '../src/SafaRouter.js'
import rootLayout from './layouts/root.js'
import dashboardLayout from './layouts/dashboard.js'
import homePage from './pages/home.js'
import aboutPage from './pages/about.js'
import blogPage from './pages/blog.js'
import blogPostPage from './pages/blog-post.js'
import dashboardPage from './pages/dashboard.js'
import dashboardSettingsPage from './pages/dashboard-settings.js'
import profilePage from './pages/profile.js'
import contactPage from './pages/contact.js'
import docsPage from './pages/docs.js'
import sandboxPage from './pages/sandbox.js'
import sitemapPage from './pages/sitemap.js'
import loadingDemoPage from './pages/loading-demo.js'
import loadingState from './pages/loading-state.js'
import notFoundPage from './pages/not-found.js'
import errorPage from './pages/error-page.js'

const router = new SafaRouter({
  target: '#app',
  basePath: '/test-app',

  routes: {
    '/': {
      layout: rootLayout,
      page: homePage,
    },

    '/about': {
      page: aboutPage,
    },

    '/blog': {
      page: blogPage,
      children: {
        '[slug]': {
          page: blogPostPage,
        },
      },
    },

    '/contact': {
      page: contactPage,
    },

    '/docs': {
      page: docsPage,
    },

    '/sandbox': {
      page: sandboxPage,
    },

    '/sitemap': {
      page: sitemapPage,
    },

    '/slow': {
      loading: loadingState,
      page: loadingDemoPage,
    },

    '(main)': {
      children: {
        'profile': {
          children: {
            '[id]': {
              page: profilePage,
            },
          },
        },
      },
    },

    '/dashboard': {
      layout: dashboardLayout,
      page: dashboardPage,
      children: {
        settings: {
          page: dashboardSettingsPage,
        },
      },
    },
  },

  notFound: notFoundPage,
  error: errorPage,
})

/* ── Auth middleware demo ──────────────────── */

router.use(async (ctx, next) => {
  const protectedPaths = ['/dashboard', '/dashboard/settings']
  const isProtected = protectedPaths.some((p) => ctx.path.startsWith(p))

  if (isProtected) {
    const authed = localStorage.getItem('safa_demo_auth') === 'true'
    if (!authed) {
      localStorage.setItem('safa_demo_auth', 'true')
    }
  }

  return next()
})

router.onError(({ path, error }) => {
  console.warn(`[Demo] Navigation error at ${path}:`, error.message)
})

router.onRouteChange(({ pathname, params }) => {
  if (params && Object.keys(params).length > 0) {
    console.log(`[Demo] Route: ${pathname}`, params)
  }
})

/* ── Start ─────────────────────────────────── */

router.start().catch((err) => {
  console.error('Failed to start SafaRouter:', err)
  document.getElementById('app').innerHTML = `
    <div class="safa-error">
      <h1>Startup Error</h1>
      <pre>${err.message}</pre>
    </div>
  `
})
