import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { SettingsPage } from './pages/settings.page';
import { NavigationComponent } from './components/navigation.component';
import { createUser, deleteUserByEmail } from './factories/user.factory';

test.describe('Protected Routes', () => {
  test('TC-013: Access Settings Page When Authenticated', async ({ page }) => {
    const user = await createUser();
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(user.email, user.plainPassword);
    await expect(page).toHaveURL('/');

    await settingsPage.goto();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /your settings/i })).toBeVisible();

    await deleteUserByEmail(user.email);
  });

  test('TC-014: Access Settings Page When Not Authenticated', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await expect(page).toHaveURL('/login');
  });
});
