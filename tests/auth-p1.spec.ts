import { test, expect } from '@fixtures/auth.fixture';
import { createUser, deleteUserByEmail, generateUniqueUser } from '@factories/user.factory';

test.describe('Registration - P1', () => {
  test('TC-002: Registration with duplicate username', async ({ app }) => {
    const existingUser = await createUser();
    const newUser = generateUniqueUser();

    try {
      await app.register.goto();
      await app.register.register(existingUser.username, newUser.email, newUser.password);

      const errorMessage = await app.register.getErrorMessage();
      expect(errorMessage).toContain('Username or email had been used');
    } finally {
      await deleteUserByEmail(existingUser.email);
    }
  });

  test('TC-003: Registration with duplicate email', async ({ app }) => {
    const existingUser = await createUser();
    const newUser = generateUniqueUser();

    try {
      await app.register.goto();
      await app.register.register(newUser.username, existingUser.email, newUser.password);

      const errorMessage = await app.register.getErrorMessage();
      expect(errorMessage).toContain('Username or email had been used');
    } finally {
      await deleteUserByEmail(existingUser.email);
    }
  });
});

test.describe('Login - P1', () => {
  test('TC-009: Login with invalid password', async ({ app, testUser }) => {
    await app.login.goto();
    await app.login.loginAs({ ...testUser, password: 'WrongPassword123!' });

    const errorMessage = await app.login.getErrorMessage();
    expect(errorMessage).toContain('Bad Credentials');
  });

  test('TC-010: Login with non-existent email', async ({ app }) => {
    const nonExistentUser = generateUniqueUser();

    await app.login.goto();
    await app.login.loginAs({ 
      email: nonExistentUser.email, 
      password: nonExistentUser.password,
      username: nonExistentUser.username
    });

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
    await app.settings.updateBio('Updated bio for testing');
    await app.settings.updateImage('https://example.com/new-image.jpg');
    await app.settings.saveChanges();

    // Verify success notification
    await app.settings.expectUpdateSuccess();

    // Re-navigate to verify persistence
    await app.settings.goto();
    await app.settings.expectBio('Updated bio for testing');
    await app.settings.expectImage('https://example.com/new-image.jpg');
  });
});
