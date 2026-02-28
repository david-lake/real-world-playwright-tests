import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object
 * 
 * Encapsulates all interactions with the login page
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly needAccountLink: Locator;

  constructor(page: Page) {
    super(page, '/login');
    
    // Initialize locators using role-based selectors (accessible, resilient)
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.locator('.error-messages li');
    this.needAccountLink = page.getByRole('link', { name: /need an account/i });
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.safeFill(this.emailInput, email);
    await this.safeFill(this.passwordInput, password);
    await this.safeClick(this.signInButton);
  }

  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await this.safeClick(this.needAccountLink);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Check if login form is displayed
   */
  async isLoginFormDisplayed(): Promise<boolean> {
    return await this.emailInput.isVisible() && 
           await this.passwordInput.isVisible();
  }
}
