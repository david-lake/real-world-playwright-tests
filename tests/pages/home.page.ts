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
    await expect(this.page.getByRole('heading', { name: /conduit/i })).toBeVisible();
    await expect(this.page.getByText(/a place to share your knowledge/i)).toBeVisible();
  }
}