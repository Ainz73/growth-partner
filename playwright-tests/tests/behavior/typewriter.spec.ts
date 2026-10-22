import type { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/pages.fixture';

// Render every state the loop can reach and count the distinct positions of the next block.
const distinctPositionsBelow = (page: Page) => page.evaluate(() => {
  const el = document.querySelector<HTMLElement>('.typewriter')!;
  const below = document.querySelector('.hero-intro__text')!;
  const tops = new Set<number>();
  for (const word of el.dataset.words!.split(',')) {
    for (let i = 0; i <= word.length; i++) {
      el.textContent = word.slice(0, i);
      tops.add(Math.round(below.getBoundingClientRect().top + window.scrollY));
    }
  }
  return tops.size;
});

test.describe('Hero typewriter', () => {
  // The animated branch only runs without reduced motion.
  test.use({ reducedMotion: 'no-preference' });

  for (const width of [320, 412, 768, 1024, 1280, 1920]) {
    test(`typing never moves the content below it at ${width}px`, async ({ page, homePage }) => {
      await page.setViewportSize({ width, height: 900 });
      await homePage.goto();

      await expect.poll(() => distinctPositionsBelow(page)).toBe(1);
    });
  }

  test('re-measures the reserved height when the viewport width changes', async ({ page, homePage }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await homePage.goto();
    await page.evaluate(() => document.fonts.ready);

    const subtitle = page.locator('.hero__subtitle');
    const reservedHeight = () => subtitle.evaluate(el => parseFloat((el as HTMLElement).style.minHeight) || 0);
    await expect.poll(reservedHeight).toBeGreaterThan(0);
    const wide = await reservedHeight();

    // The longest word wraps onto more lines on a narrow phone.
    await page.setViewportSize({ width: 320, height: 900 });
    await expect.poll(reservedHeight).toBeGreaterThan(wide);
    await expect.poll(() => distinctPositionsBelow(page)).toBe(1);
  });
});

test.describe('Hero subtitle', () => {
  test('keeps a space between the cursor and the rest of the sentence', async ({ page, homePage }) => {
    await homePage.goto();

    await expect(page.locator('.hero__subtitle'))
      .toHaveText(/\|\s+en oportunidades de crecimiento para tu negocio\./, { useInnerText: true });
  });
});
