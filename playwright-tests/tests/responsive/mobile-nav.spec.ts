import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Mobile navigation', () => {
  test('burger toggles the nav menu open and closed', async ({ homePage, isMobile }) => {
    test.skip(!isMobile, 'Burger menu only renders on mobile viewports');

    await homePage.goto();

    await expect(homePage.burger).toBeVisible();
    await expect(homePage.nav).not.toHaveClass(/open/);

    await homePage.burger.click();
    await expect(homePage.nav).toHaveClass(/open/);
    await expect(homePage.burger).toHaveClass(/open/);

    await homePage.navLink('Inicio').click();
    await expect(homePage.nav).not.toHaveClass(/open/);
  });
});
