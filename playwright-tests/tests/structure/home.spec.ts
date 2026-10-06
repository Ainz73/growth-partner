import { test, expect } from '../../fixtures/pages.fixture';
import { homePageData } from '../../data/pages.data';

test.describe('Home page', () => {
  test('loads with correct title and key sections visible', async ({ page, homePage }) => {
    await homePage.goto();

    await expect(page).toHaveTitle(homePageData.title);
    await expect(homePage.header).toBeVisible();
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroTitle).toContainText(homePageData.heroTextContains);
    await expect(homePage.footer).toBeVisible();
  });
});
