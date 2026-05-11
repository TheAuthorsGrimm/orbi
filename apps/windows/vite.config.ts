import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../web/src"),
      "@orbi/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@orbi/design-system": path.resolve(
        __dirname,
        "../../packages/design-system/tokens/index.ts"
      ),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
