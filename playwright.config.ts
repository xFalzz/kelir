import { defineConfig } from '@playwright/test';

const isCI = Boolean(
  (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.CI,
);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: isCI ? 240000 : 180000,
  retries: isCI ? 1 : 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(isCI
      ? {
          launchOptions: {
            args: [
              '--use-gl=angle',
              '--use-angle=swiftshader',
              '--enable-webgl',
              '--enable-unsafe-swiftshader',
              '--ignore-gpu-blocklist',
            ],
          },
        }
      : {
          channel: 'chrome',
        }),
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !isCI,
    timeout: 90000,
    env: {
      KELIR_DISABLE_LIVE_GEMINI: '1',
    },
  },
});
