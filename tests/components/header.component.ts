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

  async gotoLogin() {
    this.nav().getByRole('link', { name: 'Sign in' }).click();
  }

  async gotoRegister() {
    this.nav().getByRole('link', { name: 'Sign up' }).click();
  }

  async gotoNewArticle() {
    this.nav().getByRole('link', { name: 'New Article' }).click();
  }

  async gotoSettings() {
    this.nav().getByRole('link', { name: 'Settings' }).click();
  }

  // --- State Verification ---

  async expectLoggedIn(username: string) {
    // Verify authenticated header state
    await expect(this.nav().getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(this.nav().getByRole('link', { name: 'New Article' })).toBeVisible();
    await expect(this.nav().getByRole('link', { name: username })).toBeVisible();
    // Verify no guest links
    await expect(this.nav().getByRole('link', { name: 'Sign in' })).not.toBeVisible();
  }

  async expectLoggedOut() {
    // Verify guest header state
    await expect(this.nav().getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(this.nav().getByRole('link', { name: 'Sign up' })).toBeVisible();
    // Verify no authenticated links
    await expect(this.nav().getByRole('link', { name: 'Settings' })).not.toBeVisible();
  }
}
