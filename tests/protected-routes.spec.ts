import { test, expect } from '@fixtures/auth.fixture';

test.describe('Protected Routes', () => {
  test('TC-013: Access Settings Page When Authenticated', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await app.settings.goto();
    await app.settings.isLoaded();
  });

  test('TC-014: Access Settings Page When Not Authenticated', async ({ app, page }) => {
    await app.settings.goto();
    await app.login.isLoaded();
  });
});
