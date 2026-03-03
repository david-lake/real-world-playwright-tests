import { Page, expect } from '@playwright/test';

export class NavigationComponent {
  constructor(private page: Page) {}

  async gotoHome() {
    await this.page.goto('/');
  }

  async gotoLogin() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async gotoRegister() {
    await this.page.goto('/register');
    await expect(this.page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  }

  async gotoSettings() {
    await this.page.goto('/settings');
    await expect(this.page.getByRole('heading', { name: /your settings/i })).toBeVisible();
  }

  async gotoEditor() {
    await this.page.goto('/editor');
  }
}
