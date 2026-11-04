import { test, expect } from '../../fixtures/pages.fixture';
import { allPages, siteOrigin } from '../../data/pages.data';

const ogImagePath = '/assets/img/og-image.jpg';

test.describe('Search and share presence', () => {
  test('every page has its own description', () => {
    const descriptions = allPages.map(sitePage => sitePage.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    // Google cuts snippets at roughly 155-160 characters.
    for (const description of descriptions) expect(description.length).toBeLessThanOrEqual(160);
  });

  for (const sitePage of allPages) {
    test(`${sitePage.name}: has a meta description`, async ({ page }) => {
      await page.goto(sitePage.path);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', sitePage.description);
    });

    test(`${sitePage.name}: has share-preview tags`, async ({ page }) => {
      await page.goto(sitePage.path);
      const meta = (selector: string) => page.locator(`meta[${selector}]`);

      await expect(meta('property="og:type"')).toHaveAttribute('content', 'website');
      await expect(meta('property="og:site_name"')).toHaveAttribute('content', 'Growth Partner');
      await expect(meta('property="og:title"')).toHaveAttribute('content', sitePage.title);
      await expect(meta('property="og:description"')).toHaveAttribute('content', sitePage.description);
      // WhatsApp and Facebook only accept an absolute image URL.
      await expect(meta('property="og:image"')).toHaveAttribute('content', siteOrigin + ogImagePath);
      await expect(meta('property="og:image:width"')).toHaveAttribute('content', '1200');
      await expect(meta('property="og:image:height"')).toHaveAttribute('content', '630');
      await expect(meta('name="twitter:card"')).toHaveAttribute('content', 'summary_large_image');
    });

    test(`${sitePage.name}: favicons resolve`, async ({ page, request }) => {
      await page.goto(sitePage.path);

      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]')].map(link => link.href));
      expect(hrefs.length).toBeGreaterThanOrEqual(2);

      for (const href of hrefs) {
        const response = await request.get(href);
        expect(response.status(), href).toBe(200);
        expect(response.headers()['content-type'], href).toMatch(/^image\//);
      }
    });
  }

  test('share image is a 1200x630 JPEG small enough for WhatsApp', async ({ page, request }) => {
    const response = await request.get(ogImagePath);
    expect(response.status()).toBe(200);
    // WhatsApp drops previews whose image is much larger than ~300 KB.
    expect((await response.body()).length).toBeLessThan(300 * 1024);

    await page.goto(ogImagePath);
    const size = await page.evaluate(() => {
      const img = document.querySelector('img')!;
      return { width: img.naturalWidth, height: img.naturalHeight };
    });
    expect(size).toEqual({ width: 1200, height: 630 });
  });
});
