import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail } from '../factories/user.factory';
import { User } from '../data/user';

export const test = base.extend<{
  testUser: User;
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
