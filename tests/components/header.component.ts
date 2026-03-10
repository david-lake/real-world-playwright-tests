import { Page, expect } from '@playwright/test';

/**
 * Header component - global navigation available on all pages.
 * Interacts with the actual UI elements (not direct URL navigation).
 * Use this to verify navigation states and click header links.
 */
export class Header {
  constructor(private page: Page) {}

  private nav() {
    return this.page.locator('#navbar-default');
  }

  async gotoNewArticle() {
    this.nav().getByRole('link', { name: 'New Article' }).click();
  }

  // --- State Verification ---

  async isLoggedIn(username: string) {
    // Verify authenticated header state
    await expect(this.nav().getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(this.nav().getByRole('link', { name: 'New Article' })).toBeVisible();
    await expect(this.nav().getByRole('link', { name: username })).toBeVisible();
    // Verify no guest links
    await expect(this.nav().getByRole('link', { name: 'Sign in' })).not.toBeVisible();
  }

  async isLoggedOut() {
    // Verify guest header state
    await expect(this.nav().getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(this.nav().getByRole('link', { name: 'Sign up' })).toBeVisible();
    // Verify no authenticated links
    await expect(this.nav().getByRole('link', { name: 'Settings' })).not.toBeVisible();
  }
}
