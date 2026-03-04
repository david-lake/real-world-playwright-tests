import { test } from '@fixtures/auth.fixture';
import { generateUniqueUser, createUser, deleteUserByEmail } from '@factories/user.factory';

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
