import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Hero typewriter', () => {
  // The animated branch only runs without reduced motion.
  test.use({ reducedMotion: 'no-preference' });

  for (const width of [320, 412, 768, 1024, 1280, 1920]) {
    test(`typing never moves the content below it at ${width}px`, async ({ page, homePage }) => {
      await page.setViewportSize({ width, height: 900 });
      await homePage.goto();

      // Render every state the loop can reach and record where the next block sits.
      const positions = async () => page.evaluate(() => {
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

      await expect.poll(positions).toBe(1);
    });
  }
});
