import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Feed Page Object
 * 
 * Encapsulates all interactions with the home/feed page
 */
export class FeedPage extends BasePage {
  // Locators
  readonly globalFeedTab: Locator;
  readonly yourFeedTab: Locator;
  readonly articlePreviews: Locator;
  readonly popularTags: Locator;
  readonly pagination: Locator;
  readonly loadingIndicator: Locator;
  readonly emptyFeedMessage: Locator;

  constructor(page: Page) {
    super(page, '/');
    
    // Initialize locators
    this.globalFeedTab = page.getByRole('link', { name: /global feed/i });
    this.yourFeedTab = page.getByRole('link', { name: /your feed/i });
    this.articlePreviews = page.locator('.article-preview');
    this.popularTags = page.locator('.tag-pill');
    this.pagination = page.locator('.pagination');
    this.loadingIndicator = page.locator('[role="status"]');
    this.emptyFeedMessage = page.getByText(/no articles are here/i);
  }

  /**
   * Click on Global Feed tab
   */
  async clickGlobalFeed(): Promise<void> {
    await this.safeClick(this.globalFeedTab);
    await this.waitForArticlesToLoad();
  }

  /**
   * Click on Your Feed tab
   */
  async clickYourFeed(): Promise<void> {
    await this.safeClick(this.yourFeedTab);
    await this.waitForArticlesToLoad();
  }

  /**
   * Wait for articles to load
   */
  async waitForArticlesToLoad(): Promise<void> {
    // Wait for loading to complete
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Get count of article previews
   */
  async getArticleCount(): Promise<number> {
    return await this.articlePreviews.count();
  }

  /**
   * Click on article by title
   */
  async clickArticleByTitle(title: string): Promise<void> {
    const article = this.articlePreviews.filter({ hasText: title });
    await article.locator('h1').click();
  }

  /**
   * Click on a tag to filter
   */
  async filterByTag(tag: string): Promise<void> {
    const tagLink = this.popularTags.filter({ hasText: tag });
    await tagLink.click();
  }

  /**
   * Get all popular tags
   */
  async getPopularTags(): Promise<string[]> {
    const tags = await this.popularTags.all();
    const tagTexts: string[] = [];
    for (const tag of tags) {
      const text = await tag.textContent();
      if (text) tagTexts.push(text.trim());
    }
    return tagTexts;
  }

  /**
   * Check if feed is empty
   */
  async isFeedEmpty(): Promise<boolean> {
    return await this.emptyFeedMessage.isVisible();
  }

  /**
   * Get article preview data
   */
  async getArticlePreview(index: number): Promise<{
    title: string | null;
    description: string | null;
    author: string | null;
    date: string | null;
  }> {
    const article = this.articlePreviews.nth(index);
    return {
      title: await article.locator('h1').textContent(),
      description: await article.locator('p').textContent(),
      author: await article.locator('.author').textContent(),
      date: await article.locator('.date').textContent(),
    };
  }
}
