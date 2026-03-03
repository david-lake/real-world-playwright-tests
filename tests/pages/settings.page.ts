import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings');
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: /your settings/i })).toBeVisible();
  }

  async logout() {
    await this.page.getByRole('button', { name: /click here to logout/i }).click();
  }
}
