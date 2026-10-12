# Playwright Tests

Playwright test suite for the Growth Partner static site, covering page
structure/content, interactive behavior, responsive/mobile behavior, and
visual regression. For a step-by-step guide in Spanish, see `GUIA.md`.

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

That command only regenerates the baselines for the OS it runs on, so a
local run on Windows updates `*-win32.png` but leaves the `*-linux.png`
files used by CI untouched. Regenerate those too (see below), or the
workflow will fail on `tests/visual`.

## CI

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs the
full suite on every push and pull request to `master`, compares against
the committed `*-linux.png` baselines, and uploads the HTML report as an
artifact.

### Updating the Linux baselines

After an intentional visual change, regenerate the Linux baselines in one
of two ways:

- **Option A (CI):** On your branch, temporarily change the workflow's
  test step to `npx playwright test --update-snapshots` and add a step
  that uploads `playwright-tests/tests/visual/**/*-linux.png` as an
  artifact. Open a pull request so the workflow runs, download the
  artifact (`gh run download <run-id> -n <artifact-name>`), copy the files
  into `tests/visual/`, commit them, and revert the workflow change.
- **Option B (Docker):** Run the same environment locally, using the
  Docker image that matches the pinned Playwright version. The `webServer`
  serves the repo root (`npx serve ..`), so mount the repo root (one level
  up from this file), not just `playwright-tests/`, and point `-w` at the
  `playwright-tests` subdirectory inside the container:

  ```bash
  cd ..  # repo root
  docker run --rm -v "$PWD:/work" -w /work/playwright-tests mcr.microsoft.com/playwright:v1.62.1-noble \
    npx playwright test tests/visual --update-snapshots
  ```

  then commit the generated `*-linux.png` files.
