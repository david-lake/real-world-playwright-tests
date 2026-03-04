import { test } from '@fixtures/auth.fixture';
import { UserData, generateUniqueUser, createUser, deleteUserByEmail } from '@factories/user.factory';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('Successful user registration', async ({ app }) => {
      const newUser = generateUniqueUser();

      await app.login.goto();
      await app.login.gotoNeedAnAccount();
      await app.register.register(newUser.username, newUser.email, newUser.password);
      await app.home.isLoaded();
      await app.header.isLoggedIn(newUser.username);
    });

    test('Registration with duplicate username', async ({ app, testUser }) => {
      const newUser = generateUniqueUser();

      await app.register.goto();
      await app.register.register(testUser.username, newUser.email, newUser.password);
      await app.register.isLoaded();
      await app.register.expectError('Username or email had been used');
      await app.header.isLoggedOut();
    });

    test('Registration with duplicate email', async ({ app, testUser }) => {
      const newUser = generateUniqueUser();

      await app.register.goto();
      await app.register.register(newUser.username, testUser.email, newUser.password);
      await app.register.isLoaded();
      await app.register.expectError('Username or email had been used');
      await app.header.isLoggedOut();
    });
  });

  test.describe('Login', () => {
    test('Successful login with valid email and password', async ({ app, testUser }) => {
      await app.login.goto();
      await app.login.loginAs(testUser);
      await app.home.isLoaded();
      await app.header.isLoggedIn(testUser.username);
    });

    test('Login with invalid password', async ({ app, testUser }) => {
      const invalidPasswordUser: UserData = {
        ...testUser,
        password: 'WrongPass123!',
      };

      await app.login.goto();
      await app.login.loginAs(invalidPasswordUser);
      await app.login.isLoaded();
      await app.login.expectError('Bad Credentials');
      await app.header.isLoggedOut();
    });

    test('Login with non-existent email', async ({ app }) => {
      const nonExistentUser: UserData = {
        username: 'nonexistent-user',
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'SomePassword123!',
      };

      await app.login.goto();
      await app.login.loginAs(nonExistentUser);
      await app.login.isLoaded();
      await app.login.expectError('Bad Credentials');
      await app.header.isLoggedOut();
    });

    test('Session persists on page refresh', async ({ app, testUser, page }) => {
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
    test('Successful logout', async ({ app, testUser }) => {
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
    test('Access settings page when authenticated', async ({ app, testUser }) => {
      await app.login.goto();
      await app.login.loginAs(testUser);
      await app.home.isLoaded();
      await app.header.isLoggedIn(testUser.username);

      await app.settings.goto();
      await app.settings.isLoaded();
    });

    test('Access settings page when not authenticated', async ({ app }) => {
      await app.settings.goto();
      await app.login.isLoaded();
    });
  });
});