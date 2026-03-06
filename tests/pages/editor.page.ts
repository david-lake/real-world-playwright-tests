import { Page, expect } from '@playwright/test';
import type { ArticleData } from '@factories/article.factory';

/**
 * Article editor page (new article and edit article).
 * /editor and /editor/[slug]
 */
export class EditorPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/editor');
  }

  async isLoaded() {
    await expect(this.page.getByPlaceholder('Article title')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Publish Article' })).toBeVisible();
  }

  async isLoadedForEdit() {
    await expect(this.page.getByPlaceholder('Article title')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Publish Article' })).toBeVisible();
  }

  async createArticle(data: ArticleData) {
    await this.page.getByPlaceholder('Article title').fill(data.title);
    await this.page.getByPlaceholder("What's this article about?").fill(data.description);
    await this.page.getByPlaceholder('Write your article (in markdown)').fill(data.body);
    const tagInput = this.page.getByPlaceholder('Enter tags');
    for (const tag of data.tagList) {
      await tagInput.fill(tag);
      await tagInput.press('Enter');
    }
    await this.page.getByRole('button', { name: 'Publish Article' }).click();
  }

  async updateArticle(data: Partial<ArticleData>) {
    if (data.title !== undefined) {
      await this.page.getByPlaceholder('Article title').fill(data.title);
    }
    if (data.description !== undefined) {
      await this.page.getByPlaceholder("What's this article about?").fill(data.description);
    }
    if (data.body !== undefined) {
      await this.page.getByPlaceholder('Write your article (in markdown)').fill(data.body);
    }
    await this.page.getByRole('button', { name: 'Publish Article' }).click();
  }

  publishButton() {
    return this.page.getByRole('button', { name: 'Publish Article' });
  }

  async triggerValidation() {
    const title = this.page.getByPlaceholder('Article title');
    await title.fill('x');
    await title.fill('');

    const body = this.page.getByPlaceholder('Write your article (in markdown)');
    await body.fill('x');
    await body.fill('');

    await this.page.getByPlaceholder('Enter tags').focus();
    await this.page.getByPlaceholder('Enter tags').blur();
  }

  expectValidationError(message: string | RegExp) {
    return expect(this.page.getByText(message)).toBeVisible();
  }

  expectEditorHeadingVisible() {
    return expect(this.page.getByPlaceholder('Article title')).toBeVisible();
  }
}
