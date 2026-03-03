import { test, expect } from '@fixtures/auth.fixture';
import { createUser, deleteUserByEmail, generateUniqueUser } from '@factories/user.factory';

test.describe('Registration - P1', () => {
  test('TC-002: Registration with duplicate username', async ({ app }) => {
    const existingUser = await createUser();
    const newUser = generateUniqueUser();

    await app.register.goto();
    await app.register.register(existingUser.username, newUser.email, newUser.password);

    const errorMessage = await app.register.getErrorMessage();
    expect(errorMessage).toContain('Username or email had been used');

    await deleteUserByEmail(existingUser.email);
  });

  test('TC-003: Registration with duplicate email', async ({ app }) => {
    const existingUser = await createUser();
    const newUser = generateUniqueUser();

    await app.register.goto();
    await app.register.register(newUser.username, existingUser.email, newUser.password);

    const errorMessage = await app.register.getErrorMessage();
    expect(errorMessage).toContain('Username or email had been used');

    await deleteUserByEmail(existingUser.email);
  });
});

test.describe('Login - P1', () => {
  test('TC-009: Login with invalid password', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginWith(testUser.email, 'WrongPassword123!');

    const errorMessage = await app.login.getErrorMessage();
    expect(errorMessage).toContain('Bad Credentials');
  });

  test('TC-010: Login with non-existent email', async ({ app }) => {
    const nonExistentUser = generateUniqueUser();

    await app.login.goto();
    await app.login.loginWith(nonExistentUser.email, nonExistentUser.password);

    const errorMessage = await app.login.getErrorMessage();
    expect(errorMessage).toContain('Bad Credentials');
  });
});

test.describe('Profile Update - P1', () => {
  test('TC-017: Update user profile successfully', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();

    await app.settings.goto();
    await app.settings.updateProfile({
      bio: 'Updated bio for testing',
      image: 'https://example.com/new-image.jpg',
    });

    await app.settings.waitForUpdateSuccess();

    await app.settings.goto();
    await expect(app.page.getByPlaceholder('Short bio about you')).toHaveValue('Updated bio for testing');
  });
});
