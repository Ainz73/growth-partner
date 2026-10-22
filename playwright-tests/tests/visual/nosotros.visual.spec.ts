import { test, expect } from '../../fixtures/pages.fixture';

test('nosotros page matches visual baseline', async ({ page, nosotrosPage }) => {
  await nosotrosPage.goto();
  await nosotrosPage.prepareForVisualSnapshot();

  await expect(page).toHaveScreenshot('nosotros.png', { fullPage: true });
});
