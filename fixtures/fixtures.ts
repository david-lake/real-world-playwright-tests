import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ArticlePage } from '../pages/ArticlePage';
import { FeedPage } from '../pages/FeedPage';
import { ProfilePage } from '../pages/ProfilePage';
import { Navigation } from '../pages/components/Navigation';

/**
 * Test user type definition
 */
export interface TestUser {
  username: string;
  email: string;
  password: string;
}

/**
 * Extended test fixture with page objects and test user
 * 
 * Usage:
 * ```typescript
 * import { test } from '../fixtures/fixtures';
 * 
 * test('example', async ({ loginPage, testUser }) => {
 *   await loginPage.goto();
 *   await loginPage.login(testUser.email, testUser.password);
 * });
 * ```
 */
export const test = base.extend<{
  // Page objects
  loginPage: LoginPage;
  registerPage: RegisterPage;
  articlePage: ArticlePage;
  feedPage: FeedPage;
  profilePage: ProfilePage;
  navigation: Navigation;
  
  // Test data
  testUser: TestUser;
}>({
  // Initialize page objects
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  
  feedPage: async ({ page }, use) => {
    await use(new FeedPage(page));
  },
  
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  
  navigation: async ({ page }, use) => {
    await use(new Navigation(page));
  },
  
  // Generate unique test user for each test
  testUser: async ({}, use) => {
    const timestamp = Date.now();
    const user: TestUser = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'TestPassword123!',
    };
    
    await use(user);
    
    // Cleanup could happen here if needed
    // For now, we rely on database cleanup or test isolation
  },
});

export { expect } from '@playwright/test';
