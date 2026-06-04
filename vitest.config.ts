import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The domain layer is pure TypeScript (no DOM), so the default node
// environment is all the tests need. We mirror the `@/*` path alias used
// by the app so tests and source import the same way.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
