# Playwright Test Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `playwright-tests/` from scratch into a reusable Page-Object-based framework covering structure/content, responsive/mobile, and visual-regression testing for the Growth Partner static site, with CI wired up on GitHub Actions.

**Architecture:** A `BasePage` holds locators/behavior shared by every page (header, nav, burger, footer); `HomePage` and `ServicioPage` extend it. A `pages.fixture.ts` extends Playwright's `test` to inject these as fixtures. A single `data/pages.data.ts` module describes the 6 real pages (home + 5 servicios) once, and every data-driven spec loops over it. Two Playwright projects (`desktop-chromium`, `mobile-chromium`) run every spec in `tests/` twice — once per viewport — with no per-spec duplication.

**Tech Stack:** `@playwright/test` (already installed), TypeScript, GitHub Actions. No new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-10-05-playwright-test-framework-design.md`

## Global Constraints

- All tests hit `http://localhost:4173`, served by the existing `webServer` command (`npx serve .. -l 4173`, serving the repo root from inside `playwright-tests/`).
- Every spec under `tests/` runs against both `desktop-chromium` (Desktop Chrome) and `mobile-chromium` (`devices['Pixel 7']`) — this is automatic from `playwright.config.ts`'s `projects` array; specs never select a project themselves. The one exception is the burger-menu test, which uses the built-in `isMobile` fixture to skip itself on the desktop project.
- No new npm dependencies beyond the already-installed `@playwright/test` and `serve`. No accessibility (axe-core) testing in this plan.
- Visual snapshots are committed to git. Playwright's default per-OS filename suffixing (`-win32.png` locally, `-linux.png` in CI) means local and CI baselines coexist without any custom `snapshotPathTemplate` — this plan relies on that default behavior rather than forcing a non-standard snapshot directory.
- The old ad-hoc `playwright-tests/tests/home.spec.ts` and `font-check.spec.ts` are deleted, not kept alongside the new suite (per the approved spec).

---

### Task 1: Framework skeleton — config, BasePage, HomePage, home structure test

**Files:**
- Delete: `playwright-tests/tests/home.spec.ts`
- Delete: `playwright-tests/tests/font-check.spec.ts`
- Modify: `playwright-tests/playwright.config.ts`
- Create: `playwright-tests/pages/BasePage.ts`
- Create: `playwright-tests/pages/HomePage.ts`
- Create: `playwright-tests/fixtures/pages.fixture.ts`
- Create: `playwright-tests/data/pages.data.ts`
- Test: `playwright-tests/tests/structure/home.spec.ts`

**Interfaces:**
- Produces: `BasePage` with `page: Page`, `header/nav/burger/footer: Locator` fields, `goto(path: string)`, `navLink(name: string): Locator`, `footerLink(name: string): Locator`.
- Produces: `HomePage extends BasePage` with `heroTitle: Locator` and `goto()` (no args, defaults to `/`).
- Produces: `pages.fixture.ts` exporting a `test`/`expect` pair where `test` is extended with a `homePage: HomePage` fixture.
- Produces: `data/pages.data.ts` exporting `interface SitePage { name: string; path: string; title: string; heroTextContains: string }` and `homePageData: SitePage`.
- Consumes: nothing (first task).

- [ ] **Step 1: Delete the old ad-hoc specs and rewrite the config**

Delete `playwright-tests/tests/home.spec.ts` and `playwright-tests/tests/font-check.spec.ts`.

Replace `playwright-tests/playwright.config.ts` with:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx serve .. -l 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
```

- [ ] **Step 2: Write the failing test**

Create `playwright-tests/tests/structure/home.spec.ts`:

```ts
import { test, expect } from '../../fixtures/pages.fixture';
import { homePageData } from '../../data/pages.data';

