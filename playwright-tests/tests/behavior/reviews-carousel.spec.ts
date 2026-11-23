import { test, expect } from '../../fixtures/pages.fixture';
import { homePageData, nosotrosPageData } from '../../data/pages.data';
import { reviewAuthors } from '../../data/home.data';

for (const sitePage of [homePageData, nosotrosPageData]) {
  test.describe(`Reviews carousel on ${sitePage.name}`, () => {
    test('starts Swiper with the first review in the centre', async ({ page, homePage }) => {
      await page.goto(sitePage.path);

      await expect(page.locator('.reviews__swiper')).toHaveClass(/swiper-initialized/);
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[0]);
    });

    test('clones are hidden from assistive tech', async ({ page }) => {
      await page.goto(sitePage.path);
      await expect(page.locator('.reviews__swiper')).toHaveClass(/swiper-initialized/);

      await expect(page.locator('.review-card--clone')).toHaveCount(reviewAuthors.length);
      const cloneSlides = page.locator('.swiper-slide:has(.review-card--clone)');
      await expect(cloneSlides).toHaveCount(reviewAuthors.length);
      for (const slide of await cloneSlides.all()) {
        await expect(slide).toHaveAttribute('aria-hidden', 'true');
        await expect(slide).toHaveAttribute('inert', '');
      }
    });

    test('reviews stay readable without Swiper', async ({ page }) => {
      await page.route('**/swiper-bundle.min.js', route => route.abort());
      await page.goto(sitePage.path);
      await page.locator('.reviews__carousel').scrollIntoViewIfNeeded();
      await expect(page.locator('.reviews__carousel')).toHaveClass(/is-visible/);

      const cards = page.locator('.review-card');
      await expect(cards).toHaveCount(reviewAuthors.length);
      for (const card of await cards.all()) {
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible();
        await expect(card).toHaveCSS('opacity', '1');
      }
    });
  });
}
