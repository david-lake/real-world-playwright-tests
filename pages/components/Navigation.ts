import { Page, Locator } from '@playwright/test';

/**
 * Navigation Component Object
 * 
 * Encapsulates interactions with the navigation bar
 * Present on all pages
 */
export class Navigation {
  readonly page: Page;
  
  // Locators
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;
  readonly profileLink: Locator;
  readonly userDropdown: Locator;
  readonly logoutButton: Locator;
  readonly brandLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.homeLink = page.getByRole('link', { name: /home/i });
    this.signInLink = page.getByRole('link', { name: /sign in/i });
    this.signUpLink = page.getByRole('link', { name: /sign up/i });
    this.newArticleLink = page.getByRole('link', { name: /new article/i });
    this.settingsLink = page.getByRole('link', { name: /settings/i });
    this.profileLink = page.locator('[data-testid="nav-profile-link"]');
    this.userDropdown = page.locator('.nav-item.dropdown');
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.brandLogo = page.getByRole('link', { name: /conduit/i });
  }

  /**
   * Navigate to home page
   */
  async goToHome(): Promise<void> {
    await this.homeLink.click();
  }

  /**
   * Navigate to sign in page
   */
  async goToSignIn(): Promise<void> {
    await this.signInLink.click();
  }

  /**
   * Navigate to sign up page
   */
  async goToSignUp(): Promise<void> {
    await this.signUpLink.click();
  }

  /**
   * Navigate to new article page
   */
  async goToNewArticle(): Promise<void> {
    await this.newArticleLink.click();
  }

  /**
   * Navigate to settings page
   */
  async goToSettings(): Promise<void> {
    await this.settingsLink.click();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // If there's a dropdown, click it first
    if (await this.userDropdown.isVisible()) {
      await this.userDropdown.click();
    }
    await this.logoutButton.click();
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.newArticleLink.isVisible();
  }

  /**
   * Check if user is logged out
   */
  async isLoggedOut(): Promise<boolean> {
    return await this.signInLink.isVisible() && await this.signUpLink.isVisible();
  }

  /**
   * Get username from navigation
   */
  async getUsername(): Promise<string | null> {
    const text = await this.userDropdown.textContent();
    return text?.trim() ?? null;
  }
}
