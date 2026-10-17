import { test, expect } from '../../fixtures/pages.fixture';
import { allPages } from '../../data/pages.data';

test.describe('Page health', () => {
  for (const sitePage of allPages) {
    test(`${sitePage.name}: loads without JavaScript errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await page.goto(sitePage.path);
      await page.waitForLoadState('load');

      expect(errors).toEqual([]);
    });

    test(`${sitePage.name}: has no horizontal overflow`, async ({ page }) => {
      await page.goto(sitePage.path);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test(`${sitePage.name}: internal links resolve`, async ({ page, request }) => {
      await page.goto(sitePage.path);

      const links = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
          .filter(a => a.origin === location.origin)
          .map(a => ({ url: a.origin + a.pathname, hash: a.hash, samePage: a.pathname === location.pathname })));

      for (const url of new Set(links.map(link => link.url))) {
        const response = await request.get(url);
        expect(response.status(), url).toBe(200);
      }

      // href="#" placeholders have an empty hash and are skipped.
      const samePageAnchors = new Set(links.filter(link => link.samePage && link.hash).map(link => link.hash));
      for (const hash of samePageAnchors) {
        await expect(page.locator(hash), `anchor ${hash}`).toHaveCount(1);
      }
    });

    test(`${sitePage.name}: images load`, async ({ page }) => {
      await page.goto(sitePage.path);

      for (const image of await page.locator('img').all()) {
        // Lazy images only fetch once scrolled near the viewport.
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth), { message: await image.getAttribute('src') ?? '' })
          .toBeGreaterThan(0);
      }
    });
  }
});
