import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings');
  }

  async logout() {
    await this.page.getByRole('button', { name: /click here to logout/i }).click();
  }

  async expectLoggedOut() {
    await expect(this.page).toHaveURL('/');
  }

  async updateSettings(settings: { username?: string; email?: string; bio?: string; image?: string; password?: string }) {
    if (settings.username) {
      await this.page.getByPlaceholder('Your name').fill(settings.username);
    }
    if (settings.email) {
      await this.page.getByPlaceholder('Email').fill(settings.email);
    }
    if (settings.bio) {
      await this.page.getByPlaceholder('Short bio about you').fill(settings.bio);
    }
    if (settings.image) {
      await this.page.getByPlaceholder(/URL of profile picture/i).fill(settings.image);
    }
    if (settings.password) {
      await this.page.getByPlaceholder('Password').fill(settings.password);
    }
    await this.page.getByRole('button', { name: /update settings/i }).click();
  }

  async expectUpdateSuccess() {
    await expect(this.page.getByText(/user updated!/i)).toBeVisible();
  }

  async expectUpdateError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
