import { Page, expect } from '@playwright/test';
import { safeClick, safeFill } from 'playwright-healer';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async login(email: string, password: string) {
    await safeFill(this.page, 'input[placeholder="Email"]', email);
    await safeFill(this.page, 'input[placeholder="Password"]', password);
    await safeClick(this.page, 'button:has-text("Sign in")');
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/');
  }

  async expectLoginError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async clickNeedAnAccount() {
    await this.page.getByRole('link', { name: /need an account?/i }).click();
    await expect(this.page).toHaveURL('/register');
  }
}
