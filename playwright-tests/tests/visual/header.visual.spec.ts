import { test, expect } from '../../fixtures/pages.fixture';
import { homePageData, nosotrosPageData, servicioPages } from '../../data/pages.data';
import { BasePage } from '../../pages/BasePage';

// Full-page baselines tolerate a 1% pixel difference, which hides changes as
// large as a whole header link. These element shots catch them.
for (const sitePage of [homePageData, nosotrosPageData, servicioPages[0]]) {
  test(`${sitePage.name} header matches visual baseline`, async ({ page }) => {
    const sitePageObject = new BasePage(page);
    await sitePageObject.goto(sitePage.path);

    await expect(sitePageObject.header).toHaveScreenshot(`header-${sitePage.name}.png`);
  });
}
