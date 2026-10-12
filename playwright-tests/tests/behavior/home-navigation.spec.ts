import { test, expect } from '../../fixtures/pages.fixture';
import { homeCtas, homeNavItems } from '../../data/home.data';

test.describe('Home CTAs', () => {
  for (const cta of homeCtas) {
    test(`"${cta.name}" scrolls to the ${cta.targetId} section`, async ({ page, homePage }) => {
      await homePage.goto();
      await homePage.ctaLink(cta.name).scrollIntoViewIfNeeded();
      await expect(homePage.section(cta.targetId)).not.toBeInViewport();

      await homePage.ctaLink(cta.name).click();

      await expect(page).toHaveURL(new RegExp(`#${cta.targetId}$`));
      await expect(homePage.section(cta.targetId)).toBeInViewport();
    });
  }
});

test.describe('Home header', () => {
  test('logo returns to the top of the page', async ({ page, homePage }) => {
    await homePage.goto('#contacto');
    await expect(homePage.heroTitle).not.toBeInViewport();

    await homePage.logo.click();

    await expect(page).toHaveURL(/#inicio$/);
    await expect(homePage.heroTitle).toBeInViewport();
  });

  for (const item of homeNavItems) {
    test(`nav link "${item.name}" scrolls to its section and becomes active`, async ({ page, homePage, isMobile }) => {
      // Start away from the target so the scroll is observable.
      await homePage.goto(item.targetId === 'inicio' ? '#contacto' : '');
      await expect(homePage.section(item.targetId)).not.toBeInViewport();

      if (isMobile) await homePage.burger.click();
      await homePage.navLink(item.name).click();

      await expect(page).toHaveURL(new RegExp(`#${item.targetId}$`));
      await expect(homePage.section(item.targetId)).toBeInViewport();
      await expect(homePage.navLink(item.name)).toHaveClass(/active/);
      for (const other of homeNavItems.filter(i => i !== item)) {
        await expect(homePage.navLink(other.name)).not.toHaveClass(/active/);
      }
    });
  }

  test('gets the scrolled style when the page is scrolled down', async ({ page, homePage }) => {
    await homePage.goto();
    await expect(homePage.header).not.toHaveClass(/scrolled/);

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(homePage.header).toHaveClass(/scrolled/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(homePage.header).not.toHaveClass(/scrolled/);
  });
});
