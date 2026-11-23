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
      }
    });

    test('shows exactly three different reviews: centre and one per side', async ({ page, homePage }) => {
      await page.goto(sitePage.path);
      await expect(page.locator('.reviews__swiper')).toHaveClass(/swiper-initialized/);

      const visibleNames = () => page.locator('.reviews__swiper .swiper-slide').evaluateAll(slides =>
        slides
          .filter(slide => getComputedStyle(slide).opacity !== '0')
          .map(slide => slide.querySelector('.review-card__name')!.textContent!.trim())
          .sort());
      const expected = [...reviewAuthors].sort();

      await expect.poll(visibleNames).toEqual(expected);
      await homePage.reviewDots.nth(1).click();
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[1]);
      await expect.poll(visibleNames).toEqual(expected);
    });

    test('clicking the left review brings it to the centre', async ({ page, homePage }) => {
      await page.mouse.move(0, 0);
      await page.goto(sitePage.path);
      await homePage.reviewsCarousel.scrollIntoViewIfNeeded();
      await expect(homePage.reviewsCarousel).toHaveClass(/is-visible/);

      // At the start the left neighbour is a loop clone of the last review.
      await homePage.reviewsCarousel.locator('.swiper-slide-prev').click();
      const last = reviewAuthors[reviewAuthors.length - 1];
      await expect(homePage.activeReviewName).toHaveText(last);
      await expect(homePage.reviewDots.last()).toHaveAttribute('aria-current', 'true');
    });

    test('dragging the centre review left shows the next one', async ({ page, homePage }) => {
      await page.goto(sitePage.path);
      await homePage.reviewsCarousel.scrollIntoViewIfNeeded();
      await expect(homePage.reviewsCarousel).toHaveClass(/is-visible/);

      const box = (await homePage.reviewsCarousel.locator('.swiper-slide-active').boundingBox())!;
      const y = box.y + box.height / 2;
      await page.mouse.move(box.x + box.width * 0.8, y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.1, y, { steps: 10 });
      await page.mouse.up();
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[1]);
    });

    test('pauses while a dot has keyboard focus', async ({ page, homePage }) => {
      await page.mouse.move(0, 0);
      await page.goto(sitePage.path);
      await homePage.reviewDots.nth(0).focus();

      await page.waitForTimeout(7000);
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[0]);
    });

    test('slides are announced in Spanish counting real reviews', async ({ page }) => {
      await page.goto(sitePage.path);

      const firstReal = page.locator('.swiper-slide:not(:has(.review-card--clone))').first();
      await expect(firstReal).toHaveAttribute('aria-label', `1 de ${reviewAuthors.length}`);
      await expect(firstReal).toHaveAttribute('aria-roledescription', 'reseña');
    });

    test('dots are at least 24px tap targets', async ({ page, homePage }) => {
      await page.goto(sitePage.path);

      for (const dot of await homePage.reviewDots.all()) {
        const box = (await dot.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(24);
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

    test('shows one dot per review', async ({ page, homePage }) => {
      await page.goto(sitePage.path);

      await expect(homePage.reviewDots).toHaveCount(reviewAuthors.length);
      for (const [index, author] of reviewAuthors.entries()) {
        const dot = homePage.reviewDots.nth(index);
        await expect(dot).toHaveAttribute('aria-label', `Ver reseña de ${author}`);
        await expect(dot).toHaveAttribute('aria-current', index === 0 ? 'true' : 'false');
      }
    });

    test('a dot brings its review to the centre', async ({ page, homePage }) => {
      await page.goto(sitePage.path);

      await homePage.reviewDots.nth(2).click();
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[2]);
      await expect(homePage.reviewDots.nth(2)).toHaveAttribute('aria-current', 'true');
      await expect(homePage.reviewDots.nth(0)).toHaveAttribute('aria-current', 'false');
    });

    test('dots work from the keyboard', async ({ page, homePage }) => {
      await page.goto(sitePage.path);

      await homePage.reviewDots.nth(1).focus();
      await page.keyboard.press('Enter');
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[1]);
    });

    test('clicking a side review brings it to the centre', async ({ page, homePage }) => {
      await page.goto(sitePage.path);
      await homePage.reviewsCarousel.scrollIntoViewIfNeeded();
      await expect(homePage.reviewsCarousel).toHaveClass(/is-visible/);

      const next = homePage.reviewsCarousel.locator('.swiper-slide-next');
      const name = (await next.locator('.review-card__name').textContent())!;
      await next.click();
      await expect(homePage.activeReviewName).toHaveText(name);
      await expect(homePage.reviewDots.nth(reviewAuthors.indexOf(name))).toHaveAttribute('aria-current', 'true');
    });

    test('advances on its own every 6 seconds', async ({ page, homePage }) => {
      await page.mouse.move(0, 0);
      await page.goto(sitePage.path);

      await page.waitForTimeout(4000);
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[0]);
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[1], { timeout: 4000 });
    });

    test('pauses while hovered', async ({ page, homePage }) => {
      await page.goto(sitePage.path);
      await homePage.reviewsCarousel.scrollIntoViewIfNeeded();
      await homePage.reviewsCarousel.locator('.swiper-slide-active').hover();

      await page.waitForTimeout(7000);
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[0]);
    });

    test('reduced motion: no autoplay, flat', async ({ page, homePage }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.mouse.move(0, 0);
      await page.goto(sitePage.path);

      await page.waitForTimeout(7000);
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[0]);
      const rotate = await page.locator('.reviews__swiper').evaluate((el: any) => el.swiper.params.coverflowEffect.rotate);
      expect(rotate).toBe(0);

      await homePage.reviewDots.nth(1).click();
      await expect(homePage.activeReviewName).toHaveText(reviewAuthors[1]);
    });
  });
}

test('six real reviews: no clones, six dots', async ({ page, homePage }) => {
  await page.route(/\/$/, async route => {
    const response = await route.fetch();
    const html = await response.text();
    const doubled = html.replace(
      /(<div class="swiper-wrapper">)([\s\S]*?)(\s*<\/div>\s*<\/div>\s*<div class="reviews__dots")/,
      (_, open, slides, close) => open + slides + slides.replace(/(review-card__name">)([^<]+)/g, '$1$2 B') + close,
    );
    await route.fulfill({ response, body: doubled });
  });
  await homePage.goto();

  await expect(homePage.reviewDots).toHaveCount(reviewAuthors.length * 2);
  await expect(page.locator('.review-card--clone')).toHaveCount(0);
  await expect(homePage.reviewDots.nth(5)).toHaveAttribute('aria-label', `Ver reseña de ${reviewAuthors[2]} B`);
});
