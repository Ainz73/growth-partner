import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';
import { serviceCards, processSteps, reviewAuthors } from '../../data/home.data';

test.describe('Home services section', () => {
  test('shows the six service cards with their links', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.serviceCards).toHaveCount(serviceCards.length);
    for (const [index, card] of serviceCards.entries()) {
      const cardLink = homePage.serviceCards.nth(index);
      await expect(cardLink.getByRole('heading')).toHaveText(card.title);
      await expect(cardLink).toHaveAttribute('href', card.path.replace(/^\//, ''));
      await expect(cardLink.locator('.card__number')).toHaveText(`0${index + 1}`);
    }
    // The whole card is the link, so the old "Ver servicio" labels were dropped.
    await expect(homePage.serviceCards.locator('.card__more')).toHaveCount(0);
  });

  for (const [index, card] of serviceCards.entries()) {
    test(`card "${card.title}" opens its servicio page`, async ({ page, homePage }) => {
      const servicio = servicioPages.find(s => s.path === card.path)!;
      await homePage.goto();

      await homePage.serviceCards.nth(index).click();

      // The local static server (serve) redirects *.html to its extensionless URL.
      await expect(page).toHaveURL(new RegExp(`${card.path.replace(/\.html$/, '')}(\\.html)?$`));
      await expect(page).toHaveTitle(servicio.title);
    });
  }
});

test.describe('Home process section', () => {
  test('shows the four steps in order', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.section('proceso').locator('.process__subtitle')).toContainText('acompañamiento estratégico');

    await expect(homePage.processSteps).toHaveCount(processSteps.length);
    for (const [index, title] of processSteps.entries()) {
      const step = homePage.processSteps.nth(index);
      await expect(step.locator('.process__label')).toHaveText(`PASO 0${index + 1}`);
      await expect(step.getByRole('heading')).toHaveText(title);
    }
  });
});

test.describe('Home reviews section', () => {
  test('shows three reviews with author, text and avatar', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.reviewCards).toHaveCount(reviewAuthors.length);
    for (const [index, author] of reviewAuthors.entries()) {
      const review = homePage.reviewCards.nth(index);
      await expect(review.locator('.review-card__name')).toHaveText(author);
      await expect(review.locator('.review-card__text')).not.toBeEmpty();
      await expect(review.locator('.review-card__stars')).toHaveCount(0);

      // Avatars are loading="lazy", so they only fetch once scrolled near the viewport.
      const avatar = review.locator('img.review-card__avatar');
      await avatar.scrollIntoViewIfNeeded();
      await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    }
  });
});
