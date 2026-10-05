import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

test.describe('Servicio pages', () => {
  for (const servicio of servicioPages) {
    test(`${servicio.name}: loads with correct title and hero`, async ({ page, servicioPage }) => {
      await servicioPage.goto(servicio.path);

      await expect(page).toHaveTitle(servicio.title);
      await expect(servicioPage.header).toBeVisible();
      await expect(servicioPage.heroTitle).toBeVisible();
      await expect(servicioPage.heroTitle).toContainText(servicio.heroTextContains);
      await expect(servicioPage.footer).toBeVisible();
    });
  }
});
