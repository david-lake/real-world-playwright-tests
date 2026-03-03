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

    // Check URL - if redirected to home, login succeeded (which shouldn't happen with wrong password)
    const url = this.page.url();
    if (url.includes('/') && !url.includes('/login')) {
      return ''; // Login succeeded unexpectedly
    }

    return '';
  }
}
