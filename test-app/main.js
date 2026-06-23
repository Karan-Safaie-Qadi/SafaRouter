import { SafaRouter } from '../src/SafaRouter.js'
import rootLayout from './layouts/root.js'
import dashboardLayout from './layouts/dashboard.js'
import homePage from './pages/home.js'
import blogPage from './pages/blog.js'
import blogPostPage from './pages/blog-post.js'
import dashboardPage from './pages/dashboard.js'
import dashboardSettingsPage from './pages/dashboard-settings.js'
import profilePage from './pages/profile.js'
import loadingDemoPage from './pages/loading-demo.js'
import loadingState from './pages/loading-state.js'
import notFoundPage from './pages/not-found.js'
import errorPage from './pages/error-page.js'

const router = new SafaRouter({
  target: '#app',
  basePath: '/test-app',

  pageDir: 'html-pages',

  layout: rootLayout,

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
  },

  notFound: notFoundPage,
  error: errorPage,
})

router.use(async (ctx, next) => {
  const protectedPaths = ['/dashboard', '/dashboard/settings']
  const isProtected = protectedPaths.some((p) => ctx.path.startsWith(p))
  if (isProtected) {
    localStorage.getItem('safa_demo_auth') === 'true'
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

router.start().catch((err) => {
  console.error('Failed to start SafaRouter:', err)
  document.getElementById('app').innerHTML = `
    <div class="safa-error">
      <h1>Startup Error</h1>
      <pre>${err.message}</pre>
    </div>
  `
})
