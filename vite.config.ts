import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import legacy from "@vitejs/plugin-legacy";
import dsv from "@rollup/plugin-dsv";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    svelte(),
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
