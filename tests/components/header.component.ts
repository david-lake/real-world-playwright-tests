import { Page, expect } from '@playwright/test';

/**
 * Header component - global navigation available on all pages.
 * Interacts with the actual UI elements (not direct URL navigation).
 * Use this to verify navigation states and click header links.
 */
export class Header {
  constructor(private page: Page) {}

  // --- Navigation Actions (Guest) ---

  async clickSignIn() {
    await this.page.getByRole('link', { name: /sign in/i }).click();
  }

  async clickSignUp() {
    await this.page.getByRole('link', { name: /sign up/i }).click();
  }

  async clickHome() {
    await this.page.getByRole('link', { name: /^home$/i }).click();
  }

  async clickLogo() {
    await this.page.getByRole('link', { name: /conduit/i }).click();
  }

  // --- Navigation Actions (Authenticated) ---

  async clickNewArticle() {
    await this.page.getByRole('link', { name: /new article/i }).click();
  }

  async clickSettings() {
    await this.page.getByRole('link', { name: /^settings$/i }).click();
  }

  async clickProfile(username: string) {
    await this.page.getByRole('link', { name: username }).click();
  }

  // --- State Verification ---

  async isLoggedIn(): Promise<boolean> {
    return await this.page.getByRole('link', { name: /^settings$/i }).isVisible().catch(() => false);
  }

  async isLoggedOut(): Promise<boolean> {
    return await this.page.getByRole('link', { name: /sign in/i }).isVisible().catch(() => false);
  }

  async expectLoggedIn(username: string) {
    // Wait for auth state to settle (loading state resolves)
    await this.page.waitForFunction(
      () => {
        const settings = document.querySelector('nav a[href="/settings"]');
        const signIn = document.querySelector('nav a[href="/login"]');
        return settings !== null || signIn !== null;
      },
      { timeout: 10000 }
    );
    await expect(this.page.getByRole('link', { name: /^settings$/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /new article/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /sign in/i })).not.toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /sign up/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /^settings$/i })).not.toBeVisible();
  }
}