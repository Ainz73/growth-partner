import { test, expect } from '../../fixtures/pages.fixture';

type TeamLayout = 'side-by-side' | 'members-in-row' | 'members-stacked';

// Breakpoints in style.css: one column at <=960px, members back in a column at <=560px.
const widths: { width: number; layout: TeamLayout }[] = [
  { width: 320, layout: 'members-stacked' },
  { width: 412, layout: 'members-stacked' },
  { width: 768, layout: 'members-in-row' },
  { width: 1024, layout: 'side-by-side' },
  { width: 1280, layout: 'side-by-side' },
];

test.describe('Nosotros layout', () => {
  for (const { width, layout } of widths) {
    test(`has no horizontal overflow and the team is ${layout} at ${width}px`, async ({ page, nosotrosPage }) => {
      await page.setViewportSize({ width, height: 900 });
      await nosotrosPage.goto();
      // The reveal offsets (translateX on the team cards) would skew the measured boxes.
      await page.addStyleTag({ content: '.reveal { transform: none !important; transition: none !important; }' });

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

      const lead = (await nosotrosPage.teamLead.boundingBox())!;
      const first = (await nosotrosPage.teamMembers.nth(0).boundingBox())!;
      const second = (await nosotrosPage.teamMembers.nth(1).boundingBox())!;

      if (layout === 'side-by-side') {
        expect(first.x).toBeGreaterThanOrEqual(lead.x + lead.width);
        expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
      } else {
        expect(first.y).toBeGreaterThanOrEqual(lead.y + lead.height);
        if (layout === 'members-in-row') {
          expect(second.y).toBeCloseTo(first.y, 0);
          expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
        } else {
          expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
        }
      }
    });
  }
});
