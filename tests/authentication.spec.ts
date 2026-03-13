import { test } from '@fixtures/test.fixture';
import { UserData, generateUniqueUser } from '@factories/user.factory';

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

    test('Registration with duplicate username', async ({ app, user }) => {
      const newUser = generateUniqueUser();

      await app.login.open();
      await app.login.gotoNeedAnAccount();
      await app.register.register(user.username, newUser.email, newUser.password);

      await app.register.expectLoaded();
      await app.register.expectError('Username or email had been used');
      await app.header.expectLoggedOut();
    });

    test('Registration with duplicate email', async ({ app, user }) => {
      const newUser = generateUniqueUser();

      await app.register.open();
      await app.register.register(newUser.username, user.email, newUser.password);

      await app.register.expectLoaded();
      await app.register.expectError('Username or email had been used');
      await app.header.expectLoggedOut();
    });
  });

  test.describe('Login', () => {

    test('Successful login with valid email and password', async ({ app, user }) => {
      await app.home.open();
      await app.header.gotoLogin();
      await app.login.login(user.email, user.plainPassword);

      await app.home.expectLoaded();
      await app.header.expectLoggedIn(user.username);
    });

    test('Login with invalid password', async ({ app, user }) => {
      const invalidPasswordUser: UserData = {
        ...user,
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

    test('Session persists on page refresh', async ({ app, user, page }) => {
      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.header.expectLoggedIn(user.username);

      await page.reload();

      await app.home.expectLoaded();
      await app.header.expectLoggedIn(user.username);
    });
  });

  test.describe('Logout', () => {

    test('Successful logout', async ({ app, user }) => {
      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.header.expectLoggedIn(user.username);

      await app.header.gotoSettings();
      await app.settings.logout();

      await app.header.expectLoggedOut();
    });
  });

  test.describe('Protected Routes', () => {
    
    test('Access settings page when authenticated', async ({ app, user }) => {
      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.header.expectLoggedIn(user.username);

      await app.settings.open();
      await app.settings.expectLoaded();
    });

    test('Access settings page when not authenticated', async ({ app }) => {
      await app.settings.open();
      await app.login.expectLoaded();
    });
  });
});