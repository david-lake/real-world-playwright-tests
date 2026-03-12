import { test as base, expect } from '@playwright/test';
import { App } from 'tests/app/app';
import { resetDatabase } from '../db/cleaner';

export const test = base.extend<{
  dbCleaner: void;
  app: App;
}>({
  dbCleaner: async ({}, use) => {
    await resetDatabase();
    await use();
  },
  app: async ({ dbCleaner, page }, use) => {
    await use(new App(page));
  },
});

export { expect };
