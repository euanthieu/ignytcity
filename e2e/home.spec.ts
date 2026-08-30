import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Boilerplate 2026/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation bar is visible", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("Get Started button is visible and clickable", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: /get started/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test("View Specs button scrolls to specs section", async ({ page }) => {
    await page.goto("/");
    const specsBtn = page.getByRole("button", { name: /view specs/i });
    await specsBtn.click();

    // Specs section becomes visible after scroll
    const specsSection = page.locator("#specs");
    await expect(specsSection).toBeInViewport({ timeout: 2000 });
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
