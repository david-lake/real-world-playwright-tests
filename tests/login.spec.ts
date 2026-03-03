import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { NavigationComponent } from './components/navigation.component';
import { createUser, deleteUserByEmail } from './factories/user.factory';

test.describe('User Login', () => {
  test('TC-008: Successful Login with Email and Password', async ({ page }) => {
    const user = await createUser();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(user.email, user.plainPassword);
    await loginPage.expectLoginSuccess();

    await deleteUserByEmail(user.email);
  });

  test('TC-012: Guest-Only Restriction on Login Page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const nav = new NavigationComponent(page);
    const user = await createUser();

    await nav.gotoLogin();
    await loginPage.login(user.email, user.plainPassword);
    await expect(page).toHaveURL('/');

    // Navigate to /login - should redirect to / because user is logged in
    await page.goto('/login');
    await expect(page).toHaveURL('/');

    await deleteUserByEmail(user.email);
  });
});
