import { SafaRouter } from "safa-router";

const router = new SafaRouter({
  target: "#app",
  pageDir: "html-pages",
  titleTemplate: "%s | صفا-router",
  routes: {
    "/": {},
    "/about": {},
  },
});

router.afterEach(({ pathname }) => {
  console.log(`[Vanilla Example] Navigated to: ${pathname}`);
});

router.start().catch((err) => {
  console.error("Failed to start router:", err);
  document.getElementById("app").innerHTML =
    `<div class="card"><h2>خطا</h2><p>${err.message}</p></div>`;
});
