import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/soul_collection/",
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
