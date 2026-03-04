import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings');
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: "Your settings" })).toBeVisible();
  }

  async updateBio(bio: string) {
    await this.page.getByPlaceholder('Short bio about you').fill(bio);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Update Settings' }).click();
  }

  async expectBio(bio: string) {
    await expect(this.page.getByPlaceholder('Short bio about you')).toHaveValue(bio);
  }

  async logout() {
    await this.page.getByRole('button', { name: /click here to logout/i }).click();
  }
}
