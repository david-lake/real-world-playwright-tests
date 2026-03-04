import { test } from '@fixtures/auth.fixture';

test.describe('Session Persistence', () => {
  test('TC-023: Session persists on page refresh', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);

    await page.reload();

    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);
  });
});

