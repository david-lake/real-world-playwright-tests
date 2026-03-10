// spec: specs/feed-navigation-test-plan.md

import { test, expect } from '@fixtures/auth.fixture';
import {
  createArticle,
  createArticles,
  createFollowRelationship,
  createFavorite,
  generateUniqueArticle,
} from '@factories/article.factory';
import { createUser, deleteUserByEmail } from '@factories/user.factory';

test.describe('Feed Navigation', () => {
  test.describe('FT-001: Navigate to Global Feed', () => {
    test('Global Feed tab visible and active by default for guests', async ({ app }) => {
      await app.home.open();
      await app.home.expectLoaded();

      await expect(app.page.getByRole('link', { name: 'Global Feed' })).toBeVisible();
      await app.home.expectGlobalFeedTabActive();

      const count = await app.feed.getArticleCardCount();
      expect(count).toBeGreaterThanOrEqual(0);

      await app.header.expectLoggedOut();
    });
  });

  test.describe('FT-002: Switch Between Global Feed and Your Feed', () => {
    test('Switch between Your Feed and Global Feed when following users with articles', async ({
      app,
      testUser,
    }) => {
      const author = await createUser();
      const article = await createArticle(author.id, generateUniqueArticle({ tagList: ['ft002-tag'] }));
      await createFollowRelationship(testUser.id, author.id);

      try {
        await app.login.open();
        await app.login.login(testUser.email, testUser.plainPassword);
        await app.home.expectLoaded();

        await expect(app.page.getByRole('link', { name: 'Your Feed' })).toBeVisible({ timeout: 10000 });
        await expect(app.page.getByRole('link', { name: 'Global Feed' })).toBeVisible();

        await app.home.gotoYourFeed();
        await app.home.expectYourFeedTabActive();
        await app.home.expectArticleVisible(article.title, article.description);

        await app.home.gotoGlobalFeed();
        await app.home.expectGlobalFeedTabActive();
        await app.home.expectArticleVisible(article.title, article.description);
      } finally {
        await deleteUserByEmail(author.email);
      }
    });
  });

  test.describe('FT-003: Your Feed Empty State', () => {
    test('Empty state when user follows no one', async ({ app, testUser }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.home.open();
      await app.home.expectLoaded();

      await app.home.gotoYourFeed();
      await app.home.expectYourFeedTabActive();
      await app.home.expectEmptyState();

      const count = await app.feed.getArticleCardCount();
      expect(count).toBe(0);
    });
  });

  test.describe('FT-004: Navigate Through Paginated Results', () => {
    test('First page shows 10 articles, scroll loads more', async ({ app }) => {
      const author = await createUser();
      const articles = await createArticles(author.id, 11);

      try {
        await app.home.open();
        await app.home.expectLoaded();

        const initialCount = await app.feed.getArticleCardCount();
        expect(initialCount).toBe(10);

        await app.feed.scrollToLoadMore();

        const afterScrollCount = await app.feed.getArticleCardCount();
        expect(afterScrollCount).toBeGreaterThanOrEqual(11);

        await app.home.expectArticleVisible(articles[10].title, articles[10].description);
      } finally {
        await deleteUserByEmail(author.email);
      }
    });
  });

  test.describe('FT-005: Pagination Disabled on Single Page', () => {
    test('All 5 articles visible, No More when single page', async ({ app }) => {
      const author = await createUser();
      const uniqueTag = `ft005-only-${Date.now()}`;
      const articles = await createArticles(author.id, 5, { tagList: [uniqueTag] });

      try {
        await app.home.open();
        await app.home.expectLoaded();
        await expect(app.page.locator('aside').getByRole('link', { name: uniqueTag })).toBeVisible();
        await app.home.clickTag(uniqueTag);

        await app.home.expectTagFilterActive(uniqueTag);
        for (const article of articles) {
          await app.home.expectArticleVisible(article.title, article.description);
        }

        const count = await app.feed.getArticleCardCount();
        expect(count).toBe(5);

        await app.feed.scrollToLoadMore();
        await app.feed.expectNoMoreButtonVisible();

        for (const article of articles) {
          await app.home.expectArticleVisible(article.title, article.description);
        }
      } finally {
        await deleteUserByEmail(author.email);
      }
    });
  });

  test.describe('FT-006: Filter Feed by Tag', () => {
    test('Click tag filters feed to matching articles only', async ({ app }) => {
      const author = await createUser();
      const articleA = await createArticle(author.id, generateUniqueArticle({ tagList: ['ft006-javascript'] }));
      const articleB = await createArticle(author.id, generateUniqueArticle({ tagList: ['ft006-ruby'] }));

      try {
        await app.home.open();
        await app.home.expectLoaded();

        await expect(app.page.locator('aside').getByRole('link', { name: 'ft006-javascript' })).toBeVisible();
        await app.home.clickTag('ft006-javascript');

        await app.home.expectTagFilterActive('ft006-javascript');
        await app.home.expectArticleVisible(articleA.title, articleA.description);
        await app.home.expectArticleNotVisible(articleB.title);
      } finally {
        await deleteUserByEmail(author.email);
      }
    });
  });

  test.describe('FT-009: View My Articles on User Profile', () => {
    test('My Articles tab active by default, user articles visible', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id);

      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.profile.goto(testUser.username);
      await app.profile.expectLoaded();

      await app.profile.expectMyArticlesTabActive();
      await app.profile.expectUsernameDisplayed(testUser.username);
      await app.profile.expectArticleVisible(article.title);

      await expect(app.page.getByRole('link', { name: 'Favorited Articles' })).toBeVisible();
    });
  });

  test.describe('FT-010: View Favorited Articles on User Profile', () => {
    test('Favorited Articles tab shows favorited articles', async ({ app, testUser }) => {
      const author = await createUser();
      const article = await createArticle(author.id);

      try {
        await createFavorite(article.id, testUser.id);

        await app.login.open();
        await app.login.login(testUser.email, testUser.plainPassword);
        await app.profile.goto(testUser.username);
        await app.profile.expectLoaded();

        await app.profile.gotoFavoritedArticles();
        await app.profile.expectFavoritedArticlesTabActive();
        await app.profile.expectArticleVisible(article.title);
      } finally {
        await deleteUserByEmail(author.email);
      }
    });
  });
});
