import type { Locator } from '@playwright/test';
import { test, expect } from '../../fixtures/pages.fixture';
import { homePageData, nosotrosPageData } from '../../data/pages.data';

// Both pages nest .review-card reveals inside a .reviews__grid reveal.
for (const sitePage of [homePageData, nosotrosPageData]) {
  test.describe(`Scroll reveal on ${sitePage.name}`, () => {
    test('does not flicker when an element is parked at the top edge of the viewport', async ({ page }) => {
      await page.goto(sitePage.path);
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

    test('replays when the element is scrolled back in from below', async ({ page }) => {
      await page.goto(sitePage.path);
      const grid = page.locator('.reviews__grid');
      await grid.scrollIntoViewIfNeeded();
      await expect(grid).toHaveClass(/is-visible/);

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(grid).not.toHaveClass(/is-visible/);

      await grid.scrollIntoViewIfNeeded();
      await expect(grid).toHaveClass(/is-visible/);
    });
  });
}

test.describe('Reveal on page load', () => {
  // Records when each .reveal first gets is-visible and whether its opacity
  // transition actually ran, from before any page script executes.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const shownAt = new Map<Element, number>();
      const transitioned = new Set<Element>();
      (window as any).__reveal = { shownAt, transitioned };
      new MutationObserver(records => {
        for (const { target } of records) {
          const el = target as Element;
          if (el.classList.contains('is-visible') && !shownAt.has(el)) shownAt.set(el, performance.now());
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
      window.addEventListener('transitionrun', event => {
        if (event.propertyName === 'opacity') transitioned.add(event.target as Element);
      }, true);
    });
  });

  const revealState = (el: Element) => {
    const { shownAt, transitioned } = (window as any).__reveal;
    return {
      shownAt: shownAt.get(el) as number,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      transitioned: transitioned.has(el) as boolean,
    };
  };

  // Elements on screen at load used to get is-visible before their hidden state
  // was ever painted, so they popped in instead of animating.
  const expectAnimatedIn = async (hero: Locator) => {
    await expect(hero).toHaveClass(/is-visible/);
    const state = await hero.evaluate(revealState);
    expect(state.firstPaint).toBeDefined();
    expect(state.shownAt).toBeGreaterThanOrEqual(state.firstPaint);
    // transitionrun is dispatched on the next animation frame, not when the class changes.
    await expect.poll(async () => (await hero.evaluate(revealState)).transitioned).toBe(true);
  };

  test('home hero animates in after the first paint', async ({ page, homePage }) => {
    await homePage.goto();
    await expectAnimatedIn(page.locator('h1.hero__title'));
  });

  test('Nosotros hero animates in when opened from the nav', async ({ page, homePage, isMobile }) => {
    await homePage.goto();
    if (isMobile) await homePage.burger.click();
    await homePage.navLink('Nosotros').click();
    await expect(page).toHaveURL(/\/nosotros(\.html)?$/);

    await expectAnimatedIn(page.locator('h1.about-hero__title'));
  });
});

test.describe('Reveal start fallbacks', () => {
  test('still reveals without PerformanceObserver', async ({ page, nosotrosPage }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'PerformanceObserver', { value: undefined, configurable: true });
    });
    await nosotrosPage.goto();

    await expect(nosotrosPage.heroTitle).toHaveClass(/is-visible/);
  });

  test('still reveals when no paint entry is ever reported', async ({ page, nosotrosPage }) => {
    await page.addInitScript(() => {
      class SilentPerformanceObserver {
        static supportedEntryTypes = ['paint'];
        observe() {}
        disconnect() {}
      }
      Object.defineProperty(window, 'PerformanceObserver', { value: SilentPerformanceObserver, configurable: true });
    });
    await nosotrosPage.goto();

    // script.js falls back to a 1s timeout.
    await expect(nosotrosPage.heroTitle).toHaveClass(/is-visible/, { timeout: 3000 });
  });
});
