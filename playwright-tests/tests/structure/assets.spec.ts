import { test, expect } from '../../fixtures/pages.fixture';
import { allPages } from '../../data/pages.data';

test.describe('Fonts and static assets', () => {
  for (const sitePage of allPages) {
    test(`${sitePage.name}: Work Sans loads at every weight used`, async ({ page }) => {
      const failedRequests: string[] = [];
      page.on('requestfailed', request => failedRequests.push(request.url()));

      await page.goto(sitePage.path);
      await page.evaluate(() => document.fonts.ready);

      for (const weight of ['400', '500', '700', '800']) {
        const loaded = await page.evaluate(
          w => document.fonts.check(`${w} 16px "Work Sans"`),
          weight,
        );
        expect(loaded, `weight ${weight}`).toBe(true);
      }

      // .clients__quote-text is an intentional Georgia/serif pull-quote accent
      // (assets/css/style.css:727-732), not a Work Sans regression.
      const families = await page.evaluate(() =>
        [...document.querySelectorAll('body, h1, h2, h3, .eyebrow, .section-title, p:not(.clients__quote-text), a, input')]
          .map(el => getComputedStyle(el).fontFamily)
          .filter((value, index, all) => all.indexOf(value) === index));
      for (const family of families) expect(family).toContain('Work Sans');

      const failedAssets = failedRequests.filter(url => /\.(ttf|woff2?|css)$/.test(url));
      expect(failedAssets).toEqual([]);
    });
  }
});
