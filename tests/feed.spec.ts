// spec: specs/feed-navigation-test-plan.md

import { test, expect } from '@fixtures/test.fixture';
import {
  createArticle,
  createArticles,
  createFollowRelationship,
  createFavorite,
  generateUniqueArticle,
} from '@factories/article.factory';
import { createUser } from '@factories/user.factory';

test.describe('Feeds', () => {

  test.describe('Home', () => {

    test('Global Feed: Active by default for guests showing all articles', async ({ app, user }) => {
      const author = await createUser();
      const articleA = await createArticle(user.id)
      const articleB = await createArticle(author.id)

      await app.home.open();
      await app.home.expectLoaded();
      await app.header.expectLoggedOut();

      await app.home.expectGlobalFeedTabActive();
      await app.feed.expectArticleVisible(articleA.title)
      await app.feed.expectArticleVisible(articleB.title)
    });

    test('Switching feeds when following users with articles', async ({ app, user }) => {
      const author1 = await createUser();
      const author2 = await createUser();
      const articleA = await createArticle(user.id)
      const articleB = await createArticle(author1.id)
      const articleC = await createArticle(author2.id);
      await createFollowRelationship(user.id, author1.id);

      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.home.expectLoaded();
      await app.home.gotoYourFeed();

      await app.home.expectYourFeedTabActive();
      await app.feed.expectArticleVisible(articleB.title);
      await app.feed.expectArticleNotVisible(articleA.title);
      await app.feed.expectArticleNotVisible(articleC.title);

      await app.home.gotoGlobalFeed();
      await app.home.expectGlobalFeedTabActive();
      await app.feed.expectArticleVisible(articleA.title);
      await app.feed.expectArticleVisible(articleB.title);
      await app.feed.expectArticleVisible(articleC.title);
    });

    test('Your Feed: Empty when user follows no one', async ({ app, user }) => {
      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.home.expectLoaded();

      await app.home.gotoYourFeed();

      await app.home.expectYourFeedTabActive();
      await app.feed.expectNoArticles();
    });
  });

  test.describe('Paginated Results', () => {

    test('Scroll loads more when more than 10 articles', async ({ app }) => {
      const author = await createUser();
      const articles = await createArticles(author.id, 11);

      await app.home.open();
      await app.home.expectLoaded();

      await expect(app.feed.articles).toHaveCount(10);
      await app.feed.expectArticleNotVisible(articles[0].title);

      await app.feed.scrollToLoadMore();

      await app.feed.expectArticleVisible(articles[0].title);
    });

    test('Scroll does not load more when less than 10 articles', async ({ app }) => {
      const author = await createUser();
      const uniqueTag = `ft005-only-${Date.now()}`;
      const articles = await createArticles(author.id, 9, { tagList: [uniqueTag] });

      await app.home.open();
      await app.home.expectLoaded();

      await app.feed.filterByTag(uniqueTag);

      for (const article of articles) {
        await app.feed.expectArticleVisible(article.title);
      }

      await expect(app.feed.articles).toHaveCount(9);

      await app.feed.scrollToLoadMore();

      await app.feed.expectNoMoreArticles();
      for (const article of articles) {
        await app.feed.expectArticleVisible(article.title);
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

      await app.feed.expectTagFilterActive(uniqueTag);
      await app.feed.expectArticleVisible(articleA.title);
      await app.feed.expectArticleNotVisible(articleB.title);
    });
  });

  test.describe('User Profile', () => {
    
    test('My Articles active by default showing user created articles only', async ({ app, user }) => {
      const author = await createUser();
      const articleA = await createArticle(user.id);
      const articleB = await createArticle(author.id);

      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.profile.open(user.username);
      await app.profile.expectLoaded(user.username);

      await app.profile.expectMyArticlesTabActive();
      await app.feed.expectArticleVisible(articleA.title);
      await app.feed.expectArticleNotVisible(articleB.title);
    });

    test('My Articles empty when user has no articles', async ({ app, user }) => {
      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.profile.open(user.username);
      await app.profile.expectLoaded(user.username);

      await app.profile.expectMyArticlesTabActive();
      await app.feed.expectNoArticles();
    });

    test('Favorited Articles shows favorited articles only', async ({ app, user }) => {
      const author = await createUser();
      const articleA = await createArticle(author.id);
      const articleB = await createArticle(author.id);
      await createFavorite(articleA.id, user.id);

      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.profile.open(user.username);
      await app.profile.expectLoaded(user.username);
      await app.profile.gotoFavoritedArticles();

      await app.profile.expectFavoritedArticlesTabActive();
      await app.feed.expectArticleVisible(articleA.title);
      await app.feed.expectArticleNotVisible(articleB.title);
    });

    test('Favorited Articles empty when user has no favorited articles', async ({ app, user }) => {
      await app.login.open();
      await app.login.login(user.email, user.plainPassword);
      await app.profile.open(user.username);
      await app.profile.expectLoaded(user.username);
      await app.profile.gotoFavoritedArticles();

      await app.profile.expectFavoritedArticlesTabActive();
      await app.feed.expectNoArticles();
    });
  });
});

