import { Page, expect } from '@playwright/test';

/**
 * Feed component - article list, pagination (load more), tag filters.
 * Used on home page and profile page.
 */
export class FeedComponent {
  constructor(private page: Page) {}

  getArticleCards() {
    return this.page.locator('ul li:has(h1)');
  }

  async getArticleCardCount(): Promise<number> {
    return this.getArticleCards().count();
  }

  async scrollToLoadMore() {
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await this.page.waitForLoadState('networkidle');
  }

  async expectNoMoreButtonVisible() {
    await expect(this.page.getByText('No More')).toBeVisible();
  }

  async expectNoMoreButtonNotVisible() {
    await expect(this.page.getByRole('button', { name: 'No More' })).not.toBeVisible();
  }
}
