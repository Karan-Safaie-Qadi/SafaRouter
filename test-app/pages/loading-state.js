export default function loadingState({ path }) {
  return `
    <div class="page-enter" style="text-align:center;padding:3rem 0;">
      <div class="spinner" style="margin:0 auto 1rem;"></div>
      <p style="color: var(--color-text-muted);">Loading <code>${path}</code>…</p>
    </div>
  `
}
