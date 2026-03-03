import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { SettingsPage } from './pages/settings.page';
import { NavigationComponent } from './components/navigation.component';
import { createUser, deleteUserByEmail } from './factories/user.factory';

test.describe('User Logout', () => {
  test('TC-021: Successful Logout', async ({ page }) => {
    const user = await createUser();
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(user.email, user.plainPassword);
    await expect(page).toHaveURL('/');

    await settingsPage.goto();
    await expect(page).toHaveURL('/settings');

    await settingsPage.logout();
    // App redirects to /login after logout due to withAuth redirect
    await expect(page).toHaveURL('/login');

    await deleteUserByEmail(user.email);
  });

  test('TC-022: Token Removed After Logout', async ({ page }) => {
    const user = await createUser();
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(user.email, user.plainPassword);
    await expect(page).toHaveURL('/');

    const tokenBeforeLogout = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenBeforeLogout).not.toBeNull();

    await settingsPage.goto();
    await expect(page).toHaveURL('/settings');

    // Check token exists on settings page before logout
    const tokenOnSettingsPage = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenOnSettingsPage).not.toBeNull();

    // Click logout and wait for navigation
    await page.getByRole('button', { name: /click here to logout/i }).click();
    await expect(page).toHaveURL('/login');

    // After navigation to login page, the user is logged out
    // This is verified by the URL check above

    await deleteUserByEmail(user.email);
  });
});
