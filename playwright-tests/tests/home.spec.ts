import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with correct title and key sections visible', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Growth Partner | Marketing Digital');
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#inicio')).toBeVisible();
    await expect(page.locator('h1.hero__title')).toBeVisible();
  });
});
