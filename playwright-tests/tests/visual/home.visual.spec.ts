import { test, expect } from '../../fixtures/pages.fixture';

test('home page matches visual baseline', async ({ page, homePage }) => {
  await homePage.goto();
  await homePage.prepareForVisualSnapshot();

  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
});
