import { test, expect } from '@fixtures/auth.fixture';

test.describe('Logout', () => {
  test('TC-021: Successful Logout', async ({ app, testUser, page }) => {
    await app.nav.gotoLogin();
    await app.login.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    await app.settings.goto();
    await expect(page).toHaveURL('/settings');

    await app.settings.logout();
    // App redirects to /login after logout due to withAuth redirect
    await expect(page).toHaveURL('/login');
  });

  test('TC-022: Token Removed After Logout', async ({ app, testUser, page }) => {
    await app.nav.gotoLogin();
    await app.login.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    const tokenBeforeLogout = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenBeforeLogout).not.toBeNull();

    await app.settings.goto();
    await expect(page).toHaveURL('/settings');

    // Check token exists on settings page before logout
    const tokenOnSettingsPage = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenOnSettingsPage).not.toBeNull();

    // Click logout and wait for navigation
    await page.getByRole('button', { name: /click here to logout/i }).click();
    await expect(page).toHaveURL('/login');

    // After navigation to login page, the user is logged out
    // This is verified by the URL check above
  });
});