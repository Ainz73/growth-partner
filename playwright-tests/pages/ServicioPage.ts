import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ServicioPage extends BasePage {
  readonly heroTitle = this.page.locator('h1.service-hero__title');

  constructor(page: Page) {
    super(page);
  }
}
