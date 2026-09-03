import { test, expect } from "@playwright/test";
import { gotoReady } from "./fixtures";

test.describe("Control Library", () => {
  test("can search for a control by ID and view its detail", async ({ page }) => {
    await gotoReady(page, "/control-library");
    await page.getByPlaceholder("Search by ID or keyword...").fill("AC-2");
    await expect(page.getByRole("option", { name: /AC-2/ })).toBeVisible();
    await page.getByRole("option", { name: /AC-2/ }).click();
    await expect(page.getByRole("heading", { name: "Account Management" })).toBeVisible();
    await expect(page.getByText(/Purpose/)).toBeVisible();
  });

  test("filters controls by family", async ({ page }) => {
    await gotoReady(page, "/control-library");
    await page.getByLabel("Filter by control family").selectOption("AU");
    await expect(page.getByRole("option", { name: /AU-2/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /AC-2/ })).toHaveCount(0);
  });

  test('"start a review from this control" links to New Review with the control preselected', async ({ page }) => {
    await gotoReady(page, "/control-library");
    await page.getByRole("option", { name: /AC-2/ }).click();
    await page.getByRole("link", { name: "Start a review from this control" }).click();
    await expect(page).toHaveURL(/\/new-review\?control=AC-2/);
    await expect(page.getByRole("heading", { name: "Account Management" })).toBeVisible();
  });
});
