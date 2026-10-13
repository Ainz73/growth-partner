# Growth Partner

[![Playwright Tests](https://github.com/Ainz73/growth-partner/actions/workflows/playwright.yml/badge.svg)](https://github.com/Ainz73/growth-partner/actions/workflows/playwright.yml)

Website for **Growth Partner**, a digital marketing agency (home page plus five service pages), built with plain HTML, CSS and JavaScript. The project is in pre-launch.

Alongside the site, the repo contains a **Playwright + TypeScript test framework**, built from scratch, that guards every page on every change.

## Test framework at a glance

| | |
|---|---|
| **Tests** | 148 automated tests (74 per project) across 11 spec files |
| **Projects** | `desktop-chromium` (Desktop Chrome) and `mobile-chromium` (Pixel 7 emulation) |
| **Coverage** | Page structure and content, navigation, CTAs and scrollspy, contact form validation, mobile menu, page health, visual regression |
| **CI** | GitHub Actions on every push and pull request to `master`, full run in ~1.5 min, HTML report uploaded as an artifact |

## Architecture

```
playwright-tests/
├── playwright.config.ts   # webServer, projects, reporter, screenshot tolerance
├── data/                  # test data: pages, titles, hero text, CTAs
├── pages/                 # Page Objects: BasePage, HomePage, ServicioPage
├── fixtures/              # custom fixtures that inject the Page Objects
└── tests/
    ├── structure/         # titles, sections, links, fonts, page health
    ├── behavior/          # CTAs, nav, scrollspy, contact form
    ├── responsive/        # mobile burger menu
    └── visual/            # screenshot comparison against baselines
```

Data flows **data → Page Objects → fixtures → specs**. Specs never use raw CSS selectors; they ask the Page Object.

## Design decisions

- **Page Object Model + custom fixtures.** Locators and actions live in `pages/`; fixtures inject them so each spec stays short and readable.
- **Data-driven tests.** Page-level checks (health, assets, navigation, visual) are generated from `data/`, so adding a page to the site means adding one entry, not new specs.
- **Two viewports, one suite.** Every spec runs on desktop and mobile projects; mobile-only behavior is gated with `isMobile`.
- **Deterministic visual regression.** `toHaveScreenshot()` with a 1% diff tolerance. Before each capture, `BasePage.prepareForVisualSnapshot()` disables scroll-reveal animations and freezes the hero typewriter, which removes the main source of flaky screenshots.
- **Cross-OS baselines.** Linux baselines (used by CI) and Windows baselines (used locally) live side by side, so local runs never break CI.
- **Page health checks.** Every page is checked for JavaScript errors, horizontal overflow, broken internal links, images and fonts that fail to load.

## Running the tests

```bash
cd playwright-tests
npm install                  # first time only
npx playwright test          # full suite (starts the static site automatically)
npx playwright show-report   # open the last HTML report
```

More detail, including how to update visual baselines, is in [`playwright-tests/README.md`](playwright-tests/README.md) and the Spanish guide [`playwright-tests/GUIA.md`](playwright-tests/GUIA.md).

## Tech stack

**Site:** HTML, CSS, JavaScript, Work Sans (self-hosted), GitHub Pages
**Testing:** Playwright 1.62, TypeScript, Page Object Model, GitHub Actions

---

Built and maintained by [Fabio Gil](https://github.com/Ainz73) · QA Automation Engineer
