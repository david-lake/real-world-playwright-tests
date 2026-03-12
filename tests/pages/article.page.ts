import { Page, expect } from '@playwright/test';

export class ArticlePage {
  constructor(private page: Page) {}

  async open(slug: string) {
    await this.page.goto(`/article/${slug}`);
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async expectCorrectDetails(title: string, body: string, tagList: string[]) {
    await expect(this.page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await expect(this.page.getByText(body)).toBeVisible();
    for (const tag of tagList) {
      await expect(this.page.getByText(tag)).toBeVisible();
    }
  }

  async gotoEdit() {
    await this.page.getByRole('button', { name: 'Edit' }).first().click();
  }

  async delete() {
    await this.page.getByRole('button', { name: 'Delete' }).first().click();
  }

  async postComment(commentBody: string) {
    const textarea = this.page.getByPlaceholder('Write a comment...');
    const postButton = this.page.getByRole('button', { name: 'Post Comment' });

    await expect(textarea).toBeEnabled();
    await textarea.fill(commentBody);
    await expect(postButton).toBeEnabled();
    await postButton.click();
  }

  async expectCommentVisible(commentText: string, authorUsername: string) {
    const commentBody = this.page.getByText(commentText, { exact: true });
    const commentBlock = commentBody.locator('..').locator('..');
    await expect(commentBlock).toContainText(authorUsername);
  }

  commentTextarea() {
    return this.page.getByPlaceholder('Write a comment...');
  }

  async deleteComment(commentText: string) {
    const commentBlock = this.page.locator('div').filter({ hasText: commentText }).first();
    await expect(commentBlock).toBeVisible();
    await commentBlock.getByLabel(/Delete comment/).click();
  }

  async expectCommentNotVisible(commentText: string) {
    const commentBody = this.page.getByText(commentText, { exact: true });
    await expect(commentBody).toHaveCount(0);
  }

  async expectCannotDeleteComment(commentText: string) {
    await expect(this.page.getByLabel(/Delete comment/)).toHaveCount(0);
  }

  async expectCannotEdit() {
    await expect(this.page.getByRole('button', { name: 'Edit' })).not.toBeVisible();
  }

  async expectCannotDelete() {
    await expect(this.page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
  }
}
