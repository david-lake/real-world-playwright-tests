import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail } from '@factories/user.factory';
import { App } from '@pages/app';

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

export const test = base.extend<{
  testUser: TestUser;
  app: App;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();

    await use({
      username: user.username,
      email: user.email,
      password: user.plainPassword,
    });

    await deleteUserByEmail(user.email);
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

export { expect };
