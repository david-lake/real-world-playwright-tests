import { test } from '@fixtures/auth.fixture';
import type { UserData } from '@factories/user.factory';

test.describe('Login', () => {
  test('TC-008: Successful login with valid email and password', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);
  });

  test('TC-009: Login with invalid password', async ({ app, testUser }) => {
    const invalidPasswordUser: UserData = {
      ...testUser,
      password: 'WrongPass123!',
    };

    await app.login.goto();
    await app.login.loginAs(invalidPasswordUser);
    await app.login.expectError('Bad Credentials');
    await app.header.isLoggedOut();
  });

  test('TC-010: Login with non-existent email', async ({ app }) => {
    const nonExistentUser: UserData = {
      username: 'nonexistent-user',
      email: `nonexistent-${Date.now()}@example.com`,
      password: 'SomePassword123!',
    };

    await app.login.goto();
    await app.login.loginAs(nonExistentUser);
    await app.login.expectError('Bad Credentials');
    await app.header.isLoggedOut();
  });
});