import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { safaRouter } from "safa-router/vite";

export default defineConfig({
  plugins: [vue(), safaRouter()],
});
