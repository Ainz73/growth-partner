import { test, expect } from '../../fixtures/pages.fixture';
import { nosotrosPageData } from '../../data/pages.data';

test.describe('Nosotros page', () => {
  test('loads with correct title and hero', async ({ page, nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(page).toHaveTitle(nosotrosPageData.title);
    await expect(nosotrosPage.heroTitle).toBeVisible();
    await expect(nosotrosPage.heroTitle).toContainText(nosotrosPageData.heroTextContains);
  });

  test('marks Nosotros as the active nav link', async ({ nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(nosotrosPage.navLink('Nosotros')).toHaveClass(/active/);
    await expect(nosotrosPage.navLink('Nosotros')).toHaveAttribute('aria-current', 'page');
    for (const name of ['Inicio', 'Servicios', 'Contáctanos']) {
      await expect(nosotrosPage.navLink(name)).not.toHaveClass(/active/);
    }
  });

  test('header and footer link back to home sections', async ({ nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(nosotrosPage.navLink('Inicio')).toHaveAttribute('href', 'index.html#inicio');
    await expect(nosotrosPage.navLink('Servicios')).toHaveAttribute('href', 'index.html#servicios');
    await expect(nosotrosPage.navLink('Contáctanos')).toHaveAttribute('href', 'index.html#contacto');
    await expect(nosotrosPage.footerLink('Nosotros')).toHaveAttribute('href', 'nosotros.html');
  });

  test('shows principles, team, reviews and closing CTA', async ({ nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(nosotrosPage.valueCards).toHaveCount(4);
    await expect(nosotrosPage.teamLead).toContainText('Claudia Ventura');
    await expect(nosotrosPage.teamMembers).toHaveCount(2);
    await expect(nosotrosPage.teamMembers.nth(0)).toContainText('Elizabeth Aguilar');
    await expect(nosotrosPage.teamMembers.nth(1)).toContainText('Cielo Vargas');
    await expect(nosotrosPage.reviewCards).toHaveCount(3);
    await expect(nosotrosPage.cta.getByRole('link', { name: 'Agenda tu diagnóstico' }))
      .toHaveAttribute('href', 'index.html#contacto');
  });

  test('has a single h1 and one h2 per section', async ({ page, nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main h2')).toHaveText([
      'Principios que guían cada decisión',
      'Un equipo pequeño, involucrado en tu negocio',
      'Lo que dicen nuestros clientes',
      'Queremos entender qué estás construyendo',
    ]);
  });

  test('team photos are labelled or hidden from assistive tech', async ({ nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(nosotrosPage.teamLead.getByRole('img', { name: 'Foto de Claudia Ventura' })).toBeAttached();
    for (const member of await nosotrosPage.teamMembers.all()) {
      await expect(member.locator('.team-member__photo')).toHaveAttribute('aria-hidden', 'true');
      await expect(member.getByRole('heading', { level: 3 })).not.toBeEmpty();
    }
  });

  test('review avatars load and are decorative', async ({ nosotrosPage }) => {
    await nosotrosPage.goto();

    for (const review of await nosotrosPage.reviewCards.all()) {
      // Avatars are loading="lazy", so they only fetch once scrolled near the viewport.
      const avatar = review.locator('img.review-card__avatar');
      await expect(avatar).toHaveAttribute('alt', '');
      await avatar.scrollIntoViewIfNeeded();
      await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    }
  });

  test('leaves out the "Nuestra historia" section', async ({ page, nosotrosPage }) => {
    await nosotrosPage.goto();

    await expect(page.getByText(/nuestra historia/i)).toHaveCount(0);
  });
});
