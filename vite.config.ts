import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import legacy from "@vitejs/plugin-legacy";
import dsv from "@rollup/plugin-dsv";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    svelte(),
    wasm(),
    topLevelAwait(),
    dsv(),
    legacy({
      targets: ["defaults", ">0.01%"],
    }),
  ],
  resolve: {
    alias: {
      stream: "stream-browserify",
    },
  },
});
