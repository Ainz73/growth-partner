import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

for (const servicio of servicioPages) {
  test(`${servicio.name} page matches visual baseline`, async ({ page, servicioPage }) => {
    await servicioPage.goto(servicio.path);
    await servicioPage.prepareForVisualSnapshot();

    await expect(page).toHaveScreenshot(`${servicio.name}.png`, { fullPage: true });
  });
}
