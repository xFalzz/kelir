import { defineConfig } from '@playwright/test';

const isCI = Boolean(
  (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.CI,
);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  retries: isCI ? 2 : 1,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'chrome',
  },
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !isCI,
    timeout: 30000,
  },
});
