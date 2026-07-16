import { defineConfig } from "vite";
import { safaRouter } from "safa-router/vite";

export default defineConfig({
  plugins: [safaRouter()],
});
