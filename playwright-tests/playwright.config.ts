import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // No longer load-bearing for visual-snapshot determinism — see the plan's
    // Task 6 RULING in docs/superpowers/plans/2026-10-05-playwright-test-framework.md.
    // Kept because it's harmless and may start working on a future Playwright upgrade.
    reducedMotion: 'reduce',
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
