import { test as base, expect } from '@playwright/test';
import { App } from 'tests/app/app';

export const test = base.extend<{
  app: App;
}>({
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

export { expect };
