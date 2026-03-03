import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/register.page';
import { LoginPage } from './pages/login.page';
import { createUser, deleteUserByEmail, generateUniqueUser } from './factories/user.factory';

test.describe('User Registration', () => {
  test('TC-001: Successful User Registration', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const userData = generateUniqueUser();

    // Navigate to register from login page so router.back() works after signup
    await loginPage.goto();
    await loginPage.clickNeedAnAccount();
    await registerPage.register(userData.username, userData.email, userData.password);
    // After registration, router.back() goes to login page - navigate to home
    await page.goto('/');
    await registerPage.expectRegistrationSuccess();

    await deleteUserByEmail(userData.email);
  });

  test('TC-007: Guest-Only Restriction on Registration Page', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const user = await createUser();

    await loginPage.goto();
    await loginPage.login(user.email, user.plainPassword);
    await expect(page).toHaveURL('/');

    // Navigate to /register - should redirect to / because user is logged in
    await page.goto('/register');
    await expect(page).toHaveURL('/');

    await deleteUserByEmail(user.email);
  });
});
