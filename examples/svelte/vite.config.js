import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { safaRouter } from "safa-router/vite";

export default defineConfig({
  plugins: [svelte(), safaRouter()],
});
