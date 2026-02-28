import { test as base, expect, Page } from '@playwright/test';

/**
 * Test user type
 */
interface TestUser {
  username: string;
  email: string;
  password: string;
}

/**
 * Generate unique test user to avoid conflicts
 */
function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!'
  };
}

/**
 * AuthPage - Page Object for authentication flows
 * 
 * Principles:
 * - Methods represent user intent (what user is trying to do)
 * - Inline locators using getByRole (accessible, resilient)
 * - Includes verification (assertions after actions)
 * - No thin wrappers like clickThis() or fillThat()
 */
class AuthPage {
  constructor(private page: Page) {}

  /**
   * Navigate to registration page
   */
  async gotoRegister(): Promise<void> {
    await this.page.goto('/register');
    await expect(this.page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  }

  /**
   * Navigate to login page
   */
  async gotoLogin(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  /**
   * Complete registration flow for a new user
   * Includes: fill form, submit, verify redirect to home
   */
  async completeRegistration(user: TestUser): Promise<void> {
    await this.page.getByRole('textbox', { name: /username/i }).fill(user.username);
    await this.page.getByRole('textbox', { name: /email/i }).fill(user.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(user.password);
    await this.page.getByRole('button', { name: /sign up/i }).click();
    
    // Verify successful registration - redirected to home
    await expect(this.page).toHaveURL('/', { timeout: 10000 });
    await expect(this.page.getByRole('link', { name: user.username })).toBeVisible();
  }

  /**
   * Complete login flow
   * Includes: fill form, submit, verify redirect to home
   */
  async completeLogin(email: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: /email/i }).fill(email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login - redirected to home
    await expect(this.page).toHaveURL('/', { timeout: 10000 });
  }

  /**
   * Complete logout flow
   * Includes: click settings, click logout, verify redirect
   */
  async completeLogout(): Promise<void> {
    await this.page.getByRole('link', { name: /settings/i }).click();
    await this.page.getByRole('button', { name: /or click here to logout/i }).click();
    
    // Verify logged out - see sign in/up links
    await expect(this.page.getByRole('link', { name: /sign in/i })).toBeVisible();
  }

  /**
   * Attempt login with invalid credentials
   * Verifies error message is displayed
   */
  async attemptLoginWithInvalidCredentials(email: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: /email/i }).fill(email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    
    // Error should be displayed
    const errorList = this.page.locator('.error-messages li');
    await expect(errorList).toBeVisible();
  }

  /**
   * Check if user is logged in (sees New Article link)
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.getByRole('link', { name: /new article/i }).isVisible();
  }

  /**
   * Check if on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return await this.page.getByRole('heading', { name: /sign in/i }).isVisible();
  }
}

/**
 * Extended test with auth page fixture
 */
const test = base.extend<{
  authPage: AuthPage;
}>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  }
});

test.describe('Authentication', () => {
  test('new user can register and is automatically logged in', async ({ authPage }) => {
    const user = generateTestUser();
    
    await authPage.gotoRegister();
    await authPage.completeRegistration(user);
    
    // Verify logged in state
    expect(await authPage.isLoggedIn()).toBe(true);
  });

  test('registered user can login', async ({ authPage }) => {
    // Setup: Register a new user via UI
    const user = generateTestUser();
    await authPage.gotoRegister();
    await authPage.completeRegistration(user);
    await authPage.completeLogout();
    
    // Test: Login with registered credentials
    await authPage.gotoLogin();
    await authPage.completeLogin(user.email, user.password);
    
    // Verify logged in
    expect(await authPage.isLoggedIn()).toBe(true);
  });

  test('user can logout', async ({ authPage }) => {
    // Setup: Register and verify logged in
    const user = generateTestUser();
    await authPage.gotoRegister();
    await authPage.completeRegistration(user);
    
    // Test: Logout
    await authPage.completeLogout();
    
    // Verify logged out
    expect(await authPage.isOnLoginPage()).toBe(true);
  });

  test('login with invalid credentials shows error', async ({ authPage }) => {
    await authPage.gotoLogin();
    await authPage.attemptLoginWithInvalidCredentials('wrong@example.com', 'wrongpassword');
  });

  test('registration with duplicate email shows error', async ({ page, authPage }) => {
    // Setup: Register first user
    const user = generateTestUser();
    await authPage.gotoRegister();
    await authPage.completeRegistration(user);
    
    // Test: Try to register with same email (different username)
    await authPage.gotoRegister();
    await page.getByRole('textbox', { name: /username/i }).fill(`different_${user.username}`);
    await page.getByRole('textbox', { name: /email/i }).fill(user.email); // Same email
    await page.getByRole('textbox', { name: /password/i }).fill(user.password);
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Verify error shown
    const errorList = page.locator('.error-messages li');
    await expect(errorList).toBeVisible();
  });
});
