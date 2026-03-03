import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail, type UserData } from '@factories/user.factory';
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

    // Cleanup after test using unique email
    await deleteUserByEmail(user.email);
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

export { expect };
