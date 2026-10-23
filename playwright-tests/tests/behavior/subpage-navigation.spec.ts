import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

test.describe('Servicio pages navigation', () => {
  for (const servicio of servicioPages) {
    test(`${servicio.name}: hero CTA "Hablemos de tu negocio" opens the home contact section`, async ({ page, servicioPage, homePage }) => {
      await servicioPage.goto(servicio.path);

      await expect(servicioPage.heroCta).toHaveAttribute('href', '../index.html#contacto');
      await servicioPage.heroCta.click();

      await expect(page).toHaveURL(/#contacto$/);
      await expect(homePage.section('contacto')).toBeInViewport();
    });

    test(`${servicio.name}: nav link "Nosotros" opens the Nosotros page`, async ({ page, servicioPage, nosotrosPage, isMobile }) => {
      await servicioPage.goto(servicio.path);

      if (isMobile) await servicioPage.burger.click();
      await servicioPage.navLink('Nosotros').click();

      await expect(page).toHaveURL(/\/nosotros(\.html)?$/);
      await expect(nosotrosPage.heroTitle).toBeVisible();
    });
  }
});

test.describe('Nosotros scroll-spy', () => {
  test('keeps "Nosotros" active while scrolling the whole page', async ({ page, nosotrosPage }) => {
    await nosotrosPage.goto();

    // Step through the page so the scroll-spy observer gets a chance to fire at every height.
    await page.evaluate(async () => {
      const nextFrames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      for (let y = 0; y <= document.documentElement.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await nextFrames();
      }
    });
    await expect(nosotrosPage.footer).toBeInViewport();

    await expect(nosotrosPage.navLink('Nosotros')).toHaveClass(/active/);
    for (const name of ['Inicio', 'Servicios', 'Contáctanos']) {
      await expect(nosotrosPage.navLink(name)).not.toHaveClass(/active/);
    }
  });
});
