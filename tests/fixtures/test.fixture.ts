import { test as base, expect } from '@playwright/test';
import { App } from '@utils/app';
import { resetDatabase } from '@utils/db';
import { createUser, type CreatedUser } from '@factories/user.factory';

export const test = base.extend<{
  dbCleaner: void;
  app: App;
  user: CreatedUser;
}>({
  dbCleaner: async ({}, use) => {
    await resetDatabase();
    await use();
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
  user: async ({}, use) => {
    const user = await createUser();
    await use(user);
  },
});

export { expect };
