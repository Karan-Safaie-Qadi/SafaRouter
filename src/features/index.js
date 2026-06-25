import { access } from './access.js'
import { realtime } from './realtime.js'
import { components } from './components.js'
import { errors } from './errors.js'
import { maintenance } from './maintenance.js'
import { scroll } from './scroll.js'
import { transitions } from './transitions.js'

const FEATURE_MAP = {
  access: { module: access, key: 'access', detect: (c) => c.access },
  realtime: { module: realtime, key: 'realtime', detect: (c) => c.realtime },
  components: { module: components, key: 'components', detect: (c) => c.components && Object.keys(c.components).length > 0 },
  errors: { module: errors, key: 'errors', detect: (c) => c.errorLogging || c.error },
  maintenance: { module: maintenance, key: 'maintenance', detect: (c) => c.maintenanceMode },
  scroll: { module: scroll, key: 'scroll', detect: (c) => c.scrollRestoration !== false },
  transitions: { module: transitions, key: 'transitions', detect: (c) => c.transitionDuration || c.transitionEnterClass },
}

export function detectFeatures(config) {
  const features = []
  for (const [, spec] of Object.entries(FEATURE_MAP)) {
    if (spec.detect(config)) {
      features.push(spec.module)
    }
  }
  return features
}

export { access, realtime, components, errors, maintenance, scroll, transitions }
