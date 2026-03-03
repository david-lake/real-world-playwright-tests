import { test, expect } from '@fixtures/auth.fixture';

test.describe('Logout', () => {
  test('TC-021: Successful logout', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await app.settings.goto();
    await app.settings.logout();
    await app.header.isLoggedOut();
  });

  test('TC-022: Token removed after logout', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    // Go to settings page first
    await app.settings.goto();

    // Verify we have a token before logout
    const storageStateBefore = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
      };
    });
    expect(storageStateBefore.token).toBeTruthy();

    // Click logout button
    await page.getByRole('button', { name: /click here to logout/i }).click();

    // Give a small delay for the localStorage to be cleared
    await page.waitForTimeout(500);

    // Check token after logout - token should be falsy (null, empty string, or string "null")
    const storageStateAfter = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
      };
    });

    // Token should be null, empty string, or the string "null" after logout
    const isTokenRemoved = !storageStateAfter.token ||
                           storageStateAfter.token === '' ||
                           storageStateAfter.token === 'null' ||
                           storageStateAfter.token === '""';
    expect(isTokenRemoved).toBeTruthy();
  });
});
