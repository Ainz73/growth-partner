import { test, expect } from '@playwright/test';

const pages = ['/index.html', '/servicios/publicidad.html'];

for (const path of pages) {
  test(`Work Sans is applied and loaded on ${path}`, async ({ page }) => {
    const failed: string[] = [];
    page.on('requestfailed', r => failed.push(r.url()));
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);

    // The face actually loaded, at the weights the design uses.
    for (const weight of ['400', '500', '700', '800']) {
      expect(await page.evaluate(w => document.fonts.check(`${w} 16px "Work Sans"`), weight),
        `weight ${weight}`).toBe(true);
    }

    // Nothing still points at the old Google families.
    const families = await page.evaluate(() =>
      [...document.querySelectorAll('body, h1, h2, h3, .eyebrow, .section-title, p, a, input')]
        .map(el => getComputedStyle(el).fontFamily)
        .filter((v, i, a) => a.indexOf(v) === i));
    for (const f of families) expect(f).toContain('Work Sans');

    expect(failed.filter(u => /\.(ttf|woff2?|css)$/.test(u))).toEqual([]);
  });
}
