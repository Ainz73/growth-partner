import { test, expect } from '../../fixtures/pages.fixture';
import { allPages, siteOrigin } from '../../data/pages.data';

test.describe('Files for search engines', () => {
  test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toMatch(/^User-agent: \*$/m);
    expect(body).not.toMatch(/^Disallow: \/$/m);
    expect(body).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);
  });

  test('sitemap.xml lists every page, and only those', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    expect(locs.sort()).toEqual(allPages.map(sitePage => siteOrigin + sitePage.path).sort());
  });
});
