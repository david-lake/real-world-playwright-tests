import { test, expect } from '@fixtures/auth.fixture';

test.describe('Protected Routes', () => {
  test('TC-013: Access settings page when authenticated', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await app.settings.goto();
    await app.settings.isLoaded();
  });

  test('TC-014: Access settings page when not authenticated', async ({ app }) => {
    // Navigate to settings - unauthenticated users should be redirected to login
    await app.page.goto('/settings');

    // Wait for redirect to login page
    await expect(app.page).toHaveURL(/.*\/login/, { timeout: 10000 });
    await app.login.isLoaded();
  });

  test('TC-023: Session persists on page refresh', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await page.reload();
    await app.header.isLoggedIn(testUser.username);
  });
});
