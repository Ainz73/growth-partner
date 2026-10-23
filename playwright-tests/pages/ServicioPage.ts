import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ServicioPage extends BasePage {
  readonly heroTitle = this.page.locator('h1.service-hero__title');
  readonly heroCta = this.page.locator('.service-hero').getByRole('link', { name: 'Hablemos de tu negocio', exact: true });

  constructor(page: Page) {
    super(page);
  }
}
