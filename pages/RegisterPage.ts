import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Register Page Object
 * 
 * Encapsulates all interactions with the registration page
 */
export class RegisterPage extends BasePage {
  // Locators
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly errorMessages: Locator;
  readonly haveAccountLink: Locator;

  constructor(page: Page) {
    super(page, '/register');
    
    // Initialize locators
    this.usernameInput = page.getByRole('textbox', { name: /username/i });
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.signUpButton = page.getByRole('button', { name: /sign up/i });
    this.errorMessages = page.locator('.error-messages li');
    this.haveAccountLink = page.getByRole('link', { name: /have an account/i });
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<void> {
    await this.safeFill(this.usernameInput, username);
    await this.safeFill(this.emailInput, email);
    await this.safeFill(this.passwordInput, password);
    await this.safeClick(this.signUpButton);
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await this.safeClick(this.haveAccountLink);
  }

  /**
   * Get all error messages
   */
  async getErrorMessages(): Promise<string[]> {
    const errors = await this.errorMessages.all();
    const messages: string[] = [];
    for (const error of errors) {
      const text = await error.textContent();
      if (text) messages.push(text);
    }
    return messages;
  }

  /**
   * Check if registration form is displayed
   */
  async isRegistrationFormDisplayed(): Promise<boolean> {
    return await this.usernameInput.isVisible() && 
           await this.emailInput.isVisible() &&
           await this.passwordInput.isVisible();
  }
}
