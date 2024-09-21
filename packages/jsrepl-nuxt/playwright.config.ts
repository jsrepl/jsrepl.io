import { fileURLToPath } from 'node:url'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { defineConfig, devices } from '@playwright/test'

const devicesToTest = [
  'Desktop Chrome',
  'Desktop Firefox',
  // Test against other common browser engines.
  // 'Desktop Safari',
  // Test against mobile viewports.
  // 'Pixel 5',
  // 'iPhone 12',
  // Test against branded browsers.
  // { ...devices['Desktop Edge'], channel: 'msedge' },
  // { ...devices['Desktop Chrome'], channel: 'chrome' },
] satisfies Array<string | (typeof devices)[string]>

/* See https://playwright.dev/docs/test-configuration. */
export default defineConfig<ConfigOptions>({
  testDir: './tests/playwright',

  timeout: 60000,
  expect: {
    timeout: 20000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Nuxt configuration options */
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      // TODO: prod mode (host: 'https://jsrepl.io', webServer: undefined)
      host: 'http://localhost:3000',
    },

    // Workaround for Error: page.waitForFunction: EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' https: 'unsafe-inline' 'strict-dynamic' 'nonce-P4t/MCK14AqPt4lpoAv0mw==' 'wasm-unsafe-eval'".
    // https://github.com/microsoft/playwright/issues/7395
    bypassCSP: true,
  },
  projects: devicesToTest.map((p) => (typeof p === 'string' ? { name: p, use: devices[p] } : p)),
  webServer: {
    // Workaround: with `turbo test:playwright:web-server:start` the servers do not shut down after tests
    // (the problem is like here https://github.com/microsoft/playwright/issues/11907).
    command: 'pnpm -r test:playwright:web-server:start',
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    url: 'http://localhost:3000',
    // env vars are different for dev mode and test mode: .env and .env.test respectively
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    // env: {},
  },
})
