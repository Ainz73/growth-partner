import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ServicioPage } from '../pages/ServicioPage';

type Fixtures = {
  homePage: HomePage;
  servicioPage: ServicioPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  servicioPage: async ({ page }, use) => {
    await use(new ServicioPage(page));
  },
});

export { expect };
