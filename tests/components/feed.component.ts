import { Page, Locator,expect } from '@playwright/test';

/**
 * Feed component - article list, pagination (load more), tag filters.
 * Used on home page and profile page.
 */
export class FeedComponent {
  readonly articles: Locator;
  readonly sidebar: Locator;

  constructor(private page: Page) {
    this.articles = this.page.locator('ul li:has(h1)');
    this.sidebar = this.page.locator('aside');
  }

  async scrollToLoadMore() {
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await this.page.waitForLoadState('networkidle');
  }

  async expectNoMoreArticles() {
    await expect(this.page.getByText('No More')).toBeVisible();
  }

  async filterByTag(tagName: string) {
    await this.sidebar.getByRole('link', { name: tagName }).click();
  }

  async expectTagFilterActive(tagName: string) {
    await expect(this.page).toHaveURL(new RegExp(`[?&]tag=${tagName}`));
    const tagLink = this.sidebar.getByRole('link', { name: tagName });
    await expect(tagLink).toContainClass('cursor-default');
    await expect(tagLink).toContainClass('underline');
    await expect(tagLink).toContainClass('bg-gray-600');
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

  getArticleCard(title: string) {
    return this.page.locator('li', { has: this.page.getByRole('link', { name: title }) });
  }
  
  favouriteButton(title: string) {
    return this.getArticleCard(title).getByRole('button', { name: 'Toggle Favorite' });
  }
  
  async getFavouriteCount(title: string) {
    const text = (await this.favouriteButton(title).innerText()).trim();
    const match = text.match(/(\d+)\s*$/);
    return Number(match?.[1] ?? 0);
  }
  
  async favouriteArticle(title: string) {
    await this.favouriteButton(title).click();
  }
  
  async unfavouriteArticle(title: string) {
    await this.favouriteButton(title).click();
  }
  
  async expectFavouriteCount(title: string, count: number) {
    await expect(this.favouriteButton(title)).toContainText(String(count));
  }
}
