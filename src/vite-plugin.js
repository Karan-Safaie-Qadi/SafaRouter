const FEATURE_IMPORT_MAP = {
  access: 'safa-router/features/access',
  realtime: 'safa-router/features/realtime',
  components: 'safa-router/features/components',
  errors: 'safa-router/features/errors',
  maintenance: 'safa-router/features/maintenance',
  scroll: 'safa-router/features/scroll',
  transitions: 'safa-router/features/transitions',
}

const CONFIG_KEYS = {
  access: 'access',
  realtime: 'realtime',
  components: 'components',
  errorLogging: 'errors',
  error: 'errors',
  maintenanceMode: 'maintenance',
  scrollRestoration: 'scroll',
  transitionDuration: 'transitions',
  transitionEnterClass: 'transitions',
  transitionExitClass: 'transitions',
  transitionEnterActiveClass: 'transitions',
  transitionExitActiveClass: 'transitions',
}

/**
 * SafaRouter Vite plugin — automatically detects which features your app uses
 * and injects only the necessary imports, keeping your bundle minimal.
 *
 * Usage:
 * ```js
 * // vite.config.js
 * import { safaRouter } from 'safa-router/vite'
 * export default { plugins: [safaRouter()] }
 * ```
 */
export function safaRouter() {
  return {
    name: 'safa-router',

    transform(code, id) {
      const features = detectFeaturesFromCode(code)
      if (features.length === 0) return

      const imports = features
        .map(name => `import '${FEATURE_IMPORT_MAP[name]}'`)
        .join('\n')

      return { code: imports + '\n' + code, map: null }
    },
  }
}

function detectFeaturesFromCode(code) {
  const features = new Set()

  // Detect config keys in new SafaRouter({ ... }) calls
  const configMatch = code.match(/new\s+SafaRouter\s*\(\s*\{([\s\S]*?)\}\s*\)/)
  if (configMatch) {
    const body = configMatch[1]

    for (const [key, feature] of Object.entries(CONFIG_KEYS)) {
      // Skip components — handled separately below
      if (key === 'components') continue
      const regex = new RegExp(`\\b${key}\\s*:`, 'i')
      if (regex.test(body)) {
        features.add(feature)
      }
    }

    // components is special — only if it has keys
    const compsMatch = body.match(/\bcomponents\s*:\s*\{\s*([^}]*)\s*\}/)
    if (compsMatch && compsMatch[1].trim()) {
      features.add('components')
    }
  }

  // Detect method calls that indicate feature usage
  if (/\.(blockRoute|unblockRoute|ignoreRoute|unignoreRoute)\s*\(/.test(code)) features.add('access')
  if (/\.(isMaintenance|setMaintenance)\s*\(/.test(code)) features.add('maintenance')
  if (/\.onAccessDenied\s*\(/.test(code)) features.add('access')
  if (/\.onMaintenance\s*\(/.test(code)) features.add('maintenance')

  return [...features]
}
