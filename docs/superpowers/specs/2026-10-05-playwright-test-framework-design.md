# Playwright Test Framework — Design Spec

Date: 2026-10-05
Status: Approved for planning

## Context

The project is a static multi-page marketing site ("Growth Partner"): `index.html` at
the repo root plus five pages under `servicios/`. A `playwright-tests/` folder already
exists with a minimal, ad-hoc setup: a bare `playwright.config.ts` (single Chromium
project, no fixtures, no page objects) and two one-off specs (`home.spec.ts` checking
title/key sections, `font-check.spec.ts` checking that Work Sans loads correctly).

The goal is to replace this ad-hoc setup with a proper, reusable test framework built
from scratch, developed in verifiable phases.

## Goals

- Page Object Model + fixtures so tests don't duplicate selector logic across the 6 pages.
- Coverage for: page structure/content, responsive/mobile layout, and visual regression.
- Accessibility testing is explicitly out of scope for this iteration (can be added later).
- CI via GitHub Actions from the start.
- Migrate the two existing specs' logic into the new structure; the old ad-hoc files are
  replaced, not kept alongside.

## Non-goals

- No new test frameworks/libraries beyond `@playwright/test` (already installed).
- No cross-browser matrix (Firefox/WebKit) for this iteration — Chromium desktop + mobile
  emulation only.
- No accessibility (axe-core) testing yet.

## Architecture

```
playwright-tests/
├── playwright.config.ts
├── fixtures/
│   └── pages.fixture.ts       # extends base `test` injecting page objects
├── pages/
│   ├── BasePage.ts            # shared header/footer/nav locators & actions
│   ├── HomePage.ts
│   └── ServicioPage.ts        # single class, parametrized by route/expected title
├── data/
│   └── pages.data.ts          # the 5 servicios pages: { path, expectedTitle, ... }
├── tests/
│   ├── structure/             # title, key sections, header/footer nav, asset/font checks
│   ├── responsive/            # same assertions, validated against mobile layout/behavior
│   └── visual/                # toHaveScreenshot, full-page, per project
└── snapshots/                 # versioned baselines (committed to git)
```

### Page Objects & fixtures

- `BasePage`: holds locators/actions common to every page (header `#header`, footer, nav
  links). `HomePage` and `ServicioPage` extend/compose it.
- `ServicioPage` is a single parametrized class (not one class per service page) since all
  five servicios pages share the same layout — constructed with a `path` and used against
  `data/pages.data.ts` entries in data-driven tests.
- `fixtures/pages.fixture.ts` extends Playwright's `test` to inject `homePage` /
  `servicioPage` fixtures, so specs never instantiate page objects manually.

### Config: projects (browsers/viewports)

Two projects in `playwright.config.ts`:

- `desktop-chromium` — Desktop Chrome, ~1280×800 viewport.
- `mobile-chromium` — emulated via Playwright's `devices['Pixel 7']` (or current
  equivalent at implementation time).

`structure/`, `responsive/`, and `visual/` specs all run against both projects — the same
spec executes twice (once per viewport) with no duplicated code. `webServer` keeps using
`npx serve .. -l 4173` (serving the repo root so `/`, `/servicios/*.html` etc. resolve).

### Visual regression & cross-OS snapshots

`toHaveScreenshot()` includes the OS in the snapshot filename by default (e.g.
`home-chromium-win32.png` locally vs. `home-chromium-linux.png` in CI), so local and CI
baselines never collide — this is native Playwright behavior, not custom tooling.
Consequence: the first CI run will fail until Linux baselines exist. That's resolved by a
one-time manual `--update-snapshots` run in CI, with the resulting `-linux.png` baselines
committed alongside the local `-win32.png` ones.

### CI (GitHub Actions)

`.github/workflows/playwright.yml`: on push/PR to `master`, installs dependencies and
browsers (`npx playwright install --with-deps`), runs `npm test` inside `playwright-tests/`,
and uploads `playwright-report/` as a build artifact (so failures — including visual diffs
and traces — can be inspected from the GitHub Actions UI).

## Migration of existing specs

- `home.spec.ts` → logic moves into `tests/structure/home.spec.ts`, rewritten against
  `HomePage`.
- `font-check.spec.ts` → logic moves into `tests/structure/assets.spec.ts`, generalized via
  `data/pages.data.ts` so it runs across all six pages instead of two hardcoded paths.
- The old `playwright-tests/tests/*.spec.ts` files and the old flat config are deleted as
  part of Phase 1/2, not kept as a parallel ad-hoc suite.

## Phased rollout

Each phase is independently verifiable before moving to the next:

1. **Framework skeleton** — new `playwright.config.ts` with both projects, `BasePage`,
   fixtures, folder structure. No test specs yet; verify the webServer boots and an empty
   run is green.
2. **Structure tests** — home + the five servicios pages (data-driven via
   `pages.data.ts`), header/footer navigation checks, migrated asset/font check.
3. **Responsive tests** — same assertions proven to run against `mobile-chromium`, plus
   any mobile-specific behavior (e.g. hamburger menu) if present in the markup.
4. **Visual regression** — `tests/visual/` specs, local baseline generation for both
   projects.
5. **CI** — GitHub Actions workflow, one-time Linux baseline generation/commit.

## Testing strategy

- Structure/responsive tests are assertion-based (locators, text, computed styles,
  failed-request tracking) — no framework beyond `@playwright/test`.
- Visual tests are screenshot-based, scoped to full-page screenshots per project.
- No mocking/stubbing needed — this is a static site with no backend to fake.
