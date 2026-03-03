import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page.js';
import { NavigationComponent } from './components/navigation.component.js';
import { createUser, deleteUserByEmail } from './factories/user.factory.js';

interface TestUser {
  username: string;
  email: string;
  password: string;
}

const test = base.extend<{
  testUser: TestUser;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();
    await use({
      username: user.username,
      email: user.email,
      password: user.plainPassword,
    });
    await deleteUserByEmail(user.email);
  },
});

test.describe('User Login', () => {
  test('TC-008: Successful Login with Email and Password', async ({ page, testUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.expectLoginSuccess();
  });

  test('TC-012: Guest-Only Restriction on Login Page', async ({ page, testUser }) => {
    const loginPage = new LoginPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    // Navigate to /login - should redirect to / because user is logged in
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});