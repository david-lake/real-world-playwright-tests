import { Page, Locator,expect } from '@playwright/test';

/**
 * Feed component - article list, pagination (load more), tag filters.
 * Used on home page and profile page.
 */
export class FeedComponent {
  readonly articles: Locator;

  constructor(private page: Page) {
    this.articles = this.page.locator('ul li:has(h1)');
  }

  async scrollToLoadMore() {
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await this.page.waitForLoadState('networkidle');
  }

  async expectNoMoreArticles() {
    await expect(this.page.getByText('No More')).toBeVisible();
  }

  async filterByTag(tagName: string) {
    await this.page.locator('aside').getByRole('link', { name: tagName }).click();
  }

  async expectArticleVisible(title: string) {
    await expect(this.page.getByRole('link', { name: title })).toBeVisible();
  }

  async expectArticleNotVisible(title: string) {
    await expect(this.page.getByRole('link', { name: title })).not.toBeVisible();
  }

  async expectNoArticles() {
    await expect(this.page.getByText("No articles are here")).toBeVisible();
  }
}
