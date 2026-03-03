import { test, expect } from '@fixtures/auth.fixture';
import { LoginPage } from './pages/login.page';
import { NavigationComponent } from './components/navigation.component';

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