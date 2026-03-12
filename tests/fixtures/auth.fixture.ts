import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail, type TestUser } from '@factories/user.factory';
import { App } from 'tests/app/app';

export const test = base.extend<{
  testUser: TestUser;
  app: App;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();

    await use(user);

    // Cleanup after test using unique email
    await deleteUserByEmail(user.email);
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

export { expect };
