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

  async prepareForVisualSnapshot() {
    await this.page.addStyleTag({
      content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }',
    });
    await this.page.evaluate(() => {
      // In this environment, Playwright's `reducedMotion` context option does not
      // reliably flip `window.matchMedia('(prefers-reduced-motion: reduce)')` before
      // script.js's DOMContentLoaded handler runs, so the typewriter's setTimeout-based
      // tick() recursion can already be in flight. A one-time textContent write alone
      // gets clobbered by the next scheduled tick (observed within ~1 tick / <=80ms).
      // Clear all pending timeouts first so nothing can overwrite our override afterward.
      const highestTimeoutId = window.setTimeout(() => {}, 0);
      for (let id = 0; id <= highestTimeoutId; id++) window.clearTimeout(id);

      const typewriter = document.querySelector<HTMLElement>('.typewriter');
      const cursor = document.querySelector<HTMLElement>('.typewriter-cursor');
      if (typewriter) {
        const words = typewriter.dataset.words?.split(',') ?? [];
        if (words[0]) typewriter.textContent = words[0];
      }
      if (cursor) cursor.style.display = 'none';
    });
  }
}
