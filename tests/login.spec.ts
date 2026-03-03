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
});