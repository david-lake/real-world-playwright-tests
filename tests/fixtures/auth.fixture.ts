import { test as base, expect } from '@playwright/test';
import { createUser, deleteAllUsers, type UserData } from '@factories/user.factory';
import { App } from '@pages/app';

export const test = base.extend<{
  testUser: UserData;
  app: App;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();

    await use({
      username: user.username,
      email: user.email,
      password: user.plainPassword,
    });
    // Cleanup handled by global afterEach
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

// Global cleanup: runs after every test to ensure isolation
test.afterEach(async () => {
  await deleteAllUsers();
});

export { expect };