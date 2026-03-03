import { test } from '@fixtures/auth.fixture';

test.describe('Protected Routes', () => {
  test('TC-013: Access settings page when authenticated', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await app.settings.goto();
    await app.settings.isLoaded();
  });

  test('TC-014: Access settings page when not authenticated', async ({ app }) => {
    await app.settings.goto();
    await app.login.isLoaded();
  });
});
