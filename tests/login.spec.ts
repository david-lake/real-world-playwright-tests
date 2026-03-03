import { test } from '@fixtures/auth.fixture';

test.describe('Login', () => {
  test('TC-008: Successful login with valid email and password', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);
  });
});