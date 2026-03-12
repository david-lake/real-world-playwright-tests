import { test as base, expect } from '@fixtures/app.fixture';
import { createUser, deleteUserByEmail, type TestUser } from '@factories/user.factory';

export const test = base.extend<{
  testUser: TestUser;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();

    await use(user);

    await deleteUserByEmail(user.email);
  },
});

export { expect };