test.describe('Home page', () => {
  test('loads with correct title and key sections visible', async ({ page, homePage }) => {
    await homePage.goto();

    await expect(page).toHaveTitle(homePageData.title);
    await expect(homePage.header).toBeVisible();
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroTitle).toContainText(homePageData.heroTextContains);
    await expect(homePage.footer).toBeVisible();
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run (from `playwright-tests/`): `npx playwright test tests/structure/home.spec.ts`
Expected: FAIL — `../../fixtures/pages.fixture` and `../../data/pages.data` don't exist yet.

- [ ] **Step 4: Implement BasePage, HomePage, fixtures, and pages.data**

Create `playwright-tests/pages/BasePage.ts`:

```ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly nav: Locator;
  readonly burger: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('#header');
    this.nav = page.locator('#nav');
    this.burger = page.locator('#burger');
    this.footer = page.locator('footer.footer');
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  navLink(name: string): Locator {
    return this.nav.getByRole('link', { name, exact: true });
  }

  footerLink(name: string): Locator {
    return this.footer.getByRole('link', { name, exact: true });
  }
}
```

Create `playwright-tests/pages/HomePage.ts`:

```ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroTitle = this.page.locator('h1.hero__title');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/');
  }
}
```

Create `playwright-tests/fixtures/pages.fixture.ts`:

```ts
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

type Fixtures = {
  homePage: HomePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect };
```

Create `playwright-tests/data/pages.data.ts`:

```ts
export interface SitePage {
  name: string;
  path: string;
  title: string;
  heroTextContains: string;
}

export const homePageData: SitePage = {
  name: 'home',
  path: '/',
  title: 'Growth Partner | Marketing Digital',
  heroTextContains: 'crecimiento',
};
```

- [ ] **Step 5: Run it to confirm it passes**

Run: `npx playwright test tests/structure/home.spec.ts`
Expected: PASS on both `desktop-chromium` and `mobile-chromium` (2 passed).

- [ ] **Step 6: Commit**

```bash
git add playwright-tests/playwright.config.ts playwright-tests/pages/BasePage.ts playwright-tests/pages/HomePage.ts playwright-tests/fixtures/pages.fixture.ts playwright-tests/data/pages.data.ts playwright-tests/tests/structure/home.spec.ts
git rm playwright-tests/tests/home.spec.ts playwright-tests/tests/font-check.spec.ts
git commit -m "Rebuild Playwright framework skeleton with BasePage, HomePage, and fixtures"
```

---

### Task 2: Servicio pages structure test

**Files:**
- Create: `playwright-tests/pages/ServicioPage.ts`
- Modify: `playwright-tests/fixtures/pages.fixture.ts`
- Modify: `playwright-tests/data/pages.data.ts`
- Test: `playwright-tests/tests/structure/servicios.spec.ts`

**Interfaces:**
- Consumes: `BasePage` (Task 1), `SitePage` interface and `homePageData` (Task 1).
- Produces: `ServicioPage extends BasePage` with `heroTitle: Locator` (inherits `goto(path: string)` from `BasePage` unchanged).
- Produces: `pages.fixture.ts` now also exports a `servicioPage: ServicioPage` fixture.
- Produces: `data/pages.data.ts` now also exports `servicioPages: SitePage[]` (the 5 servicio pages).

- [ ] **Step 1: Write the failing test**

Create `playwright-tests/tests/structure/servicios.spec.ts`:

```ts
import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

test.describe('Servicio pages', () => {
  for (const servicio of servicioPages) {
    test(`${servicio.name}: loads with correct title and hero`, async ({ page, servicioPage }) => {
      await servicioPage.goto(servicio.path);

      await expect(page).toHaveTitle(servicio.title);
      await expect(servicioPage.header).toBeVisible();
      await expect(servicioPage.heroTitle).toBeVisible();
      await expect(servicioPage.heroTitle).toContainText(servicio.heroTextContains);
      await expect(servicioPage.footer).toBeVisible();
    });
  }
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx playwright test tests/structure/servicios.spec.ts`
Expected: FAIL — `servicioPages` is not exported from `data/pages.data.ts`, and `servicioPage` fixture doesn't exist.

- [ ] **Step 3: Implement ServicioPage, extend the fixture, extend the data file**

Create `playwright-tests/pages/ServicioPage.ts`:

```ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ServicioPage extends BasePage {
  readonly heroTitle = this.page.locator('h1.service-hero__title');

  constructor(page: Page) {
    super(page);
  }
}
```

Modify `playwright-tests/fixtures/pages.fixture.ts` to:

```ts
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ServicioPage } from '../pages/ServicioPage';

type Fixtures = {
  homePage: HomePage;
  servicioPage: ServicioPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  servicioPage: async ({ page }, use) => {
    await use(new ServicioPage(page));
  },
});

export { expect };
```

Append to `playwright-tests/data/pages.data.ts`:

```ts
export const servicioPages: SitePage[] = [
  { name: 'estrategia-digital', path: '/servicios/estrategia-digital.html', title: 'Estrategia Digital | Growth Partner', heroTextContains: 'Estrategia Digital' },
  { name: 'estrategia-marca', path: '/servicios/estrategia-marca.html', title: 'Estrategia de Marca | Growth Partner', heroTextContains: 'Estrategia de Marca' },
  { name: 'produccion-contenido', path: '/servicios/produccion-contenido.html', title: 'Producción de Contenido | Growth Partner', heroTextContains: 'Producción de Contenido' },
  { name: 'publicidad', path: '/servicios/publicidad.html', title: 'Publicidad | Growth Partner', heroTextContains: 'Publicidad' },
  { name: 'redes-sociales', path: '/servicios/redes-sociales.html', title: 'Gestión de Redes Sociales | Growth Partner', heroTextContains: 'Gestión de Redes Sociales' },
];

export const allPages: SitePage[] = [homePageData, ...servicioPages];
```

- [ ] **Step 4: Run it to confirm it passes**

Run: `npx playwright test tests/structure/servicios.spec.ts`
Expected: PASS — 5 servicio pages × 2 projects = 10 passed.

- [ ] **Step 5: Commit**

```bash
git add playwright-tests/pages/ServicioPage.ts playwright-tests/fixtures/pages.fixture.ts playwright-tests/data/pages.data.ts playwright-tests/tests/structure/servicios.spec.ts
git commit -m "Add ServicioPage object and data-driven structure tests for servicio pages"
```

---

### Task 3: Header/footer navigation tests

**Files:**
- Test: `playwright-tests/tests/structure/navigation.spec.ts`

**Interfaces:**
- Consumes: `homePage`/`servicioPage` fixtures (Tasks 1-2), `BasePage.navLink`/`footerLink` (Task 1), `servicioPages` (Task 2).
- Produces: nothing new — this task only adds a spec.

- [ ] **Step 1: Write the failing test**

Create `playwright-tests/tests/structure/navigation.spec.ts`:

```ts
import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

test.describe('Home navigation', () => {
  test('header links point to the right sections', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.navLink('Inicio')).toHaveAttribute('href', '#inicio');
    await expect(homePage.navLink('Servicios')).toHaveAttribute('href', '#servicios');
    await expect(homePage.navLink('Nosotros')).toHaveAttribute('href', '#nosotros');
    await expect(homePage.navLink('Contáctanos')).toHaveAttribute('href', '#contacto');
  });

  test('footer links point to the right sections', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.footerLink('Inicio')).toHaveAttribute('href', '#inicio');
    await expect(homePage.footerLink('Servicios')).toHaveAttribute('href', '#servicios');
    await expect(homePage.footerLink('Nosotros')).toHaveAttribute('href', '#nosotros');
    await expect(homePage.footerLink('Contáctanos')).toHaveAttribute('href', '#contacto');
  });
});

test.describe('Servicio pages navigation', () => {
  for (const servicio of servicioPages) {
    test(`${servicio.name}: header and footer link back to home sections`, async ({ servicioPage }) => {
      await servicioPage.goto(servicio.path);

      await expect(servicioPage.navLink('Inicio')).toHaveAttribute('href', '../index.html#inicio');
      await expect(servicioPage.navLink('Servicios')).toHaveAttribute('href', '../index.html#servicios');
      await expect(servicioPage.navLink('Reseñas')).toHaveAttribute('href', '../index.html#resenias');
      await expect(servicioPage.navLink('Contáctanos')).toHaveAttribute('href', '../index.html#contacto');

      await expect(servicioPage.footerLink('Inicio')).toHaveAttribute('href', '../index.html#inicio');
      await expect(servicioPage.footerLink('Servicios')).toHaveAttribute('href', '../index.html#servicios');
      await expect(servicioPage.footerLink('Nosotros')).toHaveAttribute('href', '../index.html#nosotros');
      await expect(servicioPage.footerLink('Contáctanos')).toHaveAttribute('href', '../index.html#contacto');
    });
  }
});
```

- [ ] **Step 2: Run it to confirm it fails or passes**

Run: `npx playwright test tests/structure/navigation.spec.ts`
Expected: PASS immediately — all the page objects and data this spec needs already exist from Tasks 1-2. (If anything fails, it means a real `href` mismatch against the live markup — fix the assertion to match the actual site, don't change the site.)

- [ ] **Step 3: Commit**

```bash
git add playwright-tests/tests/structure/navigation.spec.ts
git commit -m "Add header and footer navigation link tests"
```

---

### Task 4: Migrated font/asset test, generalized across all 6 pages

**Files:**
- Test: `playwright-tests/tests/structure/assets.spec.ts`

**Interfaces:**
- Consumes: `allPages` (Task 2).
- Produces: nothing new — this task only adds a spec.

- [ ] **Step 1: Write the failing test**

Create `playwright-tests/tests/structure/assets.spec.ts` (migrated and generalized from the old `font-check.spec.ts`, which only covered 2 hardcoded paths):

```ts
import { test, expect } from '../../fixtures/pages.fixture';
import { allPages } from '../../data/pages.data';

test.describe('Fonts and static assets', () => {
  for (const sitePage of allPages) {
    test(`${sitePage.name}: Work Sans loads at every weight used`, async ({ page }) => {
      const failedRequests: string[] = [];
      page.on('requestfailed', request => failedRequests.push(request.url()));

      await page.goto(sitePage.path);
      await page.evaluate(() => document.fonts.ready);

      for (const weight of ['400', '500', '700', '800']) {
        const loaded = await page.evaluate(
          w => document.fonts.check(`${w} 16px "Work Sans"`),
          weight,
        );
        expect(loaded, `weight ${weight}`).toBe(true);
      }

      const families = await page.evaluate(() =>
        [...document.querySelectorAll('body, h1, h2, h3, .eyebrow, .section-title, p, a, input')]
          .map(el => getComputedStyle(el).fontFamily)
          .filter((value, index, all) => all.indexOf(value) === index));
      for (const family of families) expect(family).toContain('Work Sans');

      const failedAssets = failedRequests.filter(url => /\.(ttf|woff2?|css)$/.test(url));
      expect(failedAssets).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Run it to confirm it passes**

Run: `npx playwright test tests/structure/assets.spec.ts`
Expected: PASS — 6 pages × 2 projects = 12 passed.

- [ ] **Step 3: Commit**

```bash
git add playwright-tests/tests/structure/assets.spec.ts
git commit -m "Migrate and generalize the Work Sans font check across all pages"
```

---

### Task 5: Responsive — burger menu test

**Files:**
- Test: `playwright-tests/tests/responsive/mobile-nav.spec.ts`

**Interfaces:**
- Consumes: `homePage` fixture, `BasePage.nav`/`burger`/`navLink` (Task 1), built-in `isMobile` fixture from `@playwright/test`.
- Produces: nothing new — this task only adds a spec.

- [ ] **Step 1: Write the failing test**

Create `playwright-tests/tests/responsive/mobile-nav.spec.ts`:

```ts
import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Mobile navigation', () => {
  test('burger toggles the nav menu open and closed', async ({ homePage, isMobile }) => {
    test.skip(!isMobile, 'Burger menu only renders on mobile viewports');

    await homePage.goto();

    await expect(homePage.burger).toBeVisible();
    await expect(homePage.nav).not.toHaveClass(/open/);

    await homePage.burger.click();
    await expect(homePage.nav).toHaveClass(/open/);
    await expect(homePage.burger).toHaveClass(/open/);

    await homePage.navLink('Inicio').click();
    await expect(homePage.nav).not.toHaveClass(/open/);
  });
});
```

- [ ] **Step 2: Run it to confirm it passes**

Run: `npx playwright test tests/responsive/mobile-nav.spec.ts`
Expected: 1 passed (`mobile-chromium`), 1 skipped (`desktop-chromium`).

- [ ] **Step 3: Commit**

```bash
git add playwright-tests/tests/responsive/mobile-nav.spec.ts
git commit -m "Add mobile burger-menu toggle test"
```

---

### Task 6: Visual regression

Full-page screenshots will include sections that haven't scrolled into view yet, which the site's `IntersectionObserver`-driven `.reveal` class leaves at `opacity: 0` (`assets/css/style.css:79-87`) since a full-page CDP screenshot doesn't actually scroll the real viewport. `BasePage.prepareForVisualSnapshot()` forces every `.reveal` element to its final visible state immediately before the screenshot, so captures are deterministic and complete regardless of scroll position.

**Files:**
- Modify: `playwright-tests/pages/BasePage.ts`
- Modify: `playwright-tests/playwright.config.ts`
- Test: `playwright-tests/tests/visual/home.visual.spec.ts`
- Test: `playwright-tests/tests/visual/servicios.visual.spec.ts`

**Interfaces:**
- Consumes: `homePage`/`servicioPage` fixtures, `servicioPages` data (Tasks 1-2).
- Produces: `BasePage.prepareForVisualSnapshot(): Promise<void>`.

- [ ] **Step 1: Add the reduced-motion setting**

Modify `playwright-tests/playwright.config.ts`'s top-level `use` block to:

```ts
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    reducedMotion: 'reduce',
  },
```

(The site already respects `prefers-reduced-motion: reduce` for its hero typewriter — `assets/js/script.js:113-117` — showing the first word statically with no blinking cursor. This setting makes that deterministic for screenshots.)

- [ ] **Step 2: Add the reveal-stabilizing helper**

Modify `playwright-tests/pages/BasePage.ts`, adding this method to the `BasePage` class:

```ts
  async prepareForVisualSnapshot() {
    await this.page.addStyleTag({
      content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }',
    });
  }
