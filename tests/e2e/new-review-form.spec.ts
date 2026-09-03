import { test, expect } from "@playwright/test";
import { gotoReady } from "./fixtures";

test.describe("New Review -- form and validation (no network needed)", () => {
  test("shows the PHI/PII warning banner on the statement form", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await expect(page.getByText(/Don't submit real PHI, PII, credentials/)).toBeVisible();
  });

  test("Review Implementation is disabled until a statement is entered", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    const button = page.getByRole("button", { name: "Review Implementation" });
    await expect(button).toBeDisabled();
    await page.getByLabel("Implementation statement").fill("A test statement.");
    await expect(button).toBeEnabled();
  });

  test("optional context fields are hidden until expanded", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await expect(page.getByLabel("System name")).toHaveCount(0);
    await page.getByRole("button", { name: /Add optional context/ }).click();
    await expect(page.getByLabel("System name")).toBeVisible();
  });

  test("the ?control= query param preselects the right control", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AU-6");
    await expect(page.getByRole("heading", { name: "Audit Record Review, Analysis, and Reporting" })).toBeVisible();
  });
});
