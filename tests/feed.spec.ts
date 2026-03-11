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

test.describe('Feeds', () => {

  test.describe('Home', () => {

    test('Global Feed: Active by default for guests showing all articles', async ({ app, testUser }) => {
      const author = await createUser();
      const articleA = await createArticle(testUser.id)
      const articleB = await createArticle(author.id)

      await app.home.open();
      await app.home.expectLoaded();
      await app.header.expectLoggedOut();

      await app.home.expectGlobalFeedTabActive();
      await app.home.expectArticleVisible(articleA.title, articleA.description)
      await app.home.expectArticleVisible(articleB.title, articleB.description)
    });

    test('Switching feeds when following users with articles', async ({ app, testUser }) => {
      const author1 = await createUser();
      const author2 = await createUser();
      const articleA = await createArticle(testUser.id)
      const articleB = await createArticle(author1.id)
      const articleC = await createArticle(author2.id);
      await createFollowRelationship(testUser.id, author1.id);

      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.home.expectLoaded();

      await app.home.gotoYourFeed();
      await app.home.expectYourFeedTabActive();
      await app.home.expectArticleVisible(articleB.title, articleB.description);
      await app.home.expectArticleNotVisible(articleA.title);
      await app.home.expectArticleNotVisible(articleC.title);

      await app.home.gotoGlobalFeed();
      await app.home.expectGlobalFeedTabActive();
      await app.home.expectArticleVisible(articleA.title, articleA.description);
      await app.home.expectArticleVisible(articleB.title, articleB.description);
      await app.home.expectArticleVisible(articleC.title, articleC.description);
    });

    test('Your Feed: Empty when user follows no one', async ({ app, testUser }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.home.expectLoaded();

      await app.home.gotoYourFeed();

      await app.home.expectYourFeedTabActive();
      await app.home.expectEmptyFeed();
    });
  });

  test.describe('Paginated Results', () => {

    test('Scroll loads more when more than 10 articles', async ({ app }) => {
      const author = await createUser();
      const articles = await createArticles(author.id, 11);

      await app.home.open();
      await app.home.expectLoaded();

      await expect(app.feed.articles).toHaveCount(10);

      await app.feed.scrollToLoadMore();

      await app.home.expectArticleVisible(articles[10].title, articles[10].description);
    });

    test('Scroll does not load more when less than 10 articles', async ({ app }) => {
      const author = await createUser();
      const uniqueTag = `ft005-only-${Date.now()}`;
      const articles = await createArticles(author.id, 9, { tagList: [uniqueTag] });

      await app.home.open();
      await app.home.expectLoaded();

      await app.feed.filterByTag(uniqueTag);

      for (const article of articles) {
        await app.home.expectArticleVisible(article.title, article.description);
      }

      await expect(app.feed.articles).toHaveCount(9);

      await app.feed.scrollToLoadMore();
      await app.feed.expectNoMoreArticles();

      for (const article of articles) {
        await app.home.expectArticleVisible(article.title, article.description);
      }
    });
  });

  test.describe('Filters', () => {

    test('Filter by Tag: Shows matching articles only', async ({ app }) => {
      const author = await createUser();
      const uniqueTag = `ft005-only-${Date.now()}`;
      const articleA = await createArticle(author.id, generateUniqueArticle({ tagList: [uniqueTag] }));
      const articleB = await createArticle(author.id);

      await app.home.open();
      await app.home.expectLoaded();

      await app.feed.filterByTag(uniqueTag);

      await app.home.expectTagFilterActive(uniqueTag);
      await app.home.expectArticleVisible(articleA.title, articleA.description);
      await app.home.expectArticleNotVisible(articleB.title);
    });
  });

  test.describe('User Profile', () => {
    
    test('My Articles active by default showing user created articles only', async ({ app, testUser }) => {
      const author = await createUser();
      const articleA = await createArticle(testUser.id);
      const articleB = await createArticle(author.id);

      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.profile.goto(testUser.username);
      await app.profile.expectLoaded();

      await app.profile.expectMyArticlesTabActive();
      await app.profile.expectArticleVisible(articleA.title);
      await app.profile.expectArticleNotVisible(articleB.title);
    });

    test('Favorited Articles shows favorited articles only', async ({ app, testUser }) => {
      const author = await createUser();
      const articleA = await createArticle(author.id);
      const articleB = await createArticle(author.id);
      await createFavorite(articleA.id, testUser.id);

      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.profile.goto(testUser.username);
      await app.profile.expectLoaded();
      await app.profile.gotoFavoritedArticles();

      await app.profile.expectFavoritedArticlesTabActive();
      await app.profile.expectArticleVisible(articleA.title);
      await app.profile.expectArticleNotVisible(articleB.title);
    });
  });
});

