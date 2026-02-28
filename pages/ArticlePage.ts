import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Article Page Object
 * 
 * Encapsulates all interactions with article pages
 * Includes: create, read, edit, delete articles
 */
export class ArticlePage extends BasePage {
  // Locators - Article Form (Create/Edit)
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;

  // Locators - Article View
  readonly articleTitle: Locator;
  readonly articleBody: Locator;
  readonly articleTags: Locator;
  readonly authorName: Locator;
  readonly favoriteButton: Locator;
  readonly followButton: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly comments: Locator;

  constructor(page: Page) {
    super(page);
    
    // Article form locators
    this.titleInput = page.getByRole('textbox', { name: /article title/i });
    this.descriptionInput = page.getByRole('textbox', { name: /what's this article about/i });
    this.bodyInput = page.locator('textarea[placeholder*="Write your article"]');
    this.tagsInput = page.getByRole('textbox', { name: /enter tags/i });
    this.publishButton = page.getByRole('button', { name: /publish article/i });
    this.deleteButton = page.getByRole('button', { name: /delete article/i });
    this.editButton = page.getByRole('link', { name: /edit article/i });

    // Article view locators
    this.articleTitle = page.locator('h1');
    this.articleBody = page.locator('.article-content');
    this.articleTags = page.locator('.tag-list .tag-pill');
    this.authorName = page.locator('.article-meta .author');
    this.favoriteButton = page.getByRole('button', { name: /favorite/i });
    this.followButton = page.getByRole('button', { name: /follow/i });
    this.commentInput = page.getByRole('textbox', { name: /write a comment/i });
    this.postCommentButton = page.getByRole('button', { name: /post comment/i });
    this.comments = page.locator('.card.comment');
  }

  /**
   * Navigate to new article page
   */
  async gotoNewArticle(): Promise<void> {
    await this.page.goto('/editor');
    await this.waitForLoad();
  }

  /**
   * Navigate to article by slug
   */
  async gotoArticle(slug: string): Promise<void> {
    await this.page.goto(`/article/${slug}`);
    await this.waitForLoad();
  }

  /**
   * Create a new article
   */
  async createArticle(
    title: string, 
    description: string, 
    body: string, 
    tags: string[] = []
  ): Promise<void> {
    await this.safeFill(this.titleInput, title);
    await this.safeFill(this.descriptionInput, description);
    await this.safeFill(this.bodyInput, body);
    
    for (const tag of tags) {
      await this.safeFill(this.tagsInput, tag);
      await this.tagsInput.press('Enter');
    }
    
    await this.safeClick(this.publishButton);
  }

  /**
   * Get article title
   */
  async getArticleTitle(): Promise<string | null> {
    return await this.articleTitle.textContent();
  }

  /**
   * Get article body
   */
  async getArticleBody(): Promise<string | null> {
    return await this.articleBody.textContent();
  }

  /**
   * Get all article tags
   */
  async getArticleTags(): Promise<string[]> {
    const tags = await this.articleTags.all();
    const tagTexts: string[] = [];
    for (const tag of tags) {
      const text = await tag.textContent();
      if (text) tagTexts.push(text.trim());
    }
    return tagTexts;
  }

  /**
   * Post a comment
   */
  async postComment(comment: string): Promise<void> {
    await this.safeFill(this.commentInput, comment);
    await this.safeClick(this.postCommentButton);
  }

  /**
   * Get all comments
   */
  async getComments(): Promise<string[]> {
    const comments = await this.comments.all();
    const commentTexts: string[] = [];
    for (const comment of comments) {
      const text = await comment.locator('.card-text').textContent();
      if (text) commentTexts.push(text.trim());
    }
    return commentTexts;
  }

  /**
   * Click favorite button
   */
  async favoriteArticle(): Promise<void> {
    await this.safeClick(this.favoriteButton);
  }

  /**
   * Click delete article button
   */
  async deleteArticle(): Promise<void> {
    await this.safeClick(this.deleteButton);
  }
}
