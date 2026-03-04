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

  test('TC-022: Token removed after logout', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await app.settings.goto();

    // Verify token exists before logout
    const tokenBefore = await app.settings.getAuthToken();
    expect(tokenBefore).toBeTruthy();

    await app.settings.logout();

    // Verify logged out state via UI (primary assertion)
    await app.header.isLoggedOut();

    // Verify token removed (secondary assertion)
    const tokenAfter = await app.settings.getAuthToken();
    expect(tokenAfter).toBeFalsy();
  });
});
