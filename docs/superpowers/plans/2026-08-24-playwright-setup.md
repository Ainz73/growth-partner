# Playwright Test Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Playwright test project for the Growth Partner static site, with one passing smoke test for the home page.

**Architecture:** A self-contained Node project at `playwright-tests/` (own `package.json`, isolated from the static site's source). Playwright's `webServer` config auto-starts a static file server over the repo root before tests run and tears it down after.

**Tech Stack:** `@playwright/test`, `serve` (static file server), Chromium only.

## Global Constraints

- Project lives at `playwright-tests/` in the repo root — do not put Node tooling at the repo root itself.
- Chromium only for this setup (per spec's "out of scope" section — no Firefox/WebKit yet).
- Site is served from repo root via `webServer`, not opened as `file://`.
- Spec reference: `docs/superpowers/specs/2026-08-24-playwright-setup-design.md`

---

### Task 1: Scaffold the Playwright project

**Files:**
- Create: `playwright-tests/package.json`
- Create: `playwright-tests/playwright.config.ts`
- Create: `playwright-tests/.gitignore`

**Interfaces:**
- Produces: a `playwright-tests/` npm project with `@playwright/test` and `serve` as devDependencies, and a `playwright.config.ts` that Task 2's test file will run under (`testDir: './tests'`, `baseURL: 'http://localhost:4173'`, single `chromium` project, `webServer` auto-starting `npx serve .. -l 4173`).

- [ ] **Step 1: Create the project directory and initialize npm**

```bash
mkdir playwright-tests
cd playwright-tests
npm init -y
```

- [ ] **Step 2: Install Playwright and a static server as devDependencies**

```bash
npm install -D @playwright/test serve
```

- [ ] **Step 3: Install the Chromium browser binary**

```bash
npx playwright install chromium
```

- [ ] **Step 4: Add a `test` script to `package.json`**

Open `playwright-tests/package.json` and add a `"test"` entry to `"scripts"`:

```json
{
  "scripts": {
    "test": "playwright test"
  }
}
```

- [ ] **Step 5: Write `playwright.config.ts`**

Create `playwright-tests/playwright.config.ts`:

```typescript
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
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

- [ ] **Step 6: Write `.gitignore`**

Create `playwright-tests/.gitignore`:

```
node_modules/
test-results/
playwright-report/
blob-report/
playwright/.cache/
```

- [ ] **Step 7: Verify the config loads cleanly**

Run (from `playwright-tests/`):

```bash
npx playwright test --list
```

Expected: exits with code 0 and reports no tests found (the `tests/` directory doesn't exist yet) — no config errors.

- [ ] **Step 8: Commit**

```bash
git add playwright-tests/package.json playwright-tests/package-lock.json playwright-tests/playwright.config.ts playwright-tests/.gitignore
git commit -m "Scaffold Playwright test project"
```

---

### Task 2: Write and verify the home page smoke test

**Files:**
- Create: `playwright-tests/tests/home.spec.ts`

**Interfaces:**
- Consumes: `playwright.config.ts` from Task 1 (`baseURL: 'http://localhost:4173'`, `webServer` auto-start, `chromium` project).

- [ ] **Step 1: Write the smoke test**

Create `playwright-tests/tests/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with correct title and key sections visible', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Growth Partner | Marketing Digital');
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#inicio')).toBeVisible();
    await expect(page.locator('h1.hero__title')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test suite**

Run (from `playwright-tests/`):

```bash
npx playwright test
```

Expected: 1 test passes. Playwright's `webServer` will auto-start `serve` against the repo root and tear it down after the run.

- [ ] **Step 3: Commit**

```bash
git add playwright-tests/tests/home.spec.ts
git commit -m "Add home page smoke test"
```

---
