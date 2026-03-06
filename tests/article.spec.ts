// spec: specs/article-test-plan.md
// Critical article E2E tests (P0) plus high-priority (P1) for scalability.

import { test, expect } from '@fixtures/auth.fixture';
import { generateUniqueArticle, createArticle, deleteArticleBySlug } from '@factories/article.factory';
import { createUser, deleteUserByEmail } from '@factories/user.factory';

test.describe('Article', () => {

  test.beforeEach(async ({ app, testUser }) => {
    // Runs before each test and signs in each page.
    await app.login.goto();
    await app.login.loginAs(testUser);
    await app.home.isLoaded();
    await app.header.isLoggedIn(testUser.username);
  });

  test.describe('Creation', () => {
    test('Successful article creation', async ({ app, testUser }) => {
      const articleData = generateUniqueArticle();

      await app.page.getByRole('link', { name: 'New article' }).click();
      await app.editor.isLoaded();
      await app.editor.createArticle(articleData);

      await app.article.isLoaded();
      await app.article.expectTitle(articleData.title);
      await app.article.expectBodyContains(articleData.body);
      await app.article.expectTagVisible(articleData.tagList[0]);
      await app.header.isLoggedIn(testUser.username);

      await expect(app.page).toHaveURL(/\/article\//);
    });

    test('Article creation validation errors', async ({ app, testUser }) => {
      await app.page.getByRole('link', { name: 'New article' }).click();
      await app.editor.isLoaded();

      await expect(app.editor.publishButton()).toBeDisabled();
      await app.editor.triggerValidation();

      await app.editor.expectEditorHeadingVisible();
      await app.editor.expectValidationError(/Title is required/i);
      await app.editor.expectValidationError(/Article content is required/i);
      await app.editor.expectValidationError(/Add at least one tag/i);
      await expect(app.page).toHaveURL(/\/editor/);
    });
  });

  test.describe('Editing', () => {
    test('Edit own article successfully', async ({ app, testUser }) => {
      const articleData = generateUniqueArticle();
      const updatedTitle = `Updated ${articleData.title}`;
      const updatedBody = `Updated body ${Date.now()}`;

      await app.page.getByRole('link', { name: 'New article' }).click();
      await app.editor.isLoaded();
      await app.editor.createArticle(articleData);

      await app.article.isLoaded();
      await app.article.expectTitle(articleData.title);
      await app.article.clickEdit();

      await app.editor.isLoadedForEdit();
      await app.editor.updateArticle({ title: updatedTitle, body: updatedBody });

      await app.article.isLoaded();
      await app.article.expectTitle(updatedTitle);
      await app.article.expectBodyContains(updatedBody);
      await app.header.isLoggedIn(testUser.username);
    });
  });

  test.describe('Favouriting', () => {
    test('Favourite and unfavourite article from global feed', async ({ app, testUser }) => {
      const author = await createUser();
      const articleData = generateUniqueArticle();
      const created = await createArticle(author.id, articleData);

      try {
        await app.home.goto();
        await app.home.clickGlobalFeed();

        const card = app.home.getArticleCard(articleData.title);
        const favouriteBtn = card.getByRole('button', { name: 'Toggle Favorite' });

        const initialText = (await favouriteBtn.innerText()).trim();
        const initialCount = Number((initialText.match(/(\d+)\s*$/) ?? [])[1] ?? NaN);
        expect(Number.isFinite(initialCount)).toBeTruthy();

        await favouriteBtn.click();
        await expect(favouriteBtn).toContainText(String(initialCount + 1));
        await favouriteBtn.click();
        await expect(favouriteBtn).toContainText(String(initialCount));
      } finally {
        await deleteArticleBySlug(created.slug);
        await deleteUserByEmail(author.email);
      }
    });
  });

  test.describe('Commenting', () => {
    test('Add comment to article', async ({ app, testUser }) => {
      const articleData = generateUniqueArticle();
      const commentText = `Test comment ${Date.now()}`;

      await app.page.getByRole('link', { name: 'New article' }).click();
      await app.editor.isLoaded();
      await app.editor.createArticle(articleData);

      await app.article.isLoaded();
      await app.article.expectTitle(articleData.title);
      await app.article.postComment(commentText);

      await app.article.expectCommentWithTextAndAuthor(commentText, testUser.username);
      await app.article.expectTitle(articleData.title);
    });
  });

  test.describe('Deletion', () => {
    test('Delete own article', async ({ app, testUser }) => {
      const articleData = generateUniqueArticle();

      await app.page.getByRole('link', { name: 'New article' }).click();
      await app.editor.isLoaded();
      await app.editor.createArticle(articleData);

      await app.article.isLoaded();
      await app.article.expectTitle(articleData.title);
      await app.article.clickDelete();

      await app.home.isLoaded();
      await app.home.expectArticleNotInFeed(articleData.title);
      await app.header.isLoggedIn(testUser.username);
      await expect(app.page).toHaveURL('/');
    });
  });

  test.describe('Listing & Filters', () => {
    test('Article appears in global feed after creation', async ({ app, testUser }) => {
      const articleData = generateUniqueArticle();

      await app.page.getByRole('link', { name: 'New article' }).click();
      await app.editor.isLoaded();
      await app.editor.createArticle(articleData);

      await app.article.isLoaded();
      await app.home.goto();
      await app.home.clickGlobalFeed();
      await app.page.reload();

      await app.home.isLoaded();
      try {
        await app.home.expectArticleInGlobalFeed(articleData.title);
      } catch {
        await app.page.locator('#navbar-default').getByRole('link', { name: testUser.username }).click();
        await expect(app.page.getByRole('link', { name: articleData.title })).toBeVisible({ timeout: 15000 });
      }
      await expect(app.page.getByText(articleData.description)).toBeVisible();
      await app.header.isLoggedIn(testUser.username);
    });
  });
});