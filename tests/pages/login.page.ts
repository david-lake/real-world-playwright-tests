import { Page, expect } from '@playwright/test';
import type { UserData } from '@factories/user.factory';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    // Wait for navigation to home page
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  async loginAs(user: UserData) {
    await this.login(user.email, user.password);
  }

  async expectLoginError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async clickNeedAnAccount() {
    await this.page.getByRole('link', { name: /need an account?/i }).click();
    await expect(this.page).toHaveURL('/register');
  }
}
