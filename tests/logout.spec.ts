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

    const tokenBefore = await page.evaluate(() => window.localStorage.getItem('token'));
    await expect(tokenBefore).toBeTruthy();

    await app.settings.goto();
    await app.settings.logout();
    await app.header.isLoggedOut();

    const tokenAfter = await page.evaluate(() => window.localStorage.getItem('token'));
    await expect(tokenAfter === null || tokenAfter === '').toBeTruthy();
  });
});
