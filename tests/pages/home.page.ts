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