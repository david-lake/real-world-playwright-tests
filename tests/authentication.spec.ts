import { test } from '@fixtures/auth.fixture';
import { UserData, generateUniqueUser, createUser, deleteUserByEmail } from '@factories/user.factory';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('TC-001: Successful user registration', async ({ app }) => {
      const userData = generateUniqueUser();

      await app.login.goto();
      await app.login.gotoNeedAnAccount();
      await app.register.register(userData.username, userData.email, userData.password);
      await app.home.isLoaded();
      await app.header.isLoggedIn(userData.username);
    });

    test('TC-002: Registration with duplicate username', async ({ app }) => {
      const existingUsername = 'existinguser';
      const existingEmail = 'existing@example.com';
      const userData = generateUniqueUser();

      await createUser({
        username: existingUsername,
        email: existingEmail,
        password: 'TestPass123',
      });

      await app.register.goto();
      await app.register.register(existingUsername, userData.email, userData.password);
      await app.register.expectError('Username or email had been used');

      await deleteUserByEmail(existingEmail);
    });

    test('TC-003: Registration with duplicate email', async ({ app }) => {
      const existingUsername = 'testuser';
      const existingEmail = 'test@example.com';
      const userData = generateUniqueUser();

      await createUser({
        username: existingUsername,
        email: existingEmail,
        password: 'TestPass123',
      });

      await app.register.goto();
      await app.register.register(userData.username, existingEmail, userData.password);
      await app.register.expectError('Username or email had been used');

      await deleteUserByEmail(existingEmail);
    });
  });

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
});