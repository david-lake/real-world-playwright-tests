import { Page, expect } from '@playwright/test';
import type { UserData } from '@factories/user.factory';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async loginAs(user: UserData) {
    await this.page.getByPlaceholder('Email').fill(user.email);
    await this.page.getByPlaceholder('Password').fill(user.password);
    await this.page.getByRole('button', { name: "Sign in" }).click();
  }

  async loginWith(email: string, password: string) {
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: "Sign in" }).click();
  }

  async gotoNeedAnAccount() {
    await this.page.getByRole('link', { name: /need an account?/i }).click();
    await expect(this.page).toHaveURL('/register');
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

    // Check URL - if redirected to home, login succeeded (which shouldn't happen with wrong password)
    const url = this.page.url();
    if (url.includes('/') && !url.includes('/login')) {
      return '';
    }

    return '';
  }
}
