import { test as base, expect } from '@fixtures/app.fixture';
import { createUser, type TestUser } from '@factories/user.factory';

export const test = base.extend<{
  testUser: TestUser;
}>({
  testUser: async ({ dbCleaner }, use) => {
    const user = await createUser();

    await use(user);
  },
});

export { expect };
