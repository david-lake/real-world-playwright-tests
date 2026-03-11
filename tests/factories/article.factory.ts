import { PrismaClient } from '@prisma/client';
import slug from 'slug';

const prisma = new PrismaClient();

/**
 * Article data for creating or filling article forms.
 * Matches the app's ArticleInput (title, description, body, tagList).
 */
export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

/**
 * Created article with slug for navigation and assertions.
 */
export interface CreatedArticle extends ArticleData {
  slug: string;
  id: number;
}

/**
 * Generate unique article data for tests (parallel-safe).
 */
export function generateUniqueArticle(overrides: Partial<ArticleData> = {}): ArticleData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const title = overrides.title ?? `Test Article ${timestamp} ${random}`;
  return {
    title,
    description: overrides.description ?? `Description for ${title}`,
    body: overrides.body ?? `Body content for ${title}.`,
    tagList: overrides.tagList ?? [`tag-${timestamp}-${random}`],
  };
}

function slugify(title: string): string {
  return `${slug(title, { lower: true })}-${((Math.random() * Math.pow(36, 6)) | 0).toString(36)}`;
}

/**
 * Create an article in the database for the given author (userId).
 * Use for tests that need a pre-existing article (e.g. edit as non-author, favourite, tag filter).
 */
export async function createArticle(
  authorId: number,
  data: ArticleData = generateUniqueArticle()
): Promise<CreatedArticle> {
  const articleSlug = slugify(data.title);
  const tagList = data.tagList.length ? data.tagList : ['default-tag'];

  const article = await prisma.article.create({
    data: {
      slug: articleSlug,
      title: data.title,
      description: data.description,
      body: data.body,
      authorId,
      tags: {
        create: tagList.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tags.map((t) => t.tag.name),
  };
}

/**
 * Create multiple articles in bulk (e.g. for pagination tests).
 * Returns array of created articles. Each can have optional overrides.
 */
export async function createArticles(
  authorId: number,
  count: number,
  overrides: Partial<ArticleData> = {}
): Promise<CreatedArticle[]> {
  const articles: CreatedArticle[] = [];
  for (let i = 0; i < count; i++) {
    const data = generateUniqueArticle({ ...overrides, title: overrides.title ?? `Bulk Article ${Date.now()} ${i}` });
    const article = await createArticle(authorId, data);
    articles.push(article);
  }
  return articles;
}

/**
 * Create a follow relationship for "Your Feed" tests.
 * followerId follows followeeId (follower's feed will include followee's articles).
 */
export async function createFollowRelationship(followerId: number, followeeId: number): Promise<void> {
  await prisma.follows.create({
    data: { followerId, followingId: followeeId },
  });
}

/**
 * Create a favorite (user favorited article) for profile "Favorited Articles" tests.
 */
export async function createFavorite(articleId: number, userId: number): Promise<void> {
  await prisma.favorites.create({
    data: { articleId, userId },
  });
  await prisma.article.update({
    where: { id: articleId },
    data: { favoritesCount: { increment: 1 } },
  });
}

/**
 * Delete an article by slug (for cleanup when creating via API/factory).
 */
export async function deleteArticleBySlug(slug: string): Promise<void> {
  const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
  if (!article) return;

  const articleId = article.id;
  await prisma.$transaction([
    prisma.favorites.deleteMany({ where: { articleId } }),
    prisma.comment.deleteMany({ where: { articleId } }),
    prisma.articlesTags.deleteMany({ where: { articleId } }),
    prisma.article.deleteMany({ where: { id: articleId } }),
  ]);
}
