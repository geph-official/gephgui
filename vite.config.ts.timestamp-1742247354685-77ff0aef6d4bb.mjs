// vite.config.ts
import { defineConfig } from "file:///home/miyuruasuka/GEPH4/gephgui-html/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/miyuruasuka/GEPH4/gephgui-html/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { sveltePreprocess } from "file:///home/miyuruasuka/GEPH4/gephgui-html/node_modules/svelte-preprocess/dist/index.js";
import legacy from "file:///home/miyuruasuka/GEPH4/gephgui-html/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import dsv from "file:///home/miyuruasuka/GEPH4/gephgui-html/node_modules/@rollup/plugin-dsv/dist/index.js";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        typescript: {
          transpileOnly: true,
          compilerOptions: {
            strict: false
          }
        }
      })
    }),
    dsv(),
    legacy({
      targets: ["defaults", ">0.01%"]
    })
  ],
  resolve: {
    alias: {
      stream: "stream-browserify"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9taXl1cnVhc3VrYS9HRVBINC9nZXBoZ3VpLWh0bWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL21peXVydWFzdWthL0dFUEg0L2dlcGhndWktaHRtbC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9taXl1cnVhc3VrYS9HRVBINC9nZXBoZ3VpLWh0bWwvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCB7IHN2ZWx0ZVByZXByb2Nlc3MgfSBmcm9tIFwic3ZlbHRlLXByZXByb2Nlc3NcIjtcbmltcG9ydCBsZWdhY3kgZnJvbSBcIkB2aXRlanMvcGx1Z2luLWxlZ2FjeVwiO1xuaW1wb3J0IGRzdiBmcm9tIFwiQHJvbGx1cC9wbHVnaW4tZHN2XCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiBcIi4vXCIsXG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoe1xuICAgICAgcHJlcHJvY2Vzczogc3ZlbHRlUHJlcHJvY2Vzcyh7XG4gICAgICAgIHR5cGVzY3JpcHQ6IHtcbiAgICAgICAgICB0cmFuc3BpbGVPbmx5OiB0cnVlLFxuICAgICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgfSksXG4gICAgZHN2KCksXG4gICAgbGVnYWN5KHtcbiAgICAgIHRhcmdldHM6IFtcImRlZmF1bHRzXCIsIFwiPjAuMDElXCJdLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIHN0cmVhbTogXCJzdHJlYW0tYnJvd3NlcmlmeVwiLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFIsU0FBUyxvQkFBb0I7QUFDM1QsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsd0JBQXdCO0FBQ2pDLE9BQU8sWUFBWTtBQUNuQixPQUFPLFNBQVM7QUFHaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsWUFBWSxpQkFBaUI7QUFBQSxRQUMzQixZQUFZO0FBQUEsVUFDVixlQUFlO0FBQUEsVUFDZixpQkFBaUI7QUFBQSxZQUNmLFFBQVE7QUFBQSxVQUNWO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLE1BQ0wsU0FBUyxDQUFDLFlBQVksUUFBUTtBQUFBLElBQ2hDLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
