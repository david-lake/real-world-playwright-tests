import { Page, expect } from '@playwright/test';

/**
 * User profile page with My Articles and Favorited Articles tabs.
 */
export class ProfilePage {
  constructor(private page: Page) {}

  async open(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  async expectLoaded(username: string) {
    await expect(this.page.getByRole('heading', { name: username, level: 4 })).toBeVisible();
  }

  async gotoMyArticles() {
    await this.page.getByRole('link', { name: 'My Articles' }).click();
  }

  async gotoFavoritedArticles() {
    await this.page.getByRole('link', { name: 'Favorited Articles' }).click();
  }

  async expectMyArticlesTabActive() {
    const myArticlesLink = this.page.getByRole('link', { name: 'My Articles' });
    await expect(myArticlesLink).toHaveClass(/cursor-default|text-primary|border-primary/);
  }

  async expectFavoritedArticlesTabActive() {
    const favoritedLink = this.page.getByRole('link', { name: 'Favorited Articles' });
    await expect(favoritedLink).toHaveClass(/cursor-default|text-primary|border-primary/);
  }
}
