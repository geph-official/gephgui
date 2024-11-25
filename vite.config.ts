import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import legacy from "@vitejs/plugin-legacy";
import dsv from "@rollup/plugin-dsv";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        typescript: {
          transpileOnly: true,
          compilerOptions: {
            strict: false,
          },
        },
      }),
    }),
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
