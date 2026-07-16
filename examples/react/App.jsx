import { useEffect, useRef } from "react";
import { SafaRouter } from "safa-router";

function HomePage() {
  return `
    <section>
      <h1>خوش آمدید (React)</h1>
      <p>این یک مثال با استفاده از صفا-router در پروژه React است.</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <a href="/about" class="btn" data-safa-link>درباره ما</a>
        <a href="/about" class="btn btn-outline" data-safa-link>بیشتر بدانید</a>
      </div>
    </section>
    <div class="card" style="margin-top:2rem;">
      <h2>نحوه کار</h2>
      <ul style="padding-right:1.25rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--color-text-muted);">
        <li>صفا-router از <code>#app</code> به عنوان target استفاده می‌کند</li>
        <li>محتوا به صورت HTML درون element اصلی رندر می‌شود</li>
        <li>دکمه‌های ناوبری از <code>data-safa-link</code> استفاده می‌کنند</li>
      </ul>
    </div>
  `;
}

function AboutPage() {
  return `
    <section>
      <h1>درباره صفا-router (React)</h1>
      <p>صفا-router با React به خوبی کار می‌کند. کافیست router را روی یک target element راه‌اندازی کنید.</p>
      <div class="card">
        <h2>مزایا</h2>
        <ul style="padding-right:1.25rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--color-text-muted);">
          <li>بدون نیاز به React Router</li>
          <li>مسیریابی سمت کلاینت با History API</li>
          <li>پشتیبانی از مسیرهای پویا و لایه‌بندی</li>
        </ul>
      </div>
      <a href="/" class="btn" data-safa-link>بازگشت به خانه</a>
    </section>
  `;
}

export default function App() {
  const appRef = useRef(null);
  const routerRef = useRef(null);

  useEffect(() => {
    const router = new SafaRouter({
      target: appRef.current,
      titleTemplate: "%s | صفا-router (React)",
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
      console.log(`[React Example] Navigated to: ${pathname}`);
    });

    routerRef.current = router;
    router.start().catch((err) => {
      console.error("Failed to start router:", err);
    });

    return () => {
      router.destroy();
    };
  }, []);

  return (
    <>
      <header>
        <div className="layout">
          <a href="/" className="logo" data-safa-link>صفا-router</a>
          <nav>
            <a href="/" data-safa-link>خانه</a>
            <a href="/about" data-safa-link>درباره</a>
          </nav>
        </div>
      </header>
      <div className="layout">
        <main id="app" ref={appRef}>
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "var(--color-text-muted)" }}>در حال بارگذاری...</p>
          </div>
        </main>
      </div>
      <footer>
        <div className="layout">
          <p>قدرت گرفته از صفا-router با React &copy; ۱۴۰۵</p>
        </div>
      </footer>
    </>
  );
}
