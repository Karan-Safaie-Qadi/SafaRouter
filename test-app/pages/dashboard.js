export default function dashboardPage({ router, params }) {
  return `
    <div class="page-enter">
      <h2>Dashboard Overview</h2>
      <p style="color: var(--color-text-muted); margin-bottom: 1rem;">
        Welcome to the dashboard. This page uses a nested layout defined in
        <code>layouts/dashboard.js</code>.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
        <div class="card">
          <h3>Visitors</h3>
          <p style="font-size: 2rem; font-weight: 700; color: var(--color-accent);">12,458</p>
          <p style="font-size: 0.8rem; color: var(--color-text-muted);">+12% from last month</p>
        </div>
        <div class="card">
          <h3>Page Views</h3>
          <p style="font-size: 2rem; font-weight: 700; color: var(--color-success);">43,201</p>
          <p style="font-size: 0.8rem; color: var(--color-text-muted);">+8% from last month</p>
        </div>
        <div class="card">
          <h3>Bounce Rate</h3>
          <p style="font-size: 2rem; font-weight: 700; color: var(--color-warning);">24.7%</p>
          <p style="font-size: 0.8rem; color: var(--color-text-muted);">-3% from last month</p>
        </div>
        <div class="card">
          <h3>Active Users</h3>
          <p style="font-size: 2rem; font-weight: 700; color: var(--color-accent);">312</p>
          <p style="font-size: 0.8rem; color: var(--color-text-muted);">Right now</p>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem;">
        <p>Navigate to <a href="/dashboard/settings" data-safa-link>Settings</a> to see sub‑route navigation within the dashboard layout.</p>
      </div>
    </div>
  `
}
