import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    host: true,
    preview: {
      port: 4173,
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    // Enable minification
    minify: "terser",
    // Generate source maps for debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          vendor: ["react", "react-dom", "react-router-dom"],
          // UI components chunk
          ui: ["@phosphor-icons/react"],
          // Utils chunk
          utils: ["axios"],
        },
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsDir: "assets",
    // Enable asset inlining for small files
    assetsInlineLimit: 4096,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url)
      ),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@phosphor-icons/react",
      "axios",
    ],
  },
  esbuild: {
    // Keep console.log in production for debugging
    // drop: ["debugger"], // Only remove debugger statements
  },
}));
