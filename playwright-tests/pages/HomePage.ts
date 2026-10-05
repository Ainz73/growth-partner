import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroTitle = this.page.locator('h1.hero__title');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/');
  }
}
