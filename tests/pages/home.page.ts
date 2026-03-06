import { Page, expect } from '@playwright/test';

/**
 * Home page - global feed and main landing page
 */
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Conduit' })).toBeVisible();
    await expect(this.page.getByText('a place to share your knowledge')).toBeVisible();
  }

  expectArticleInGlobalFeed(articleTitle: string) {
    return expect(this.page.getByRole('link', { name: articleTitle })).toBeVisible({ timeout: 15000 });
  }

  expectArticleNotInFeed(articleTitle: string) {
    return expect(this.page.getByRole('link', { name: articleTitle })).not.toBeVisible();
  }

  getArticleCard(articleTitle: string) {
    return this.page
      .locator('li', { has: this.page.getByRole('link', { name: articleTitle }) })
      .first();
  }

  async clickTag(tagName: string) {
    await this.page.getByRole('link', { name: tagName }).first().click();
  }

  async clickGlobalFeed() {
    await this.page.getByRole('link', { name: 'Global Feed' }).click();
  }

  expectTagFilterActive(tagName: string) {
    return expect(this.page.getByRole('link', { name: `# ${tagName}` }).or(this.page.getByText(`# ${tagName}`))).toBeVisible();
  }
}