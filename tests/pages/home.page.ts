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
}