import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/app/page.tsx"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
