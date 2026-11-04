import { test, expect } from '../../fixtures/pages.fixture';

// A top-level and a nested missing URL: the nested one catches relative asset
// paths, which would break because the host serves 404.html at any depth.
const missingUrls = ['/pagina-que-no-existe', '/servicios/antiguo/servicio-borrado'];

test.describe('404 page', () => {
  for (const url of missingUrls) {
    test(`${url}: answers 404 with the branded page`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        // The 404 status itself is logged as a console error; ignore only that one.
        if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text());
      });

      const response = await page.goto(url);
      expect(response?.status()).toBe(404);

      await expect(page).toHaveTitle('Página no encontrada | Growth Partner');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('no existe');
      await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');

      // Brand styling applied: the stylesheet and Work Sans loaded from root paths.
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.fonts.check('700 16px "Work Sans"'))).toBe(true);
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 239, 234)');

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      expect(errors).toEqual([]);
    });
  }

  test('every link on the 404 page resolves', async ({ page, request }) => {
    await page.goto(missingUrls[1]);

    const urls = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
        .filter(a => a.origin === location.origin)
        .map(a => a.origin + a.pathname));
    expect(urls.length).toBeGreaterThan(5);

    for (const url of new Set(urls)) {
      expect((await request.get(url)).status(), url).toBe(200);
    }
  });
});
