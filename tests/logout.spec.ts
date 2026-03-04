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

    await app.settings.goto();

    const storageStateBefore = await page.evaluate(() => ({
      token: localStorage.getItem('token'),
    }));
    expect(storageStateBefore.token).toBeTruthy();

    await page.getByRole('button', { name: /click here to logout/i }).click();

    await page.waitForTimeout(500);

    const storageStateAfter = await page.evaluate(() => ({
      token: localStorage.getItem('token'),
    }));

    const isTokenRemoved = !storageStateAfter.token ||
                           storageStateAfter.token === '' ||
                           storageStateAfter.token === 'null' ||
                           storageStateAfter.token === '""';
    expect(isTokenRemoved).toBeTruthy();
  });
});
