import { test, expect } from '../../fixtures/pages.fixture';
import { homeCtas, homeNavItems } from '../../data/home.data';

test.describe('Home CTAs', () => {
  for (const cta of homeCtas) {
    const where = cta.scope ? ` (in ${cta.scope})` : '';
    test(`"${cta.name}"${where} scrolls to the ${cta.targetId} section`, async ({ page, homePage }) => {
      const link = homePage.ctaLink(cta.name, cta.scope);
      const target = homePage.section(cta.targetId);
      // Distance from the target's top edge to the bottom of the fixed header
      // (scroll-padding-top is the header height, so an anchor jump lands at 0).
      const offsetBelowHeader = () => target.evaluate(el =>
        el.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));

      await homePage.goto();
      await link.scrollIntoViewIfNeeded();
      // The target may already peek in (e.g. a CTA right above it), but it must not be scrolled to yet.
      expect(await offsetBelowHeader()).toBeGreaterThan(50);

      await link.click();

      await expect(page).toHaveURL(new RegExp(`#${cta.targetId}$`));
      await expect.poll(async () => Math.abs(await offsetBelowHeader())).toBeLessThan(2);
      await expect(target).toBeInViewport();
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

  test('nav link "Nosotros" opens the Nosotros page', async ({ page, homePage, nosotrosPage, isMobile }) => {
    await homePage.goto();

    if (isMobile) await homePage.burger.click();
    await homePage.navLink('Nosotros').click();

    await expect(page).toHaveURL(/\/nosotros(\.html)?$/);
    await expect(nosotrosPage.navLink('Nosotros')).toHaveClass(/active/);
  });

  test('gets the scrolled style when the page is scrolled down', async ({ page, homePage }) => {
    await homePage.goto();
    await expect(homePage.header).not.toHaveClass(/scrolled/);

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(homePage.header).toHaveClass(/scrolled/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(homePage.header).not.toHaveClass(/scrolled/);
  });
});
