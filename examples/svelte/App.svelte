<script>
  import { onMount, onDestroy } from "svelte";
  import { SafaRouter } from "safa-router";

  let appTarget;
  let router;

  function homePage() {
    return `
      <section>
        <h1>خوش آمدید (Svelte)</h1>
        <p>این یک مثال با استفاده از صفا-router در پروژه Svelte است.</p>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
          <a href="/about" class="btn" data-safa-link>درباره ما</a>
          <a href="/about" class="btn btn-outline" data-safa-link>بیشتر بدانید</a>
        </div>
      </section>
      <div class="card" style="margin-top:2rem;">
        <h2>نحوه کار</h2>
        <ul style="padding-right:1.25rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--color-text-muted);">
          <li>صفا-router روی target راه‌اندازی می‌شود</li>
          <li>صفحات به صورت HTML string از توابع بازگشت داده می‌شوند</li>
          <li>ناوبری با <code>data-safa-link</code> انجام می‌شود</li>
        </ul>
      </div>
    `;
  }

  function aboutPage() {
    return `
      <section>
        <h1>درباره صفا-router (Svelte)</h1>
        <p>صفا-router با Svelte به خوبی کار می‌کند.</p>
        <div class="card">
          <h2>مزایا</h2>
          <ul style="padding-right:1.25rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--color-text-muted);">
            <li>بدون نیاز به SvelteKit یا router جداگانه</li>
            <li>مسیریابی سمت کلاینت با History API</li>
            <li>پشتیبانی از مسیرهای پویا و لایه‌بندی</li>
            <li>باندل بسیار کم حجم</li>
          </ul>
        </div>
        <a href="/" class="btn" data-safa-link>بازگشت به خانه</a>
      </section>
    `;
  }

  onMount(() => {
    if (!appTarget) return;

    router = new SafaRouter({
      target: appTarget,
      titleTemplate: "%s | صفا-router (Svelte)",
      routes: {
        "/": { page: () => homePage() },
        "/about": { page: () => aboutPage() },
      },
    });

    router.afterEach(({ pathname }) => {
      console.log(`[Svelte Example] Navigated to: ${pathname}`);
    });

    router.start().catch((err) => {
      console.error("Failed to start router:", err);
    });
  });

  onDestroy(() => {
    if (router) router.destroy();
  });
</script>

<header>
  <div class="layout">
    <a href="/" class="logo" data-safa-link>صفا-router</a>
    <nav>
      <a href="/" data-safa-link>خانه</a>
      <a href="/about" data-safa-link>درباره</a>
    </nav>
  </div>
</header>

<div class="layout">
  <main bind:this={appTarget}>
    <div style="text-align:center;padding:3rem 0;">
      <p style="color:var(--color-text-muted);">در حال بارگذاری...</p>
    </div>
  </main>
</div>

<footer>
  <div class="layout">
    <p>قدرت گرفته از صفا-router با Svelte &copy; ۱۴۰۵</p>
  </div>
</footer>
