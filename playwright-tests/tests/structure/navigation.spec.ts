import { test, expect } from '../../fixtures/pages.fixture';
import { allPages, headerNavLinks, servicioPages } from '../../data/pages.data';
import { BasePage } from '../../pages/BasePage';

test.describe('Shared header', () => {
  for (const sitePage of allPages) {
    test(`${sitePage.name}: has the same nav links as every other page`, async ({ page }) => {
      const sitePageObject = new BasePage(page);
      await sitePageObject.goto(sitePage.path);

      await expect(sitePageObject.nav.getByRole('link')).toHaveText(headerNavLinks);
      // The header's own CTA button was dropped from the servicio pages.
      await expect(sitePageObject.header.locator('.btn')).toHaveCount(0);
    });
  }
});

test.describe('Home navigation', () => {
  test('header links point to the right sections', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.navLink('Inicio')).toHaveAttribute('href', '#inicio');
    await expect(homePage.navLink('Servicios')).toHaveAttribute('href', '#servicios');
    await expect(homePage.navLink('Nosotros')).toHaveAttribute('href', 'nosotros.html');
    await expect(homePage.navLink('Contáctanos')).toHaveAttribute('href', '#contacto');
  });

  test('footer links point to the right sections', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.footerLink('Inicio')).toHaveAttribute('href', '#inicio');
    await expect(homePage.footerLink('Servicios')).toHaveAttribute('href', '#servicios');
    await expect(homePage.footerLink('Nosotros')).toHaveAttribute('href', 'nosotros.html');
    await expect(homePage.footerLink('Contáctanos')).toHaveAttribute('href', '#contacto');
  });
});

test.describe('Servicio pages navigation', () => {
  for (const servicio of servicioPages) {
    test(`${servicio.name}: header and footer link back to home sections`, async ({ servicioPage }) => {
      await servicioPage.goto(servicio.path);

      await expect(servicioPage.navLink('Inicio')).toHaveAttribute('href', '../index.html#inicio');
      await expect(servicioPage.navLink('Servicios')).toHaveAttribute('href', '../index.html#servicios');
      await expect(servicioPage.navLink('Nosotros')).toHaveAttribute('href', '../nosotros.html');
      await expect(servicioPage.navLink('Contáctanos')).toHaveAttribute('href', '../index.html#contacto');
      await expect(servicioPage.navLink('Servicios')).toHaveClass(/active/);

      await expect(servicioPage.footerLink('Inicio')).toHaveAttribute('href', '../index.html#inicio');
      await expect(servicioPage.footerLink('Servicios')).toHaveAttribute('href', '../index.html#servicios');
      await expect(servicioPage.footerLink('Nosotros')).toHaveAttribute('href', '../nosotros.html');
      await expect(servicioPage.footerLink('Contáctanos')).toHaveAttribute('href', '../index.html#contacto');
    });
  }
});
