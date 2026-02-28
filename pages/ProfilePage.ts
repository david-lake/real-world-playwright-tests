import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Profile Page Object
 * 
 * Encapsulates all interactions with user profile pages
 */
export class ProfilePage extends BasePage {
  // Locators
  readonly username: Locator;
  readonly bio: Locator;
  readonly profileImage: Locator;
  readonly editProfileButton: Locator;
  readonly followButton: Locator;
  readonly myArticlesTab: Locator;
  readonly favoritedArticlesTab: Locator;
  readonly articlePreviews: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.username = page.locator('.user-info h4');
    this.bio = page.locator('.user-info p');
    this.profileImage = page.locator('.user-info img');
    this.editProfileButton = page.getByRole('link', { name: /edit profile settings/i });
    this.followButton = page.getByRole('button', { name: /follow|unfollow/i });
    this.myArticlesTab = page.getByRole('link', { name: /my articles/i });
    this.favoritedArticlesTab = page.getByRole('link', { name: /favorited articles/i });
    this.articlePreviews = page.locator('.article-preview');
  }

  /**
   * Navigate to a user's profile
   */
  async gotoProfile(username: string): Promise<void> {
    await this.page.goto(`/profile/${username}`);
    await this.waitForLoad();
  }

  /**
   * Get username displayed on profile
   */
  async getUsername(): Promise<string | null> {
    return await this.username.textContent();
  }

  /**
   * Get bio text
   */
  async getBio(): Promise<string | null> {
    return await this.bio.textContent();
  }

  /**
   * Click edit profile button
   */
  async clickEditProfile(): Promise<void> {
    await this.safeClick(this.editProfileButton);
  }

  /**
   * Click follow/unfollow button
   */
  async toggleFollow(): Promise<void> {
    await this.safeClick(this.followButton);
  }

  /**
   * Check if currently following
   */
  async isFollowing(): Promise<boolean> {
    const text = await this.followButton.textContent();
    return text?.toLowerCase().includes('unfollow') ?? false;
  }

  /**
   * Click on My Articles tab
   */
  async clickMyArticles(): Promise<void> {
    await this.safeClick(this.myArticlesTab);
  }

  /**
   * Click on Favorited Articles tab
   */
  async clickFavoritedArticles(): Promise<void> {
    await this.safeClick(this.favoritedArticlesTab);
  }

  /**
   * Get count of articles displayed
   */
  async getArticleCount(): Promise<number> {
    return await this.articlePreviews.count();
  }

  /**
   * Check if this is the current user's own profile
   */
  async isOwnProfile(): Promise<boolean> {
    return await this.editProfileButton.isVisible();
  }
}
