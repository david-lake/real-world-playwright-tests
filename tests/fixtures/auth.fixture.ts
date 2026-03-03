import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail } from '../factories/user.factory.js';

interface TestUser {
  username: string;
  email: string;
  password: string;
}

export const test = base.extend<{
  testUser: TestUser;
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
});

export { expect };
