import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Resets the database by deleting all data in dependency order.
 * Used at the start of each E2E test to ensure isolation.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.favorites.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.articlesTags.deleteMany(),
    prisma.article.deleteMany(),
    prisma.follows.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tag.deleteMany(),
  ]);
}
