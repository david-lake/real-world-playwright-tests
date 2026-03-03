import { test, expect } from '@fixtures/auth.fixture';

test.describe('Login', () => {
  test('TC-008: Successful Login with Email and Password', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.login(testUser.email, testUser.password);
    await app.login.expectLoginSuccess();
  });

  test('TC-012: Guest-Only Restriction on Login Page', async ({ app, testUser, page }) => {
    await app.nav.gotoLogin();
    await app.login.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    // Navigate to /login - should redirect to / because user is logged in
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});