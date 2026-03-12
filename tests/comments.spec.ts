// spec: specs/article-test-plan.md

import { test, expect } from '@fixtures/auth.fixture';
import { createArticle, createComment } from '@factories/article.factory';
import { createUser } from '@factories/user.factory';

test.describe('Comments', () => {

  test.describe('Guests', () => {
    test('Prevent commenting when not logged in', async ({ app }) => {
      const author = await createUser();
      const article = await createArticle(author.id);

      await app.article.open(article.slug);
      await app.article.expectLoaded();
      await app.header.expectLoggedOut();

      await expect(app.article.commentTextarea()).toHaveCount(0);

      const guestPrompt = app.page.getByText('Sign in or sign up to add comments on this article.');
      await expect(guestPrompt).toBeVisible();
      await expect(guestPrompt.getByRole('link', { name: 'Sign in' })).toBeVisible();
      await expect(guestPrompt.getByRole('link', { name: 'Sign up' })).toBeVisible();
    });
  });

  test.describe('Authenticated as test user', () => {
    test.beforeEach(async ({ app, testUser }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.home.expectLoaded();
      await app.header.expectLoggedIn(testUser.username);
    });

    test("Add comment to another author's article", async ({ app, testUser }) => {
      const authorUser = await createUser();
      const article = await createArticle(authorUser.id);
      const commentText = `Comment from reader ${Date.now()}`;

      await app.article.open(article.slug);
      await app.article.expectLoaded();

      await app.article.postComment(commentText);

      await app.article.expectCommentVisible(commentText, testUser.username);
    });

    test('Delete own comment', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id);
      const commentText = `Comment to delete ${Date.now()}`;

      await app.article.open(article.slug);
      await app.article.expectLoaded();

      await app.article.postComment(commentText);
      await app.article.expectCommentVisible(commentText, testUser.username);

      await app.article.deleteComment(commentText);

      await app.article.expectCommentNotVisible(commentText);
      await app.article.expectLoaded();
    });
  });

  test.describe("Author vs other user's comment", () => {
    test("Prevent deleting another user's comment", async ({ app }) => {
      const authorUser = await createUser();
      const otherUser = await createUser();
      const article = await createArticle(authorUser.id);
      const commentText = `Other user comment ${Date.now()}`;

      await createComment(article.id, otherUser.id, commentText);

      await app.login.open();
      await app.login.login(authorUser.email, authorUser.plainPassword);
      await app.home.expectLoaded();
      await app.header.expectLoggedIn(authorUser.username);

      await app.article.open(article.slug);
      await app.article.expectLoaded();

      await app.article.expectCommentVisible(commentText, otherUser.username);
      await app.article.expectCannotDeleteComment(commentText);
    });
  });
});
