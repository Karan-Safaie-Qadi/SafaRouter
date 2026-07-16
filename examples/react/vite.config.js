import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { safaRouter } from "safa-router/vite";

export default defineConfig({
  plugins: [react(), safaRouter()],
});
