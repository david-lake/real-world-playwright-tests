import { test, expect } from '@fixtures/test.fixture';
import { createArticle, createComment } from '@factories/article.factory';
import { createUser } from '@factories/user.factory';

test.describe('Comments', () => {

  test.describe('Guests', () => {

    test('Prevent commenting on articles when not logged in', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id);

      await app.article.open(article.slug);
      await app.article.expectLoaded();
      await app.header.expectLoggedOut();

      await expect(app.page.getByPlaceholder('Write a comment...')).not.toBeVisible();

      const guestPrompt = app.page.getByText('Sign in or sign up to add comments on this article.');
      await expect(guestPrompt).toBeVisible();
      await expect(guestPrompt.getByRole('link', { name: 'Sign in' })).toBeVisible();
      await expect(guestPrompt.getByRole('link', { name: 'Sign up' })).toBeVisible();
    });

    test('Allowed to see comments on articles when not logged in', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id);
      const commentText = `Comment ${Date.now()}`;
      await createComment(article.id, testUser.id, commentText);

      await app.article.open(article.slug);
      await app.article.expectLoaded();
      await app.header.expectLoggedOut();

      await app.article.expectCommentVisible(commentText, testUser.username);
    });
  });

  test.describe('Authenticated user', () => {
    
    test.beforeEach(async ({ app, testUser }) => {
      await app.login.open();
      await app.login.login(testUser.email, testUser.plainPassword);
      await app.home.expectLoaded();
      await app.header.expectLoggedIn(testUser.username);
    });

    test('Add comment to own article', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id)
      const commentText = `Test comment ${Date.now()}`;

      await app.article.open(article.slug)
      await app.article.expectLoaded();
      await app.article.postComment(commentText);
      
      await app.article.expectLoaded();
      await app.article.expectCommentVisible(commentText, testUser.username);
    });

    test("Add comment to another author's article", async ({ app, testUser }) => {
      const author = await createUser();
      const article = await createArticle(author.id);
      const commentText = `Comment from reader ${Date.now()}`;

      await app.article.open(article.slug);
      await app.article.expectLoaded();
      await app.article.postComment(commentText);
      
      await app.article.expectLoaded();
      await app.article.expectCommentVisible(commentText, testUser.username);
    });

    test('Delete own comment', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id);
      const commentText = `Comment to delete ${Date.now()}`;
      await createComment(article.id, testUser.id, commentText);

      await app.article.open(article.slug);
      await app.article.expectLoaded();
      await app.article.deleteComment(commentText);
      
      await app.article.expectLoaded();
      await app.article.expectCommentNotVisible(commentText);
    });

    test("Prevent deleting another user's comment", async ({ app, testUser }) => {
      const otherUser = await createUser();
      const article = await createArticle(testUser.id);
      const commentText = `Other user comment ${Date.now()}`;
      await createComment(article.id, otherUser.id, commentText);

      await app.article.open(article.slug);
      await app.article.expectLoaded();

      await app.article.expectCommentVisible(commentText, otherUser.username);
      await app.article.expectCannotDeleteComment(commentText);
    });
  });
});
