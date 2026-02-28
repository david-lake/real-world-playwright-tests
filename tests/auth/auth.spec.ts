import { test, expect } from '../fixtures/fixtures';

/**
 * Authentication Tests
 * 
 * Covers user registration, login, logout, and session management.
 * 
 * @tag @auth @regression
 */

test.describe('Authentication', () => {
  test('user can register with valid credentials', async ({ page, registerPage, testUser }) => {
    await registerPage.goto();
    
    await registerPage.register(
      testUser.username,
      testUser.email,
      testUser.password
    );
    
    // After successful registration, should be redirected to home
    await expect(page).toHaveURL('/');
    
    // Should see user-specific navigation
    await expect(page.getByRole('link', { name: /new article/i })).toBeVisible();
  });

  test('user can login with valid credentials', async ({ page, loginPage, registerPage, testUser }) => {
    // First register a user
    await registerPage.goto();
    await registerPage.register(
      testUser.username,
      testUser.email,
      testUser.password
    );
    
    // Logout first
    await page.goto('/');
    await page.getByRole('link', { name: testUser.username }).click();
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Then login
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    
    // Should be redirected to home
    await expect(page).toHaveURL('/');
    
    // Should see user-specific navigation
    await expect(page.getByRole('link', { name: /new article/i })).toBeVisible();
  });

  test('login shows error with invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpassword');
    
    // Should show error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('email or password');
  });

  test('user can logout', async ({ page, registerPage, testUser }) => {
    // Register and login
    await registerPage.goto();
    await registerPage.register(
      testUser.username,
      testUser.email,
      testUser.password
    );
    
    // Logout
    await page.getByRole('link', { name: testUser.username }).click();
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should see sign in/up links again
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('registration shows error for duplicate email', async ({ registerPage, testUser }) => {
    // Register first user
    await registerPage.goto();
    await registerPage.register(
      testUser.username,
      testUser.email,
      testUser.password
    );
    
    // Try to register again with same email
    await registerPage.goto();
    await registerPage.register(
      `${testUser.username}_2`,
      testUser.email,
      testUser.password
    );
    
    // Should show error
    const errors = await registerPage.getErrorMessages();
    expect(errors.length).toBeGreaterThan(0);
  });
});
