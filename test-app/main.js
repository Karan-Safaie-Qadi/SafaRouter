import { SafaRouter } from '../src/SafaRouter.js'
import rootLayout from './layouts/root.js'
import dashboardLayout from './layouts/dashboard.js'
import homePage from './pages/home.js'
import aboutPage from './pages/about.js'
import blogPage from './pages/blog.js'
import blogPostPage from './pages/blog-post.js'
import dashboardPage from './pages/dashboard.js'
import dashboardSettingsPage from './pages/dashboard-settings.js'
import notFoundPage from './pages/not-found.js'
import errorPage from './pages/error-page.js'

const router = new SafaRouter({
  target: '#app',

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
