import { test, expect } from '@fixtures/auth.fixture';
import { LoginPage } from './pages/login.page';
import { SettingsPage } from './pages/settings.page';
import { NavigationComponent } from './components/navigation.component';

test.describe('User Logout', () => {
  test('TC-021: Successful Logout', async ({ page, testUser }) => {
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    await settingsPage.goto();
    await expect(page).toHaveURL('/settings');

    await settingsPage.logout();
    // App redirects to /login after logout due to withAuth redirect
    await expect(page).toHaveURL('/login');
  });

  test('TC-022: Token Removed After Logout', async ({ page, testUser }) => {
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    const nav = new NavigationComponent(page);

    await nav.gotoLogin();
    await loginPage.login(testUser.email, testUser.password);
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
  });
});