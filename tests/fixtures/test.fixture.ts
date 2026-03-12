import { test as base, expect } from '@playwright/test';
import { App } from 'tests/app/app';
import { resetDatabase } from '../db/cleaner';
import { createUser, type TestUser } from '@factories/user.factory';

export const test = base.extend<{
  dbCleaner: void;
  app: App;
  testUser: TestUser;
}>({
  dbCleaner: async ({}, use) => {
    await resetDatabase();
    await use();
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
  testUser: async ({}, use) => {
    const user = await createUser();

    await use(user);
  },
});

export { expect };
