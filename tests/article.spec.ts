// spec: specs/article-test-plan.md

import { test, expect } from '@fixtures/auth.fixture';
import { generateUniqueArticle, createArticle } from '@factories/article.factory';
import { createUser } from '@factories/user.factory';

test.describe('Article', () => {

  test.beforeEach(async ({ app, testUser }) => {
    await app.login.open();
    await app.login.login(testUser.email, testUser.plainPassword);
  });

  test.describe('Creation', () => {
    test('Successful article creation', async ({ app }) => {
      const articleData = generateUniqueArticle();

      await app.header.gotoNewArticle();
      await app.editor.createArticle(articleData);

      await app.article.expectLoaded();
      await app.article.expectCorrectDetails(articleData.title, articleData.body, articleData.tagList)
    });

    test('Article creation validation errors', async ({ app }) => {
      await app.header.gotoNewArticle();

      await expect(app.editor.publishButton()).toBeDisabled();
      await app.editor.triggerValidation();

      await app.editor.expectLoaded();
      await app.editor.expectValidationError('Title is required');
      await app.editor.expectValidationError('Article content is required');
      await app.editor.expectValidationError('Add at least one tag');
    });
  });

  test.describe('Editing', () => {
    test('Edit own article successfully', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id)
      const updatedTitle = `Updated ${Date.now()}`;
      const updatedBody = `Updated body ${Date.now()}`;

      await app.article.open(article.slug)
      await app.article.gotoEdit();
      await app.editor.updateArticle({ title: updatedTitle, body: updatedBody });
      
      await app.article.expectLoaded();
      await app.article.expectCorrectDetails(updatedTitle, updatedBody, article.tagList)
    });

    test('Prevent editing article when not author', async ({ app }) => {
      const author = await createUser();
      const article = await createArticle(author.id);

      await app.article.open(article.slug)

      await app.article.expectCannotEdit();
    });
  });

  test.describe('Favouriting', () => {
    test('Favourite and unfavourite article from global feed', async ({ app }) => {
      const author = await createUser();
      const article = await createArticle(author.id);

      await app.home.gotoGlobalFeed();

      const card = app.home.getArticleCard(article.title);
      const favouriteBtn = card.getByRole('button', { name: 'Toggle Favorite' });

      const initialText = (await favouriteBtn.innerText()).trim();
      const initialCount = Number((initialText.match(/(\d+)\s*$/) ?? [])[1] ?? NaN);
      expect(Number.isFinite(initialCount)).toBeTruthy();

      await favouriteBtn.click();
      await expect(favouriteBtn).toContainText(String(initialCount + 1));
      await favouriteBtn.click();
      await expect(favouriteBtn).toContainText(String(initialCount));
    });
  });

  test.describe('Commenting', () => {
    test('Add comment to own article', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id)
      const commentText = `Test comment ${Date.now()}`;

      await app.article.open(article.slug)
      await app.article.postComment(commentText);

      await app.article.expectCommentVisible(commentText, testUser.username);
    });
  });

  test.describe('Deletion', () => {
    test('Delete own article', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id)

      await app.article.open(article.slug)
      await app.article.delete();

      await app.home.expectLoaded();
      await app.home.expectArticleNotVisible(article.title)
    });

    test('Prevent deleting article when not author', async ({ app }) => {
      const author = await createUser();
      const article = await createArticle(author.id);

      await app.article.open(article.slug)

      await app.article.expectCannotDelete();
    });
  });

  test.describe('Listing & Filters', () => {
    test('Article appears in global feed after creation', async ({ app, testUser }) => {
      const article = await createArticle(testUser.id)

      await app.home.gotoGlobalFeed();

      await app.home.expectArticleVisible(article.title, article.description)
    });
  });
});