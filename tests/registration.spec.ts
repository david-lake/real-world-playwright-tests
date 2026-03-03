import { test, expect } from '@fixtures/auth.fixture';
import { generateUniqueUser } from '@factories/user.factory';

test.describe('Registration', () => {
  test('TC-001: Successful User Registration', async ({ app, page }) => {
    const userData = generateUniqueUser();

    // Navigate to register from login page so router.back() works after signup
    await app.login.goto();
    await app.login.clickNeedAnAccount();
    await app.register.register(userData.username, userData.email, userData.password);
    // After registration, router.back() goes to login page - navigate to home
    await page.goto('/');
    await app.register.expectRegistrationSuccess();
  });

  test('TC-007: Guest-Only Restriction on Registration Page', async ({ app, testUser, page }) => {
    await app.login.goto();
    await app.login.login(testUser.email, testUser.password);
    await expect(page).toHaveURL('/');

    // Navigate to /register - should redirect to / because user is logged in
    await page.goto('/register');
    await expect(page).toHaveURL('/');
  });
});