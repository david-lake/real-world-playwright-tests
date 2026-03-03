import { test } from '@fixtures/auth.fixture';

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
});
