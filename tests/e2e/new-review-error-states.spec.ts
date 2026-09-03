import { test, expect } from "@playwright/test";
import { gotoReady } from "./fixtures";

// Spec section 19 error conditions covered here: AI provider unavailable,
// malformed AI response, MCP unavailable -- all simulated via route
// interception so they're deterministic and don't depend on real failures.
test.describe("New Review -- error handling", () => {
  test("shows a clear message when the AI provider fails", async ({ page }) => {
    await page.route("**/api/review", async (route) => {
      await route.fulfill({
        status: 502,
        json: { error: "The AI provider request failed. Please try again in a moment.", source: "ai_provider" },
      });
    });
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await expect(page.getByText("Review failed")).toBeVisible();
    await expect(page.getByText(/AI provider request failed/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("shows a clear message on a malformed AI response", async ({ page }) => {
    await page.route("**/api/review", async (route) => {
      await route.fulfill({
        status: 502,
        json: {
          error: "The AI's response did not match the required structure and was rejected.",
          source: "malformed_ai_response",
        },
      });
    });
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await expect(page.getByText(/did not match the required structure/)).toBeVisible();
  });

  test("shows a clear message when MCP validation is unavailable", async ({ page }) => {
    await page.route("**/api/review", async (route) => {
      await route.fulfill({
        status: 502,
        json: { error: "MCP validation is currently unavailable. Please try again.", source: "mcp_unavailable" },
      });
    });
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await expect(page.getByText(/MCP validation is currently unavailable/)).toBeVisible();
  });

  test('"Try again" returns to the form without losing the selected control', async ({ page }) => {
    await page.route("**/api/review", async (route) => {
      await route.fulfill({ status: 500, json: { error: "The server is not configured with an Anthropic API key yet." } });
    });
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { name: "Account Management" })).toBeVisible();
    await expect(page.getByLabel("Implementation statement")).toBeVisible();
  });

  test("a network failure (server unreachable) shows a connection error, not a crash", async ({ page }) => {
    await page.route("**/api/review", async (route) => route.abort("failed"));
    await gotoReady(page, "/new-review?control=AC-2");
    await page.getByLabel("Implementation statement").fill("Test statement.");
    await page.getByRole("button", { name: "Review Implementation" }).click();
    await expect(page.getByText(/Couldn't reach the server/)).toBeVisible();
  });
});
