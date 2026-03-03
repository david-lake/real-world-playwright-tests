import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal Playwright Configuration
 *
 * Starting with Chromium only. Other browsers can be added later.
 */

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: 'list',

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
  },

  // Configure projects for major browsers - CHROMIUM ONLY for now
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // TODO: Add other browsers later
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_URL: 'mysql://realworld_app:rw_pass_2025@localhost/real_blog?useUnicode=true&characterEncoding=utf8&useSSL=false',
      PRIVATE_JWK: '{"kty":"RSA","n":"0qRhR5EXIzmbzCyDjjugwVaeRjPqVGBMNwpOWk-lxDMGVJgh_0R6Bwy-mkjWGYTVtYXcvuMZv6RXEA000lkA4KLCDf1hsr1b2pN-rOoVLJddfY0CJq4dI7FRdLjswKVg7plwVZBBv_4aa4gJmyYe1GR3mvh_5Fiy646myVVM6495_sauN0eAA902vDhNuGFxhkPFgfpJIrtjuj31bGAA5-FyoAQljqZrQMdlmrKIkzMl8WYdFwt85pAfqfSbrOx42zs-MIVrIlcNU5J34kefDKCQT5H5n9DikPXmTaLBnahND4PR7-bCa0MPfvtU0cDAbu5FYpRoLM_4zCkzXZKt7w","e":"AQAB","d":"HfNWi60DK7SIxQ69Q--Ri3wL9DJ0irvIinjyLCAwE0YoC8Y360pqyW7T-S8LFkTPeEiI2zGCWz_8SyF9lb0nBUnPKtsQ1a_cDCe1ttNv4E_DcNMob6SJKyaOzPhwXXIGZta1ZM0mtCxmyExnBUL11kBUy1mzIZ5FDn5Rk8YHsmSJn1S9MUIuzjZEl84_SUny6oqSl3WG7NtLpoUbj4vFSZ-dmkKEHNt35a0sjabC6Nb_9QmgCEJffmtgb9MvhiU5B4C5hp_mgsASyDEqWconUMtC79b8gNjPqFw9Cd5WxgW37AOuDVBFFq06M7rcLMlLvDaEGyICNmns28ahI5fz0Q","p":"8WxqdaohIXooQ4bcE0t-OJsAX_S_VfzZYrls17CiUnf8Ca_0iknTanBkYgrVP2lG6sIZaGtRlY--7-38ypJZhV9PYxHlc2ZtFO5xOh8XOsNhlnAC2JsIZdiL9-lY5wKGhnRHoSSlcDkB_00Bjsav5Qk8BGdca5VeOskohnwsTfE","q":"31wwVVejLIONENJMvr6OWt_8eTUKiH1_2_K-ddUkxoh8h0jD-p1dcUgGwX784I9588iNHMsyvz_FgD_0e6t4M7xEnjC7KVhBkIru3qeiXwNMsS3Q3FCxq98qjjjmQ2AKFSEeRYIZ-8ircGd2YGRWcY9rcvoIxCNl1trWrDACWd8","dp":"TYC_gHyYXDXqHRt7JRqUL7na2fMpRYKBiwb54RhMU-s-1yFMgOSIYWApaawOn2e9o3miTHo_W6Mk6cNd5u4qnP1m7-f74Bseo5yUbtMyUuQMPQ5Ca6UBgiiNbo3Tw311EE7d--ZW0fsLIBlpiZtRNlbLlKJV8hemg3q2bs4ILxE","dq":"BIQLoh4UeXjraDSoQo79t86hfx3YaawH4r2EpkM57B2kTuPkunNmCT1Ija7wk-WytIAQgk2FaCJ07sPcQIfV9U3QIVag4hQbtz1n2O6QtNUPPuHLQDkNbokjhh6WYTRW39h8kTExL0r-VFZzKT2-Fauto3R0quqAS5i_EFokIgc","qi":"JFySP22z5kc4CsNhwPK4DFTq0b_tnBe-iJ81Jc4yAgjvw01k1HGaMgnW9mz9xLI0QmT6wiSczBuXWmeHo1hmCFLD8SulsqEBVBM8gDraEMXoEQiTl4KLT360NpXWuz9eXl_ijUcCf3fnC4_FO6qly98qIefIVBkOtoR92VXKlwg"}'
    }
  },
});
