import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function generateUniqueUser(): { username: string; email: string; password: string } {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    username: `testuser_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'TestPass123!',
  };
}

export async function createUser(overrides: {
  username?: string;
  email?: string;
  password?: string;
  bio?: string;
  image?: string;
} = {}) {
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

export async function deleteUserByEmail(email: string) {
  await prisma.user.deleteMany({ where: { email } });
}

export async function deleteUserByUsername(username: string) {
  await prisma.user.deleteMany({ where: { username } });
}

/**
 * Global cleanup: Delete all test users created during tests.
 * Matches users with emails starting with 'test_' or usernames starting with 'testuser_'.
 */
export async function deleteAllTestUsers() {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { startsWith: 'test_' } },
        { username: { startsWith: 'testuser_' } },
      ],
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
