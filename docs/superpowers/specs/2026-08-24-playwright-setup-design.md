# Playwright test setup — design

## Purpose

Introduce automated browser testing for the Growth Partner static site. This is the initial setup: get Playwright wired up with a minimal smoke test, establishing the pattern for future tests.

## Context

The site is a static HTML/CSS/JS project (no build step, no existing Node/npm project) with `index.html` at the repo root and additional pages under `servicios/`. There is currently no automated testing.

## Approach

- **Location:** New `playwright-tests/` directory at the repo root, with its own `package.json`. Keeps Node tooling (and `node_modules/`) isolated from the static site's source, while staying simple (no monorepo tooling needed).
- **Serving the site:** Playwright's `webServer` config option runs `npx serve ..` (serving the repo root from one level up) on `http://localhost:4173` automatically before tests start, and reuses an already-running server in dev. No manual server management needed.
- **Browser scope:** Chromium only for now. Firefox/WebKit can be added later by extending the `projects` array in the config — no structural change needed.
- **First test:** A smoke test for the home page (`tests/home.spec.ts`) verifying:
  - The page loads successfully.
  - `<title>` equals "Growth Partner | Marketing Digital".
  - The header (`#header`) is visible.
  - The hero section (`#inicio`) and its heading (`h1.hero__title`) are visible.

## Structure

```
playwright-tests/
  package.json
  playwright.config.ts
  tests/
    home.spec.ts
  .gitignore          # node_modules/, test-results/, playwright-report/
```

## Testing

Running `npx playwright test` inside `playwright-tests/` starts the static server, runs the smoke test against Chromium, and reports pass/fail. This is itself the verification step for this setup — a green run confirms the pipeline works end to end.

## Out of scope (future work)

- Testing the `servicios/*.html` pages.
- Cross-browser runs (Firefox/WebKit).
- CI integration.
- Visual regression / accessibility testing.
