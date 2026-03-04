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

  async getErrorMessage(): Promise<string> {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    const text = await alert.textContent();
    return text?.trim() || '';
  }
}
