import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  for (const [path, heading] of [
    ["/", "Dashboard"],
    ["/new-review", "New Review"],
    ["/control-library", "Control Library"],
    ["/history", "Review History"],
    ["/about", "About This Project"],
  ] as const) {
    test(`${path} loads and shows "${heading}"`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    });
  }
});
