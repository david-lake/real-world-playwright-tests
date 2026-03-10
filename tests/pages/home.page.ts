import { Page, expect } from '@playwright/test';

/**
 * Home page - global feed and main landing page
 */
export class HomePage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/')
    await expect(this.page.getByRole('heading', { name: 'Conduit' })).toBeVisible();
  }

  async gotoGlobalFeed() {
    await this.page.getByRole('link', { name: 'Global Feed' }).click();
  }

  async expectArticleVisible(articleTitle: string, articleDescription: string) {
    await expect(this.page.getByRole('link', { name: articleTitle })).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText(articleDescription)).toBeVisible();
  }

  async expectArticleNotVisible(articleTitle: string) {
    await expect(this.page.getByRole('link', { name: articleTitle })).not.toBeVisible();
  }

  getArticleCard(articleTitle: string) {
    return this.page
      .locator('li', { has: this.page.getByRole('link', { name: articleTitle }) })
      .first();
  }
}