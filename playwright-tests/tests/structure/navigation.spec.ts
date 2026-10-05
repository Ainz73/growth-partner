import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

test.describe('Home navigation', () => {
  test('header links point to the right sections', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.navLink('Inicio')).toHaveAttribute('href', '#inicio');
    await expect(homePage.navLink('Servicios')).toHaveAttribute('href', '#servicios');
    await expect(homePage.navLink('Nosotros')).toHaveAttribute('href', '#nosotros');
    await expect(homePage.navLink('Contáctanos')).toHaveAttribute('href', '#contacto');
  });

  test('footer links point to the right sections', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.footerLink('Inicio')).toHaveAttribute('href', '#inicio');
    await expect(homePage.footerLink('Servicios')).toHaveAttribute('href', '#servicios');
    await expect(homePage.footerLink('Nosotros')).toHaveAttribute('href', '#nosotros');
    await expect(homePage.footerLink('Contáctanos')).toHaveAttribute('href', '#contacto');
  });
});

test.describe('Servicio pages navigation', () => {
  for (const servicio of servicioPages) {
    test(`${servicio.name}: header and footer link back to home sections`, async ({ servicioPage }) => {
      await servicioPage.goto(servicio.path);

      await expect(servicioPage.navLink('Inicio')).toHaveAttribute('href', '../index.html#inicio');
      await expect(servicioPage.navLink('Servicios')).toHaveAttribute('href', '../index.html#servicios');
      await expect(servicioPage.navLink('Reseñas')).toHaveAttribute('href', '../index.html#resenias');
      await expect(servicioPage.navLink('Contáctanos')).toHaveAttribute('href', '../index.html#contacto');

      await expect(servicioPage.footerLink('Inicio')).toHaveAttribute('href', '../index.html#inicio');
      await expect(servicioPage.footerLink('Servicios')).toHaveAttribute('href', '../index.html#servicios');
      await expect(servicioPage.footerLink('Nosotros')).toHaveAttribute('href', '../index.html#nosotros');
      await expect(servicioPage.footerLink('Contáctanos')).toHaveAttribute('href', '../index.html#contacto');
    });
  }
});
