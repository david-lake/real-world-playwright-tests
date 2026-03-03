import { test, expect } from '@fixtures/auth.fixture';

test.describe('Logout', () => {
  test('TC-021: Successful Logout', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    // Verify logged in
    await expect(page).toHaveURL('/');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).not.toBeNull();

    await app.settings.goto();
    await expect(page).toHaveURL('/settings');

    await app.settings.logout();
    // App redirects to /login after logout due to withAuth redirect
    await expect(page).toHaveURL('/login');
  });
});