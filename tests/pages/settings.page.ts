import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings');
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Your settings' })).toBeVisible();
  }

  async logout() {
    await this.page.getByRole('button', { name: 'or click here to logout' }).click();
  }
}
