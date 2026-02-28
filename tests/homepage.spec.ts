import { test, expect } from '@playwright/test';

/**
 * Basic smoke test
 * 
 * Verifies Playwright is set up and can access the application.
 */

test('homepage loads with conduit title', async ({ page }) => {
  await page.goto('/');
  
  // Verify the page loaded by checking the title
  await expect(page).toHaveTitle(/conduit/i);
});
