import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly nav: Locator;
  readonly burger: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('#header');
    this.nav = page.locator('#nav');
    this.burger = page.locator('#burger');
    this.footer = page.locator('footer.footer');
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }

  footerLink(name: string): Locator {
    return this.footer.getByRole('link', { name, exact: true });
  }
}
