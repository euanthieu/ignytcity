import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("dark mode is active by default", async ({ page }) => {
    await page.goto("/");
    // The html element should have the dark class applied by next-themes
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/, { timeout: 3000 });
  });

  test("clicking the theme toggle switches to light mode", async ({ page }) => {
    await page.goto("/");

    // Find the theme toggle button (contains Sun or Moon icon)
    const toggleBtn = page.locator("nav button").first();
    await toggleBtn.click();

    const html = page.locator("html");
    // After toggle, dark class should be removed
    await expect(html).not.toHaveClass(/dark/, { timeout: 2000 });
  });

  test("clicking the theme toggle twice returns to dark mode", async ({
    page,
  }) => {
    await page.goto("/");

    const toggleBtn = page.locator("nav button").first();
    await toggleBtn.click(); // → light
    await toggleBtn.click(); // → dark again

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/, { timeout: 2000 });
  });
});
