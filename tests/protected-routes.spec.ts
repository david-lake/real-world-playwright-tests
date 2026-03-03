import { test, expect } from '@fixtures/auth.fixture';

test.describe('Protected Routes', () => {
  test('TC-013: Access Settings Page When Authenticated', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    // Verify logged in
    await expect(page).toHaveURL('/');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).not.toBeNull();

    await app.settings.goto();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /your settings/i })).toBeVisible();
  });

  test('TC-014: Access Settings Page When Not Authenticated', async ({ app, page }) => {
    await app.settings.goto();
    await expect(page).toHaveURL('/login');
  });
});