import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register');
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  }

  async register(username: string, email: string, password: string) {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /sign up/i }).click();
  }

  async getErrorMessage() {
    await this.page.waitForLoadState('networkidle');

    // Check for server error alert (role="alert")
    const alert = this.page.getByRole('alert');
    const alertCount = await alert.count();

    if (alertCount > 0) {
      // Filter to only visible alerts (not sr-only/announcer)
      for (let i = 0; i < alertCount; i++) {
        const locator = alert.nth(i);
        if (await locator.isVisible()) {
          const text = await locator.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      }
    }

    // Check URL - if redirected to home, registration succeeded (which shouldn't happen with duplicate)
    const url = this.page.url();
    if (url.includes('/') && !url.includes('/register')) {
      return '';
    }

    return '';
  }
}
