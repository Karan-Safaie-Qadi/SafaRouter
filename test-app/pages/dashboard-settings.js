export default function dashboardSettingsPage() {
  return `
    <div class="page-enter">
      <h2>Dashboard Settings</h2>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
        This is a nested sub‑route of the dashboard.
      </p>

      <div class="card">
        <h3>Profile</h3>
        <p style="margin-bottom: 0.75rem;">Update your display name and email address.</p>
        <p><em>Form controls would go here in a real app.</em></p>
      </div>

      <div class="card">
        <h3>Notifications</h3>
        <p style="margin-bottom: 0.75rem;">Configure which alerts you receive.</p>
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" checked disabled>
          Email notifications
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-top: 0.5rem;">
          <input type="checkbox" disabled>
          Push notifications
        </label>
      </div>

      <div class="card">
        <h3>Danger Zone</h3>
        <button disabled style="padding: 0.5rem 1rem; background: var(--color-error); color: #fff; border: none; border-radius: 4px; cursor: not-allowed; opacity: 0.6;">
          Delete Account
        </button>
        <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.5rem;">This is a demo — buttons are disabled.</p>
      </div>
    </div>
  `
}
