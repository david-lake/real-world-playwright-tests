import { Page, expect } from '@playwright/test';

/**
 * Header component - global navigation available on all pages.
 * Interacts with the actual UI elements (not direct URL navigation).
 * Use this to verify navigation states and click header links.
 */
export class Header {
  constructor(private page: Page) {}

  // --- State Verification ---

  async isLoggedIn(username: string) {
    // Verify authenticated header state
    await expect(this.page.getByRole('link', { name: "Settings" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: "New article" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
    // Verify no guest links
    await expect(this.page.getByRole('link', { name: "Sign in" })).not.toBeVisible();
  }

  async isLoggedOut() {
    // Verify guest header state
    await expect(this.page.getByRole('link', { name: "Sign in" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: "Sign up" })).toBeVisible();
    // Verify no authenticated links
    await expect(this.page.getByRole('link', { name: "Settings" })).not.toBeVisible();
  }
}
