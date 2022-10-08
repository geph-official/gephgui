import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

import dsv from "@rollup/plugin-dsv";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), dsv()],
});
