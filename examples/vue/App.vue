<template>
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
    <main ref="appTarget">
      <div style="text-align:center;padding:3rem 0;">
        <p style="color:var(--color-text-muted);">در حال بارگذاری...</p>
      </div>
    </main>
  </div>
  <footer>
    <div class="layout">
      <p>قدرت گرفته از صفا-router با Vue &copy; ۱۴۰۵</p>
    </div>
  </footer>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { SafaRouter } from "safa-router";

function HomePage() {
  return `
    <section>
      <h1>خوش آمدید (Vue)</h1>
      <p>این یک مثال با استفاده از صفا-router در پروژه Vue 3 است.</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <a href="/about" class="btn" data-safa-link>درباره ما</a>
        <a href="/about" class="btn btn-outline" data-safa-link>بیشتر بدانید</a>
      </div>
    </section>
    <div class="card" style="margin-top:2rem;">
      <h2>نحوه کار</h2>
      <ul style="padding-right:1.25rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--color-text-muted);">
        <li>router روی target <code>#app-target</code> راه‌اندازی می‌شود</li>
        <li>صفحات به صورت HTML string از توابع بازگشت داده می‌شوند</li>
        <li>ناوبری با <code>data-safa-link</code> انجام می‌شود</li>
      </ul>
    </div>
  `;
}

function AboutPage() {
  return `
    <section>
      <h1>درباره صفا-router (Vue)</h1>
      <p>صفا-router با Vue 3 به خوبی کار می‌کند. می‌توانید از توابع纯 JavaScript برای صفحات استفاده کنید.</p>
      <div class="card">
        <h2>مزایا</h2>
        <ul style="padding-right:1.25rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--color-text-muted);">
          <li>بدون نیاز به Vue Router</li>
          <li>مسیریابی سمت کلاینت با History API</li>
          <li>پشتیبانی از مسیرهای پویا <code>[slug]</code></li>
          <li>لایه‌بندی تودرتو (Nested Layouts)</li>
        </ul>
      </div>
      <a href="/" class="btn" data-safa-link>بازگشت به خانه</a>
    </section>
  `;
}

export default {
  name: "App",
  setup() {
    const appTarget = ref(null);
    let router = null;

    onMounted(() => {
      if (!appTarget.value) return;

      router = new SafaRouter({
        target: appTarget.value,
        titleTemplate: "%s | صفا-router (Vue)",
        routes: {
          "/": {
            page: () => HomePage(),
          },
          "/about": {
            page: () => AboutPage(),
          },
        },
      });

      router.afterEach(({ pathname }) => {
        console.log(`[Vue Example] Navigated to: ${pathname}`);
      });

      router.start().catch((err) => {
        console.error("Failed to start router:", err);
      });
    });

    onUnmounted(() => {
      if (router) {
        router.destroy();
      }
    });

    return { appTarget };
  },
};
</script>

<style>
/* Styles are in index.html */
</style>
