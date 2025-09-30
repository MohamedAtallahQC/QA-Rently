import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  /* Global timeout for each test - optimized for performance */
  timeout: 15000,
  /* Global timeout for the whole test run */
  globalTimeout: 600000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
    /* Global test timeout - optimized for performance */
    actionTimeout: 5000,
    /* Navigation timeout - optimized for performance */
    navigationTimeout: 15000,
    /* Optimize for performance */
    ignoreHTTPSErrors: true,
    /* Reduce browser overhead */
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI,VizDisplayCompositor'
      ]
    }
  },

  /* Configure projects for different environments */
  projects: [
    /* Tenant Dashboard Tests */
    {
      name: 'tenant-chromium',
      testDir: './tests/tenant',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://dev.rently.sa/en',
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      },
    },
    {
      name: 'tenant-firefox',
      testDir: './tests/tenant',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: 'https://dev.rently.sa/en',
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      },
    },

    /* Admin Dashboard Tests */
    {
      name: 'admin-chromium',
      testDir: './tests/admin',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://admin.dev.rently.sa',
        extraHTTPHeaders: {
          'Accept-Language': 'ar-SA,ar;q=0.9'
        }
      },
    },
    {
      name: 'admin-firefox',
      testDir: './tests/admin',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: 'https://admin.dev.rently.sa',
        extraHTTPHeaders: {
          'Accept-Language': 'ar-SA,ar;q=0.9'
        }
      },
    },

    /* Cross-browser tests */
    {
      name: 'webkit',
      testDir: './tests',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