```

- [ ] **Step 3: Write the visual specs**

Create `playwright-tests/tests/visual/home.visual.spec.ts`:

```ts
import { test, expect } from '../../fixtures/pages.fixture';

test('home page matches visual baseline', async ({ page, homePage }) => {
  await homePage.goto();
  await homePage.prepareForVisualSnapshot();

  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
});
```

Create `playwright-tests/tests/visual/servicios.visual.spec.ts`:

```ts
import { test, expect } from '../../fixtures/pages.fixture';
import { servicioPages } from '../../data/pages.data';

for (const servicio of servicioPages) {
  test(`${servicio.name} page matches visual baseline`, async ({ page, servicioPage }) => {
    await servicioPage.goto(servicio.path);
    await servicioPage.prepareForVisualSnapshot();

    await expect(page).toHaveScreenshot(`${servicio.name}.png`, { fullPage: true });
  });
}
```

- [ ] **Step 4: Run to confirm it fails**

Run: `npx playwright test tests/visual`
Expected: FAIL — no baseline snapshots exist yet (Playwright reports "A snapshot doesn't exist" and writes the actual images it captured).

- [ ] **Step 5: Generate the local baselines**

Run: `npx playwright test tests/visual --update-snapshots`
Expected: PASS — this writes `*-win32.png` baseline files next to each spec (e.g. `tests/visual/home.visual.spec.ts-snapshots/home-desktop-chromium-win32.png`).

- [ ] **Step 6: Run again to confirm it passes against the committed baseline**

Run: `npx playwright test tests/visual`
Expected: PASS — 6 pages × 2 projects = 12 passed, comparing against the baselines just generated.

- [ ] **Step 7: Commit**

```bash
git add playwright-tests/playwright.config.ts playwright-tests/pages/BasePage.ts playwright-tests/tests/visual
git commit -m "Add visual regression tests with reveal-animation stabilization"
```

---

### Task 7: CI — GitHub Actions workflow

**Files:**
- Create: `.github/workflows/playwright.yml`
- Modify: `playwright-tests/playwright.config.ts`

**Interfaces:**
- Consumes: `npm test` script (`playwright-tests/package.json`, already `"test": "playwright test"`).
- Produces: nothing consumed by later tasks — this is the last task.

- [ ] **Step 1: Switch the reporter to one that produces an uploadable report**

Modify `playwright-tests/playwright.config.ts`'s `reporter` line to:

```ts
  reporter: [['list'], ['html', { open: 'never' }]],
