import { test } from '@fixtures/auth.fixture';
import { generateUniqueUser } from '@factories/user.factory';

test.describe('Registration', () => {
  test('TC-001: Successful user registration', async ({ app }) => {
    const userData = generateUniqueUser();

    await app.login.goto();
    await app.login.gotoNeedAnAccount();
    await app.register.register(userData.username, userData.email, userData.password);
    await app.home.isLoaded();
    await app.header.isLoggedIn(userData.username);
  });
});
