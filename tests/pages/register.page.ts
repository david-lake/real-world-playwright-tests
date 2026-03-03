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
    // Wait for either form validation errors or server error alert
    await this.page.waitForLoadState('networkidle');

    // First check for field-level error messages
    const errorMessages = this.page.locator('p.text-red-600');
    const count = await errorMessages.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await errorMessages.nth(i).textContent();
        if (text && text.trim()) {
          return text.trim();
        }
      }
    }

    // Check for server error alert - use more specific locator (exclude route announcer)
    const alert = this.page.locator('[role="alert"].my-2');
    if (await alert.count() > 0) {
      const text = await alert.textContent();
      if (text && text.trim()) {
        return text.trim();
      }
    }

    // Check URL - if redirected to home, registration succeeded (which shouldn't happen with duplicate)
    const url = this.page.url();
    if (url.includes('/') && !url.includes('/register')) {
      return ''; // Registration succeeded unexpectedly
    }

    return '';
  }

  async gotoHaveAnAccount() {
    await this.page.getByRole('link', { name: /have an account?/i }).click();
    await expect(this.page).toHaveURL('/login');
  }
}
