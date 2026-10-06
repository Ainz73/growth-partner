# Playwright Tests

Playwright test suite for the Growth Partner static site, covering page
structure/content, responsive/mobile behavior, and visual regression.

## Running

```bash
npm install          # first time only
npx playwright test  # run the full suite
npx playwright show-report  # view the last HTML report
```

Run these from inside `playwright-tests/`. The suite spins up the static
site itself (`npx serve ..`) via `webServer` in `playwright.config.ts`, so
no separate server needs to be running first.

## Projects

Every spec runs automatically on both projects:

- `desktop-chromium` — Desktop Chrome viewport
- `mobile-chromium` — Pixel 7 emulation

## Visual regression

Baselines live under `tests/visual/**/*-snapshots/` and are committed to
the repo. Playwright appends the OS name to each snapshot filename
automatically, so local baselines (`*-win32.png`) and CI baselines
(`*-linux.png`) coexist in the same folder without conflicting.

To update a baseline after an intentional visual change:

```bash
npx playwright test tests/visual --update-snapshots
```

## CI: one-time Linux baseline bootstrap

The GitHub Actions workflow (`.github/workflows/playwright.yml`) will
**fail on `tests/visual/*` the first time it runs**, because only the
local Windows baselines (`*-win32.png`) have been committed so far — no
`*-linux.png` baselines exist yet. This needs to be fixed once:

- **Option A:** Temporarily change the workflow's test step to
  `npx playwright test --update-snapshots`, let the job run, download the
  new screenshots from the job artifacts (or regenerate them locally
  against a matching image — see Option B), commit the resulting
  `*-linux.png` files, then revert the workflow step back to plain
  `npx playwright test`.
- **Option B:** Run the same environment locally once, using the Docker
  image that matches the pinned Playwright version:

  ```bash
  docker run --rm -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.62.1-noble \
    npx playwright test tests/visual --update-snapshots
  ```

  then commit the generated `*-linux.png` files.

Either way, this only needs to happen once.
