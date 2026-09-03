import { test, expect } from "@playwright/test";
import { gotoReady } from "./fixtures";
import { MOCK_ASSESSMENT } from "./fixtures";

// These tests intercept POST /api/review so they run without a real
// Anthropic API key, real network access, or any API cost -- they verify
// the UI's handling of a structured assessment response, per spec section
// 19: "receiving a structured result, viewing the gap analysis, viewing
// source validation, printing or downloading the report".
test.describe("New Review -- successful assessment (mocked AI response)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/review", async (route) => {
      await route.fulfill({ json: { assessment: MOCK_ASSESSMENT } });
    });
  });

  test("submitting a statement renders a structured result with the Summary tab active", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill(
      "The IT Security team reviews active user accounts quarterly and disables accounts that are no longer required."
    );
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await expect(page.getByText("Partially Implemented")).toBeVisible();
    await expect(page.getByText("61%")).toBeVisible();
  });

  test("the Gaps tab shows the gap analysis", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement for gap analysis.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await page.getByRole("button", { name: "Gaps" }).click();
    // Use the heading role specifically -- "No evidence retention location"
    // also appears as plain text in the control's generic "Common gaps"
    // reference list elsewhere on the page, so a bare text match is
    // ambiguous. The gap card's title is rendered as an <h3>.
    await expect(
      page.getByRole("heading", { name: "No evidence retention location" })
    ).toBeVisible();
    await expect(page.getByText("Moderate")).toBeVisible();
  });

  test("the Validation Sources tab shows MCP source references", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement for sources.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await page.getByRole("button", { name: "Validation Sources" }).click();
    await expect(page.getByText(/csrc\.nist\.gov/)).toBeVisible();
  });

  test("a Download report button appears and triggers a file download", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement for download.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download report" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^assessment-AC-2-.*\.html$/);
  });

  test("the review is saved and appears in Review History", async ({ page }) => {
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement for history.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await expect(page.getByText("Saved to your Review History")).toBeVisible();
    await gotoReady(page, "/history");
    await expect(page.getByText("AC-2").first()).toBeVisible();
  });
});
