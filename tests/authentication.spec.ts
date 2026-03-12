import { test } from '@fixtures/test.fixture';
import { UserData, generateUniqueUser, createUser, deleteUserByEmail } from '@factories/user.factory';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('Successful user registration', async ({ app }) => {
      const newUser = generateUniqueUser();

      await app.home.open();
      await app.header.gotoRegister();
      await app.register.register(newUser.username, newUser.email, newUser.password);

      await app.home.expectLoaded();
      await app.header.expectLoggedIn(newUser.username);
    });

    test('Registration with duplicate username', async ({ app, testUser }) => {
      const newUser = generateUniqueUser();

      await app.login.open();
      await app.login.gotoNeedAnAccount();
      await app.register.register(testUser.username, newUser.email, newUser.password);

      await app.register.expectLoaded();
      await app.register.expectError('Username or email had been used');
      await app.header.expectLoggedOut();
    });

    test('Registration with duplicate email', async ({ app, testUser }) => {
      const newUser = generateUniqueUser();

      await app.register.open();
      await app.register.register(newUser.username, testUser.email, newUser.password);

      await app.register.expectLoaded();
      await app.register.expectError('Username or email had been used');
      await app.header.expectLoggedOut();
    });
  });

  test.describe('Login', () => {
    test('Successful login with valid email and password', async ({ app, testUser }) => {
      await app.home.open();
      await app.header.gotoLogin();
      await app.login.login(testUser.email, testUser.plainPassword);

      await app.home.expectLoaded();
      await app.header.expectLoggedIn(testUser.username);
    });

    test('Login with invalid password', async ({ app, testUser }) => {
      const invalidPasswordUser: UserData = {
        ...testUser,
        password: 'WrongPass123!',
      };

      await app.login.open();
      await app.login.login(invalidPasswordUser.email, invalidPasswordUser.password);

      await app.login.expectLoaded();
      await app.login.expectError('Bad Credentials');
      await app.header.expectLoggedOut();
    });

    test('Login with non-existent email', async ({ app }) => {
      const nonExistentUser: UserData = {
        username: 'nonexistent-user',
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'SomePassword123!',
      };

      await app.login.open();
      await app.login.login(nonExistentUser.email, nonExistentUser.password);

      await app.login.expectLoaded();
      await app.login.expectError('Bad Credentials');
      await app.header.expectLoggedOut();
    });

    test('Session persists on page refresh', async ({ app, testUser, page }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.header.expectLoggedIn(testUser.username);

      await page.reload();

      await app.home.expectLoaded();
      await app.header.expectLoggedIn(testUser.username);
    });
  });

  test.describe('Logout', () => {
    test('Successful logout', async ({ app, testUser }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.header.expectLoggedIn(testUser.username);

      await app.header.gotoSettings();
      await app.settings.logout();

      await app.header.expectLoggedOut();
    });
  });

  test.describe('Protected Routes', () => {
    test('Access settings page when authenticated', async ({ app, testUser }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.header.expectLoggedIn(testUser.username);

      await app.settings.open();
      await app.settings.expectLoaded();
    });

    test('Access settings page when not authenticated', async ({ app }) => {
      await app.settings.open();
      await app.login.expectLoaded();
    });
  });
});