import { test, expect } from '../../fixtures/pages.fixture';
import { allPages, nosotrosPageData } from '../../data/pages.data';

test.describe('Reduced motion', () => {
  for (const sitePage of allPages) {
    test(`${sitePage.name}: reveals are not staggered`, async ({ page }) => {
      // The reducedMotion context option doesn't reach the page here (see playwright.config.ts);
      // emulateMedia does.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(sitePage.path);

      // Elements whose computed transition-delay has any non-zero entry.
      const delayed = await page.evaluate(() =>
        [...document.querySelectorAll('.reveal')]
          .filter(el => getComputedStyle(el).transitionDelay.split(',').some(d => parseFloat(d) !== 0))
          .map(el => `${el.className}: ${getComputedStyle(el).transitionDelay}`));
      expect(delayed).toEqual([]);
    });
  }

  test('nosotros: principles are not staggered at narrower widths either', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [1100, 900]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(nosotrosPageData.path);

      const delays = await page.locator('.value-card').evaluateAll(cards =>
        cards.map(card => getComputedStyle(card).transitionDelay));
      for (const delay of delays) expect(delay.split(',').every(d => parseFloat(d) === 0), `${width}px: ${delay}`).toBe(true);
    }
  });
});
