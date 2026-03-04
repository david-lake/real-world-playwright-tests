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

  async updateBio(bio: string) {
    await this.page.getByPlaceholder('Short bio about you').fill(bio);
  }

  async updateImage(imageUrl: string) {
    await this.page.getByPlaceholder('URL of profile picture').fill(imageUrl);
  }

  async updateUsername(username: string) {
    await this.page.getByPlaceholder('Username').fill(username);
  }

  async updateEmail(email: string) {
    await this.page.getByPlaceholder('Email').fill(email);
  }

  async updatePassword(password: string) {
    await this.page.getByPlaceholder('New Password').fill(password);
  }

  async saveChanges() {
    await this.page.getByRole('button', { name: /update settings/i }).click();
  }

  async expectUpdateSuccess() {
    await expect(this.page.getByText(/settings updated successfully/i)).toBeVisible();
  }

  async expectBio(expectedBio: string) {
    await expect(this.page.getByPlaceholder('Short bio about you')).toHaveValue(expectedBio);
  }

  async expectImage(expectedImage: string) {
    await expect(this.page.getByPlaceholder('URL of profile picture')).toHaveValue(expectedImage);
  }

  async getAuthToken(): Promise<string | null> {
    return this.page.evaluate(() => localStorage.getItem('token'));
  }
}
