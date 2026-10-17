import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class NosotrosPage extends BasePage {
  readonly heroTitle = this.page.locator('h1.hero__title');
  readonly valueCards = this.page.locator('.values .value-card');
  readonly teamLead = this.page.locator('.team .team-lead');
  readonly teamMembers = this.page.locator('.team .team-member');
  readonly reviewCards = this.page.locator('.reviews .review-card');
  readonly cta = this.page.locator('.about-cta');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/nosotros.html');
  }
}
