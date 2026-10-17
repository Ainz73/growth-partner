import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Scroll reveal', () => {
  test('does not flicker when an element is parked at the top edge of the viewport', async ({ page, homePage }) => {
    await homePage.goto();
    const grid = page.locator('.reviews__grid');
    await grid.scrollIntoViewIfNeeded();
    await expect(grid).toHaveClass(/is-visible/);

    // Scroll so only ~15% of the panel (the reveal threshold) is left at the top of the viewport.
    // The hidden state shifts the element down, which used to bring it back across the threshold.
    await grid.evaluate(el => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + el.offsetHeight * 0.85, behavior: 'instant' });
    });
    await page.waitForTimeout(300);

    const flips = await page.evaluate(() => new Promise<number>(resolve => {
      let count = 0;
      const mo = new MutationObserver(ms => { count += ms.length; });
      document.querySelectorAll('.reveal').forEach(el => mo.observe(el, { attributes: true, attributeFilter: ['class'] }));
      setTimeout(() => { mo.disconnect(); resolve(count); }, 1000);
    }));
    expect(flips).toBe(0);
  });

  test('replays when the element is scrolled back in from below', async ({ page, homePage }) => {
    await homePage.goto();
    const grid = page.locator('.reviews__grid');
    await grid.scrollIntoViewIfNeeded();
    await expect(grid).toHaveClass(/is-visible/);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(grid).not.toHaveClass(/is-visible/);

    await grid.scrollIntoViewIfNeeded();
    await expect(grid).toHaveClass(/is-visible/);
  });
});
