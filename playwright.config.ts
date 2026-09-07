import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/environment';

const isCI = Boolean(process.env.CI);
// npm provides the script name, so demo tests need no extra config or environment setup.
const isDemo = process.env.npm_lifecycle_event === 'test:demo';

export default defineConfig({
  testDir: './tests',
  grepInvert: isDemo ? undefined : /@demo-failure/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Keep requests modest because the target is a shared public demo.
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    headless: isCI,
  },
  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'api', testDir: './tests/api' },
  ],
  outputDir: 'test-results',
});
