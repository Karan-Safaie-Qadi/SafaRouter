import { SafaRouter } from '../src/SafaRouter.js'
import dashboardLayout from './layouts/dashboard.js'
import homePage from './pages/home.js'
import blogPage from './pages/blog.js'
import blogPostPage from './pages/blog-post.js'
import dashboardPage from './pages/dashboard.js'
import dashboardSettingsPage from './pages/dashboard-settings.js'
import profilePage from './pages/profile.js'
import loadingDemoPage from './pages/loading-demo.js'
import loadingState from './pages/loading-state.js'

const router = new SafaRouter({
  target: '#app',
  basePath: '/test-app',
  pageDir: 'html-pages',
  layout: 'html-pages/_layout.html',

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

router.onError(({ path, error }) => {
  console.warn(`[Demo] Error at ${path}:`, error.message)
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