```

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: playwright-tests
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-tests/playwright-report/
          retention-days: 14
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/playwright.yml playwright-tests/playwright.config.ts
git commit -m "Add GitHub Actions workflow to run Playwright tests on push/PR"
git push
```

- [ ] **Step 4: Generate the Linux visual baselines from CI (manual, one-time)**

The workflow above will fail the first time it reaches `tests/visual/*` because no `-linux.png` baselines exist yet (only the local `-win32.png` ones committed in Task 6). Resolve this once:

1. Push a commit that temporarily changes the `Run Playwright tests` step to `run: npx playwright test --update-snapshots`.
2. Let the workflow run, then download the `playwright-report` artifact (or re-run via `act`/SSH if preferred) — in practice, the simplest path is running the suite once against a Linux container locally: `docker run --rm -v "$PWD/playwright-tests:/work" -w /work mcr.microsoft.com/playwright:v1.62.1-noble npx playwright test tests/visual --update-snapshots`.
3. Commit the resulting `*-linux.png` files alongside the existing `*-win32.png` ones.
4. Revert the workflow step back to plain `npx playwright test` and push.

This is a one-time bootstrap; after this, both OS baselines exist in git and CI runs green like any other test suite.

---

## Verification

After Task 7, the full suite should pass locally and in CI:

```bash
cd playwright-tests
npx playwright test
```

Expected: all specs under `tests/structure`, `tests/responsive`, and `tests/visual` pass on both `desktop-chromium` and `mobile-chromium` (except the intentionally-skipped desktop run of the burger-menu test).
