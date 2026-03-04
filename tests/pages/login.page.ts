import { Page, expect } from '@playwright/test';
import type { UserData } from '@factories/user.factory';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  }

  async loginAs(user: UserData) {
    await this.page.getByPlaceholder('Email').fill(user.email);
    await this.page.getByPlaceholder('Password').fill(user.password);
    await this.page.getByRole('button', { name: "Sign in" }).click();
  }

  async gotoNeedAnAccount() {
    await this.page.getByRole('link', { name: 'Need an account?' }).click();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
