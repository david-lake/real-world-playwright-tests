import { test, expect } from '@fixtures/auth.fixture';

test.describe('Login', () => {
  test('TC-008: Successful Login with Email and Password', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    // Verify successful login by checking URL and localStorage token
    await expect(page).toHaveURL('/');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).not.toBeNull();
  });

  test('TC-012: Guest-Only Restriction on Login Page', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    // Verify logged in
    await expect(page).toHaveURL('/');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).not.toBeNull();

    // Navigate to /login - should redirect to / because user is logged in
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});