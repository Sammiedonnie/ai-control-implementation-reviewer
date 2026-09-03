import { test, expect } from "@playwright/test";
import { gotoReady } from "./fixtures";

test("DIAGNOSTIC: inspect textarea and button state after fill", async ({ page }) => {
  await gotoReady(page, "/new-review?control=AC-2");
  const textarea = page.getByLabel("Implementation statement");
  const button = page.getByRole("button", { name: "Review Implementation" });

  console.log("BEFORE FILL:");
  console.log("  textarea value:", await textarea.inputValue());
  console.log("  textarea editable:", await textarea.isEditable());
  console.log("  button disabled attr:", await button.getAttribute("disabled"));

  await textarea.fill("A test statement.");

  console.log("AFTER FILL:");
  console.log("  textarea value:", await textarea.inputValue());
  console.log("  button disabled attr:", await button.getAttribute("disabled"));

  // Check for any React hydration/console errors captured during the test
  page.on("console", (msg) => console.log("BROWSER CONSOLE:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("BROWSER PAGE ERROR:", err.message));

  await page.waitForTimeout(500);
  console.log("AFTER WAIT:");
  console.log("  button disabled attr:", await button.getAttribute("disabled"));
});
