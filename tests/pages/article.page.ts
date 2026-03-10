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
    const commentBlock = this.page.locator('li').filter({ hasText: commentText });
    await expect(commentBlock).toContainText(authorUsername);
  }
}
