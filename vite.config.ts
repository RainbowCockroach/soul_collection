import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/soul_collection/",
  define: {
    // Stamped at build time. In GitHub Actions this is the deploy time,
    // which we surface as "Last updated" in the footer.
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      output: {
        // Split large, rarely-changing vendor code into their own chunks so
        // visitors don't re-download everything on each app deploy, and the
        // heavy editor-only libs stay out of the initial page load.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "dnd-vendor": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
          ],
          "editor-vendor": ["sceditor-react"],
        },
      },
    },
  },
});
