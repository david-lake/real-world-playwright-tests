import { Page, expect } from '@playwright/test';

/**
 * Article detail page (/article/[slug]).
 */
export class ArticlePage {
  constructor(private page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  expectTitle(title: string) {
    return expect(this.page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  }

  expectBodyContains(text: string) {
    return expect(this.page.getByText(text)).toBeVisible();
  }

  expectTagVisible(tagName: string) {
    return expect(this.page.getByRole('link', { name: tagName }).or(this.page.getByText(tagName).first())).toBeVisible();
  }

  async clickEdit() {
    await this.page.getByRole('button', { name: 'Edit' }).first().click();
  }

  async clickDelete() {
    await this.page.getByRole('button', { name: 'Delete' }).first().click();
  }

  expectEditButtonVisible() {
    return expect(this.page.getByRole('button', { name: 'Edit' })).toBeVisible();
  }

  expectEditButtonNotVisible() {
    return expect(this.page.getByRole('button', { name: 'Edit' })).not.toBeVisible();
  }

  expectDeleteButtonVisible() {
    return expect(this.page.getByRole('button', { name: 'Delete' })).toBeVisible();
  }

  expectDeleteButtonNotVisible() {
    return expect(this.page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
  }

  async expectEditAndDeleteNotVisible() {
    await this.expectEditButtonNotVisible();
    await this.expectDeleteButtonNotVisible();
  }

  async postComment(commentBody: string) {
    const textarea = this.page.getByPlaceholder('Write a comment...');
    const postButton = this.page.getByRole('button', { name: 'Post Comment' });

    await expect(textarea).toBeEnabled();
    await textarea.fill(commentBody);
    await expect(postButton).toBeEnabled();
    await postButton.click();
  }

  expectCommentFormVisible() {
    return expect(this.page.getByPlaceholder('Write a comment...')).toBeVisible();
  }

  expectCommentFormNotVisible() {
    return expect(this.page.getByPlaceholder('Write a comment...')).not.toBeVisible();
  }

  async expectSignInPromptVisible() {
    await expect(this.page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  }

  expectCommentWithTextAndAuthor(commentText: string, authorUsername: string) {
    const commentBlock = this.page.locator('li').filter({ hasText: commentText });
    return expect(commentBlock).toContainText(authorUsername);
  }
}
