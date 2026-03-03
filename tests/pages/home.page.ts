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

  async isLoggedIn(username: string) {
    // Wait for auth state to settle (either authenticated or guest nav items appear)
    await this.page.waitForFunction(
      () => {
        const settings = document.querySelector('nav a[href="/settings"]');
        const signIn = document.querySelector('nav a[href="/login"]');
        return settings !== null || signIn !== null;
      },
      { timeout: 10000 }
    );
    // Verify authenticated header state
    await expect(this.page.getByRole('link', { name: /^settings$/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /new article/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
    // Verify no guest links
    await expect(this.page.getByRole('link', { name: /sign in/i })).not.toBeVisible();
  }

  async isLoggedOut() {
    // Verify guest header state
    await expect(this.page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /sign up/i })).toBeVisible();
    // Verify no authenticated links
    await expect(this.page.getByRole('link', { name: /^settings$/i })).not.toBeVisible();
  }
}