import { test, expect } from '../../fixtures/pages.fixture';
import { headerNavLinks, nosotrosPageData, servicioPages } from '../../data/pages.data';
import { BasePage } from '../../pages/BasePage';

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

  for (const sitePage of [nosotrosPageData, servicioPages[0]]) {
    test(`${sitePage.name}: burger opens the menu and its links lead back home`, async ({ page, homePage, isMobile }) => {
      test.skip(!isMobile, 'Burger menu only renders on mobile viewports');
      const subpage = new BasePage(page);
      await subpage.goto(sitePage.path);

      // Closed, the menu is slid out above the viewport.
      await expect(subpage.burger).toBeVisible();
      await expect(subpage.nav).not.toHaveClass(/open/);
      await expect(subpage.navLink('Inicio')).not.toBeInViewport();

      await subpage.burger.click();
      await expect(subpage.nav).toHaveClass(/open/);
      for (const name of headerNavLinks) await expect(subpage.navLink(name)).toBeInViewport();

      await subpage.burger.click();
      await expect(subpage.nav).not.toHaveClass(/open/);

      await subpage.burger.click();
      await subpage.navLink('Contáctanos').click();
      await expect(page).toHaveURL(/#contacto$/);
      await expect(homePage.section('contacto')).toBeInViewport();
    });
  }
});
