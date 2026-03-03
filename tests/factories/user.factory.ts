import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

/**
 * User data type for test users
 */
export interface UserData {
  username: string;
  email: string;
  password: string;
  bio?: string | null;
  image?: string | null;
}

/**
 * Test user returned by createUser - includes DB fields + plainPassword
 */
export interface TestUser extends UserData {
  id: number;
  plainPassword: string;
  bio?: string | null;
  image?: string | null;
}

export function generateUniqueUser(): UserData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    username: `testuser_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'TestPass123!',
  };
}

export async function createUser(overrides: Partial<UserData> = {}): Promise<TestUser> {
  const userData = generateUniqueUser();
  const plainPassword = overrides.password ?? userData.password;
  const user = await prisma.user.create({
    data: {
      username: overrides.username ?? userData.username,
      email: overrides.email ?? userData.email,
      password: hashPassword(plainPassword),
      bio: overrides.bio ?? null,
      image: overrides.image ?? null,
    },
  });
  return { ...user, plainPassword };
}

/**
 * Global cleanup: Delete ALL users from the test database.
 * Use in test.afterEach to ensure complete test isolation.
 */
export async function deleteAllUsers() {
  await prisma.user.deleteMany();
}

/**
 * Delete a user by email address
 */
export async function deleteUserByEmail(email: string) {
  await prisma.user.deleteMany({ where: { email } });
}
