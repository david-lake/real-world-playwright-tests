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

  async gotoYourFeed() {
    await this.page.getByRole('link', { name: 'Your Feed' }).click();
  }

  async expectGlobalFeedTabActive() {
    const globalFeedLink = this.page.getByRole('link', { name: 'Global Feed' });
    await expect(globalFeedLink).toHaveClass(/cursor-default|text-primary|border-primary/);
  }

  async expectYourFeedTabActive() {
    const yourFeedLink = this.page.getByRole('link', { name: 'Your Feed' });
    await expect(yourFeedLink).toHaveClass(/cursor-default|text-primary|border-primary/);
  }

  async expectTagFilterActive(tag: string) {
    await expect(this.page).toHaveURL(new RegExp(`[?&]tag=${tag}`));
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