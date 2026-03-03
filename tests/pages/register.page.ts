import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register');
    await expect(this.page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  }

  async register(username: string, email: string, password: string) {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /sign up/i }).click();
    // Wait for navigation to home page after registration
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  async expectRegistrationSuccess() {
    await expect(this.page).toHaveURL('/');
  }

  async expectRegistrationError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async clickHaveAnAccount() {
    await this.page.getByRole('link', { name: /have an account?/i }).click();
    await expect(this.page).toHaveURL('/login');
  }
}
