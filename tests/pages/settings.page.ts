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

  async updateProfile(settings: {
    username?: string;
    email?: string;
    password?: string;
    bio?: string;
    image?: string;
  }) {
    if (settings.username !== undefined) {
      await this.page.getByPlaceholder('Username').fill(settings.username);
    }
    if (settings.email !== undefined) {
      await this.page.getByPlaceholder('Email').fill(settings.email);
    }
    if (settings.password !== undefined) {
      await this.page.getByPlaceholder('New Password').fill(settings.password);
    }
    if (settings.bio !== undefined) {
      await this.page.getByPlaceholder('Short bio about you').fill(settings.bio);
    }
    if (settings.image !== undefined) {
      await this.page.getByPlaceholder('URL of profile picture').fill(settings.image);
    }
    await this.page.getByRole('button', { name: /update settings/i }).click();
  }

  async getBioValue() {
    return this.page.getByPlaceholder('Short bio about you').inputValue();
  }

  async waitForUpdateSuccess() {
    // Wait for the page heading to be visible again (confirms update completed)
    await expect(this.page.getByRole('heading', { name: /your settings/i })).toBeVisible();
    // Small delay to ensure data is persisted
    await this.page.waitForTimeout(500);
  }
}
