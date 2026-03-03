import { test, expect } from '@fixtures/auth.fixture';
import { RegisterPage } from './pages/register.page';
import { LoginPage } from './pages/login.page';
import { generateUniqueUser, deleteUserByEmail } from './factories/user.factory';

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

    // Clean up the user created via UI
    await deleteUserByEmail(userData.email);
  });

  test('TC-007: Guest-Only Restriction on Registration Page', async ({ page, testUser }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    // Navigate to /register - should redirect to / because user is logged in
    await page.goto('/register');
    await expect(page).toHaveURL('/');
  });
});