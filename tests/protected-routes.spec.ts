import { test, expect } from '@fixtures/auth.fixture';

test.describe('Protected Routes', () => {
  test('TC-013: Access Settings Page When Authenticated', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    await app.settings.goto();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /your settings/i })).toBeVisible();
  });

  test('TC-014: Access Settings Page When Not Authenticated', async ({ app, page }) => {
    await app.settings.goto();
    await expect(page).toHaveURL('/login');
  });
});