import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Run against a PRODUCTION build, not `next dev`. Next's dev server
  // (via Turbopack) compiles each route on its first request -- if two
  // parallel test files hit a route for the first time at the same
  // moment, that triggers a compile-then-refresh cycle that can reset
  // in-progress form state mid-test. A production build has no
  // per-route compile step at all, so this race can't happen. This was
  // confirmed as the actual root cause (not a hydration timing issue,
  // which was the first, wrong hypothesis) by reproducing the failure
  // only under parallel execution and not when running a single test
  // file alone.
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
