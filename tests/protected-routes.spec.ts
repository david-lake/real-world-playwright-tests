import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page.js';
import { SettingsPage } from './pages/settings.page.js';
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

test.describe('Protected Routes', () => {
  test('TC-013: Access Settings Page When Authenticated', async ({ page, testUser }) => {
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    await settingsPage.goto();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /your settings/i })).toBeVisible();
  });

  test('TC-014: Access Settings Page When Not Authenticated', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await expect(page).toHaveURL('/login');
  });
});